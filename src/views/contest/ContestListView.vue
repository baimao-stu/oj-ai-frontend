<template>
  <div id="ContestListView">
    <a-form :model="searchParams" layout="inline">
      <a-form-item
        field="title"
        label="标题"
        style="min-width: 240px"
        :label-col-style="{ fontWeight: 'bold' }"
      >
        <a-input v-model="searchParams.title" placeholder="请输入标题" />
      </a-form-item>
      <a-form-item
        field="tags"
        label="举办者"
        style="min-width: 240px"
        :label-col-style="{ fontWeight: 'bold' }"
      >
        <a-input v-model="searchParams.userName" placeholder="请输入举办者" />
      </a-form-item>
      <a-form-item
        field="type"
        label="比赛类型"
        style="min-width: 240px"
        :label-col-style="{ fontWeight: 'bold' }"
      >
        <a-select
          allow-clear
          v-model="searchParams.type"
          :style="{ width: '120px' }"
          placeholder="请选择比赛类型"
          :options="type"
        >
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="doSubmit">提交</a-button>
      </a-form-item>
    </a-form>
    <a-divider size="0" />

    <a-table
      :columns="columns"
      :data="dataList"
      :pagination="{
        total,
        current: searchParams.current,
        pageSize: searchParams.pageSize,
        showTotal: true,
      }"
      @page-change="onPageChange"
      column-resizable
      :table-layout-fixed="true"
    >
      <template #status="{ record }">
        <span
          v-if="record.startTime < nowTime && record.endTime > nowTime"
          style="font-size: 18px; color: #4646f6; font-weight: bold"
        >
          正在进行
        </span>
        <span
          v-else-if="record.endTime < nowTime"
          style="font-size: 18px; color: #fa2e2e; font-weight: bold"
        >
          已结束
        </span>
        <span v-else style="font-size: 18px; color: #00b42a; font-weight: bold">
          未开始
        </span>
      </template>
      <template #title="{ record }">
        <span @click="toContestPage(record)" class="question_title">{{
          record.title
        }}</span>
      </template>
      <template #type="{ record }">
        <a-tag v-if="record.type === 0" color="#00b42a" style="font-size: 15px">
          <span> 基础 </span>
        </a-tag>
        <a-tag
          v-else-if="record.type === 1"
          color="#165dff"
          style="font-size: 15px"
        >
          <span> 提高 </span>
        </a-tag>
        <a-tag v-else color="#f53f3f" style="font-size: 15px">
          <span> 进阶 </span>
        </a-tag>
      </template>
      <template #rangeTime="{ record }">
        <a-space color="#3b3b3b" style="font-size: 15px">
          <a-tag color="green" style="font-size: 15px">
            {{
              moment(record.startTime)
                .utcOffset(8)
                .format("YYYY-MM-DD HH:mm:ss")
            }}
          </a-tag>
        </a-space>
        -
        <a-space color="#3b3b3b" style="font-size: 15px">
          <a-tag color="red" style="font-size: 15px">
            {{
              moment(record.endTime).utcOffset(8).format("YYYY-MM-DD HH:mm:ss")
            }}
          </a-tag>
        </a-space>
      </template>
      <template #holder="{ record }">
        <span class="question_title">{{ record.userVO.userName }}</span>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import {
  ContestControllerService,
  ContestQueryRequest,
  ContestVO,
  Question,
} from "../../../generated/";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import moment from "moment/moment";

//当前时间
const nowTime = ref();

const type = ref([
  {
    label: "基础",
    value: 0,
  },
  {
    label: "提高",
    value: 1,
  },
  {
    label: "进阶",
    value: 2,
  },
]);

const dataList = ref([]);
const total = ref(0);
const searchParams = ref<ContestQueryRequest>({
  title: "",
  userName: "",
  type: undefined,
  current: 1,
  pageSize: 6,
  sortOrder: "descend",
  sortField: "createTime",
});
/** 加载分页数据*/
const loadData = async () => {
  const res = await ContestControllerService.listContestVoByPageUsingPost(
    searchParams.value
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
    console.log("比赛列表", dataList.value);
  } else {
    message.error("请求失败，" + res.message);
  }

  nowTime.value = moment().format("YYYY-MM-DD HH:mm:ss");
  console.log("当前时间：" + nowTime.value);
};
/** 监听 loadData 的响应式依赖，如 searchParams改变时重新执行 loadData */
watchEffect(() => {
  loadData();
  console.log("watchEffect");
});

onMounted(() => {
  loadData();
});

// 切换页码
const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page,
  };
};

const columns = [
  {
    title: "状态",
    slotName: "status",
    headerCellStyle: {
      fontWeight: "bold",
    },
  },
  {
    title: "标题",
    slotName: "title",
    headerCellStyle: {
      fontWeight: "bold",
    },
  },
  {
    title: "类型",
    slotName: "type",
    headerCellStyle: {
      fontWeight: "bold",
    },
  },
  {
    title: "起止时间",
    slotName: "rangeTime",
    headerCellStyle: {
      fontWeight: "bold",
    },
  },
  {
    title: "举办者",
    slotName: "holder",
    headerCellStyle: {
      fontWeight: "bold",
    },
  },
];

//提交条件查询表单后 searchParams 发生变化被 watchEffect 监听到执行 loadData
const doSubmit = () => {
  searchParams.value = {
    ...searchParams.value,
    current: 1,
  };
};

const router = useRouter();

/**
 * 进入比赛详细页面
 * @param contestVO 当前记录
 */
const toContestPage = (contestVO: ContestVO) => {
  router.push({
    path: `/view/contest/${contestVO.id}`,
  });
};
</script>

<style scoped>
#ContestListView {
  max-width: 1080px;
  margin: 0 auto;
}
.question_title {
  color: #3380c2;
  font-weight: 500;
  font-size: 16px;
}
.question_title:hover {
  text-decoration: underline;
  cursor: pointer;
}
.ratio_class {
  color: gray;
  font-weight: 500;
}
</style>
