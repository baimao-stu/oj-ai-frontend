<template>
  <div id="questionSubmitView">
    <a-form :model="searchParams" layout="inline">
      <a-form-item
        field="questionId"
        label="题号"
        style="min-width: 240px"
        :label-col-style="{ fontWeight: 'bold' }"
      >
        <a-input v-model="searchParams.questionId" placeholder="请输入" />
      </a-form-item>
      <a-form-item
        field="language"
        label="编程语言"
        style="min-width: 240px"
        :label-col-style="{ fontWeight: 'bold' }"
      >
        <a-select
          v-model="searchParams.language"
          :style="{ width: '240px' }"
          placeholder="选择编程语言"
          allow-clear
        >
          <a-option>java</a-option>
          <a-option>cpp</a-option>
          <a-option>go</a-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="doSubmit">搜索</a-button>
      </a-form-item>
    </a-form>
    <a-divider size="0" />
    <a-table
      :ref="tableRef"
      :columns="columns"
      :data="dataList"
      :pagination="{
        showTotal: true,
        pageSize: searchParams.pageSize,
        current: searchParams.current,
        total,
      }"
      @page-change="onPageChange"
    >
      <template #judgeInfo="{ record }">
        <span
          v-if="record.judgeInfo.message === 'Accepted'"
          style="color: green"
          >{{ record.judgeInfo.message }}</span
        >
        <span v-else style="color: red">{{ record.judgeInfo.message }}</span>
      </template>
      <template #status="{ record }">
        {{ statusMap[record.status as number] }}
      </template>
      <template #createTime="{ record }">
        {{
          moment.utc(record.createTime).local().format("YYYY-MM-DD HH:mm:ss")
        }}
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import {
  Question,
  QuestionControllerService,
  QuestionSubmitQueryRequest,
} from "../../../generated/";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import moment from "moment";

const tableRef = ref();

const dataList = ref([]);
const total = ref(0);
const searchParams = ref<QuestionSubmitQueryRequest>({
  questionId: undefined,
  language: undefined,
  pageSize: 10,
  current: 1,
});

const loadData = async () => {
  const res = await QuestionControllerService.listQuestionSubmitByPageUsingPost(
    {
      ...searchParams.value,
      sortField: "createTime",
      sortOrder: "descend",
    }
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
  } else {
    message.error("加载失败，" + res.message);
  }
};

/**
 * 监听 searchParams 变量，改变时触发页面的重新加载
 */
watchEffect(() => {
  // searchParams.value.current = 1;
  loadData();
});

/**
 * 页面加载时，请求数据
 */
onMounted(() => {
  loadData();
});

const statusMap = ["等待中", "判题中", "完成", "失败"];
const columns = [
  {
    title: "#",
    dataIndex: "id",
    headerCellStyle: {
      fontWeight: "bold",
    },
    bodyCellStyle: {
      color: "#3380c2",
      fontWeight: "500",
    },
  },
  {
    title: "编程语言",
    dataIndex: "language",
    headerCellStyle: {
      fontWeight: "bold",
    },
    bodyCellStyle: {
      color: "gray",
      fontWeight: "500",
    },
  },
  {
    title: "判题结果",
    slotName: "judgeInfo",
    headerCellStyle: {
      fontWeight: "bold",
    },
    bodyCellStyle: {
      fontWeight: "500",
    },
  },
  {
    title: "判题状态",
    slotName: "status",
    headerCellStyle: {
      fontWeight: "bold",
    },
    bodyCellStyle: {
      color: "gray",
      fontWeight: "500",
    },
  },
  {
    title: "题目 id",
    dataIndex: "questionId",
    headerCellStyle: {
      fontWeight: "bold",
    },
    bodyCellStyle: {
      color: "gray",
      fontWeight: "500",
    },
  },
  {
    title: "提交者",
    dataIndex: "userVO.userName",
    headerCellStyle: {
      fontWeight: "bold",
    },
    bodyCellStyle: {
      color: "gray",
      fontWeight: "500",
    },
  },
  {
    title: "提交时间",
    slotName: "createTime",
    headerCellStyle: {
      fontWeight: "bold",
    },
    bodyCellStyle: {
      color: "gray",
      fontWeight: "500",
    },
  },
];

const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page,
  };
};

const router = useRouter();

/**
 * 跳转到做题页面
 * @param question
 */
const toQuestionPage = (question: Question) => {
  router.push({
    path: `/view/question/${question.id}`,
  });
};

/**
 * 确认搜索，重新加载数据
 */
const doSubmit = () => {
  // 这里需要重置搜索页号
  searchParams.value = {
    ...searchParams.value,
    current: 1,
  };
  loadData();
};
</script>

<style scoped>
#questionSubmitView {
  max-width: 1280px;
  margin: 0 auto;
}
</style>
