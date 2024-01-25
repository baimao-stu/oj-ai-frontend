<template>
  <div id="manageQuestionView">
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
        label="标签"
        style="min-width: 240px"
        :label-col-style="{ fontWeight: 'bold' }"
      >
        <a-input-tag v-model="searchParams.tags" placeholder="请输入标签" />
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
      <template #tags="{ record }">
        <a-space wrap>
          <a-tag v-for="(tag, index) of record.tags" :key="index" color="green"
            >{{ tag }}
          </a-tag>
        </a-space>
      </template>
      <template #acceptedRatio="{ record }">
        {{
          `${record.subNum ? record.acceptedNum / record.subNum : "0"}%(${
            record.acceptedNum
          }/${record.subNum})`
        }}
      </template>
      <template #optional="{ record }">
        <a-space>
          <a-button type="primary" @click="toQuestionPage(record)"
            >做题
          </a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import {
  Question,
  QuestionControllerService,
  QuestionQueryRequest,
} from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";

const dataList = ref([]);
const total = ref(0);
const searchParams = ref<QuestionQueryRequest>({
  title: "",
  tags: [],
  current: 1,
  pageSize: 10,
});
/** 加载分页数据*/
const loadData = async () => {
  const res = await QuestionControllerService.listQuestionVoByPageUsingPost(
    searchParams.value
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
    // dataList.value.map((item) => {
    //   item.id = item.id.substring(item.id.length - 5); //只取id的后5位
    // });
  } else {
    message.error("请求失败，" + res.message);
  }
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
    title: "#",
    dataIndex: "id",
    headerCellStyle: {
      fontWeight: "bold",
    },
    width: 200,
  },
  {
    title: "标题",
    dataIndex: "title",
    headerCellStyle: {
      fontWeight: "bold",
    },
  },
  {
    title: "通过率",
    slotName: "acceptedRatio",
    headerCellStyle: {
      fontWeight: "bold",
    },
    width: 150,
  },
  {
    title: "标签",
    slotName: "tags",
    headerCellStyle: {
      fontWeight: "bold",
    },
    width: 200,
  },
  {
    slotName: "optional",
    width: 100,
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
 * 进入做题页面
 * @param question 当前记录
 */
const toQuestionPage = (question: Question) => {
  router.push({
    path: `/view/question/${question.id}`,
  });
};
</script>

<style scoped>
#manageQuestionView {
  max-width: 1080px;
  margin: 0 auto;
}
</style>
