<template>
  <div id="manageQuestionView">
    <a-table
      :columns="columns"
      :data="dataList"
      :pagination="{
        total,
        current: pageParams.current,
        pageSize: pageParams.pageSize,
        showTotal: true,
      }"
    >
      <template #optional="{ record }">
        <a-space>
          <a-button type="primary" @click="doUpdateQuestion(record)"
            >修改
          </a-button>
          <a-button status="danger" @click="doDeleteQuestion(record)"
            >删除
          </a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Question, QuestionControllerService } from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";

const dataList = ref([]);
const total = ref(0);
const pageParams = ref({
  current: 1,
  pageSize: 10,
});

/**
 * 加载分页数据
 */
const loadData = async () => {
  const res = await QuestionControllerService.listQuestionByPageUsingPost(
    pageParams.value
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
    console.log(dataList.value);
  } else {
    message.error("请求失败，" + res.message);
  }
};

onMounted(() => {
  loadData();
});

const columns = [
  {
    title: "编号",
    dataIndex: "id",
  },
  {
    title: "标题",
    dataIndex: "title",
  },
  {
    title: "内容",
    dataIndex: "content",
  },
  {
    title: "标签",
    dataIndex: "tags",
  },
  {
    title: "答案",
    dataIndex: "answer",
  },
  {
    title: "提交数",
    dataIndex: "subNum",
  },
  {
    title: "通过数",
    dataIndex: "acceptedNum",
  },
  {
    title: "判题用例",
    dataIndex: "judgeCase",
  },
  {
    title: "判题配置",
    dataIndex: "judgeConfig",
  },
  {
    title: "用户编号",
    dataIndex: "userId",
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
  },
  {
    title: "操作",
    slotName: "optional",
  },
];

const router = useRouter();

/**
 * 修改和删除记录
 * @param question 当前记录
 */
const doUpdateQuestion = (question: Question) => {
  console.log(question);
  router.push({
    path: "/update/question",
    query: {
      id: question.id,
    },
  });
};
const doDeleteQuestion = async (question: Question) => {
  console.log(question);
  const res = await QuestionControllerService.deleteQuestionUsingPost({
    id: question.id,
  });
  if (res.code === 0) {
    message.success("删除成功");
    await loadData();
  } else {
    message.success("删除失败，" + res.message);
  }
};
</script>

<style scoped>
#manageQuestionView {
}
</style>
