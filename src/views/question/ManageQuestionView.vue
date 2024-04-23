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
        <a-input-tag
          v-model="searchParams.tags"
          placeholder="请输入标签后按回车"
        />
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
    >
      <template #tags="{ record }">
        <a-space wrap>
          <a-tag
            v-for="(tag, index) of JSON.parse(record.tags)"
            :key="index"
            color="green"
            >{{ tag }}
          </a-tag>
        </a-space>
      </template>
      <template #createTime="{ record }">
        {{ moment(record.createTime).utcOffset(8).format("YYYY-MM-DD") }}
      </template>
      <template #optional="{ record }">
        <a-space
          v-if="
            record.userId == loginUser.id ||
            loginUser.userRole == ACCESS_ENUM.ADMIN
          "
        >
          <a-button type="primary" @click="doUpdateQuestion(record)"
            >修改
          </a-button>
          <a-popconfirm
            content="对应的提交记录也会被删除，确定删除吗？"
            type="warning"
            @ok="doDeleteQuestion(record)"
          >
            <a-button status="danger">删除</a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import { Question, QuestionControllerService } from "../../../generated/";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import moment from "moment/moment";
import store from "@/store";
import ACCESS_ENUM from "@/access/accessEnum";

const dataList = ref([]);
const total = ref(0);
const searchParams = ref({
  title: "",
  tags: [],
  current: 1,
  pageSize: 10,
});
/** 加载分页数据*/
const loadData = async () => {
  const res = await QuestionControllerService.listQuestionByPageUsingPost(
    searchParams.value
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
    console.log(dataList.value);
  } else {
    message.error("请求失败，" + res.message);
  }
};
/** 监听 loadData 的响应式依赖，如 searchParams改变时重新执行 loadData */
watchEffect(() => {
  loadData();
  console.log("watchEffect");
});

//当前登录的用户
const loginUser = ref();
onMounted(async () => {
  await store.dispatch("user/getLoginUser");
  loginUser.value = store.state.user.loginUser;
  console.log("用户信息：", loginUser.value, loginUser.value.id);
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
    bodyCellStyle: {
      color: "#3380c2",
      fontWeight: "500",
    },
  },
  {
    title: "标题",
    dataIndex: "title",
    headerCellStyle: {
      fontWeight: "bold",
    },
    bodyCellStyle: {
      color: "#3380c2",
      fontWeight: "500",
    },
  },
  // {
  //   title: "内容",
  //   dataIndex: "content",
  //   headerCellStyle: {
  //     fontWeight: "bold",
  //   },
  // },
  {
    title: "标签",
    slotName: "tags",
    headerCellStyle: {
      fontWeight: "bold",
    },
  },
  // {
  //   title: "答案",
  //   dataIndex: "answer",
  //   headerCellStyle: {
  //     fontWeight: "bold",
  //   },
  // },
  {
    title: "提交数",
    dataIndex: "subNum",
    headerCellStyle: {
      fontWeight: "bold",
    },
    bodyCellStyle: {
      color: "gray",
      fontWeight: "500",
    },
  },
  {
    title: "通过数",
    dataIndex: "acceptedNum",
    headerCellStyle: {
      fontWeight: "bold",
    },
    bodyCellStyle: {
      color: "gray",
      fontWeight: "500",
    },
  },
  // {
  //   title: "判题用例",
  //   dataIndex: "judgeCase",
  //   headerCellStyle: {
  //     fontWeight: "bold",
  //   },
  // },
  // {
  //   title: "判题配置",
  //   dataIndex: "judgeConfig",
  //   headerCellStyle: {
  //     fontWeight: "bold",
  //   },
  // },
  {
    title: "创建者编号",
    dataIndex: "userId",
    headerCellStyle: {
      fontWeight: "bold",
    },
    bodyCellStyle: {
      color: "gray",
      fontWeight: "500",
    },
  },
  {
    title: "创建时间",
    slotName: "createTime",
    headerCellStyle: {
      fontWeight: "bold",
    },
    bodyCellStyle: {
      color: "gray",
      fontWeight: "500",
    },
  },
  {
    title: "操作",
    slotName: "optional",
    headerCellStyle: {
      fontWeight: "bold",
    },
  },
];

const doSubmit = () => {
  searchParams.value = {
    ...searchParams.value,
    current: 1,
  };
};

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
    message.error("删除失败，" + res.message);
  }
};
</script>

<style scoped>
#manageQuestionView {
  max-width: 1280px;
  margin: 0 auto;
}
</style>
