<template>
  <div id="ViewQuestionView">
    <a-row :gutter="[24, 24]">
      <a-col :md="12" :xs="24">
        <a-tabs
          :active-key="tabsKey"
          @tab-click="onTabClick"
          @change="console.log(tabsKey)"
          animation="true"
        >
          <a-tab-pane key="question" title="题目">
            <a-card v-if="question" :title="question.title">
              <a-descriptions
                title="判题条件"
                :column="{ xs: 1, md: 2, lg: 3 }"
              >
                <a-descriptions-item label="时间限制">
                  {{ question.judgeConfig.timeLimit }} ms
                </a-descriptions-item>
                <a-descriptions-item label="内存限制">
                  {{ question.judgeConfig.memoryLimit / 1024 / 1024 }} KB
                </a-descriptions-item>
                <!--                <a-descriptions-item label="堆栈限制">-->
                <!--                  {{ question.judgeConfig.stackLimit }}-->
                <!--                </a-descriptions-item>-->
              </a-descriptions>
              <MdViewer :value="question.content || ''" />
              <template #extra>
                <a-space wrap>
                  <a-tag
                    v-for="(tag, index) of question.tags"
                    :key="index"
                    color="green"
                    >{{ tag }}
                  </a-tag>
                </a-space>
              </template>
            </a-card>
          </a-tab-pane>
          <a-tab-pane key="answer" title="题解">题解</a-tab-pane>
          <a-tab-pane key="submissions" title="提交记录">
            <div id="submissionsTable" v-if="showSubmissionsTable">
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
                <template #createTime="{ record }">
                  {{
                    moment
                      .utc(record.createTime)
                      .local()
                      .format("YYYY-MM-DD HH:mm:ss")
                  }}
                </template>
                <template #judgeStatus="{ record }">
                  <span
                    v-if="record.judgeInfo.message === 'Accepted'"
                    @click="show_submission_detail(record)"
                    class="ACStatus"
                  >
                    {{ record.judgeInfo.message }}
                  </span>
                  <span
                    v-else
                    @click="show_submission_detail(record)"
                    class="ERRStatus"
                  >
                    {{ record.judgeInfo.message }}
                  </span>
                </template>
                <template #runTime="{ record }">
                  <span
                    v-if="record.judgeInfo.message !== 'Accepted'"
                    style="color: gray"
                  >
                    N/A
                  </span>
                  <span v-else style="color: green">
                    {{ record.judgeInfo.time }} ms
                  </span>
                </template>
              </a-table>
            </div>
            <div id="submissionsDetail" v-else>
              <a-card v-if="selectedSubmissionRecord">
                <a-descriptions :column="{ xs: 1, md: 2, lg: 3 }">
                  <a-descriptions-item label="结果">
                    <span
                      v-if="
                        selectedSubmissionRecord.judgeInfo.message ===
                        'Accepted'
                      "
                      style="color: green; font-weight: 500; font-size: 16px"
                    >
                      {{ selectedSubmissionRecord.judgeInfo.message }}
                    </span>
                    <span
                      v-else
                      style="color: red; font-weight: 500; font-size: 16px"
                    >
                      {{ selectedSubmissionRecord.judgeInfo.message }}
                    </span>
                  </a-descriptions-item>
                  <a-descriptions-item label="用户"
                    >{{ loginUser.userName }}
                  </a-descriptions-item>
                  <a-descriptions-item label="运行时间">
                    {{
                      selectedSubmissionRecord.judgeInfo.time != "0"
                        ? selectedSubmissionRecord.judgeInfo.time + " ms"
                        : "N/A"
                    }}
                  </a-descriptions-item>
                  <a-descriptions-item label="运行空间">
                    {{
                      selectedSubmissionRecord.judgeInfo.memory != "0"
                        ? selectedSubmissionRecord.judgeInfo.memory + "KB"
                        : "N/A"
                    }}
                  </a-descriptions-item>
                  <a-descriptions-item label="提交时间">
                    {{
                      moment
                        .utc(selectedSubmissionRecord.createTime)
                        .local()
                        .format("YYYY-MM-DD HH:mm:ss")
                    }}
                  </a-descriptions-item>
                </a-descriptions>
              </a-card>
              <a-divider size="0" />
              <a-card v-if="errorCase" title="错误数据如下所示">
                输入<a-input
                  v-model="errorCase.input"
                  style="
                    margin: 10px 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  "
                  readonly
                />
                标注答案<a-input
                  v-model="errorCase.output"
                  style="
                    margin-top: 10px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  "
                  readonly
                />
              </a-card>
              <a-divider size="0" />
              <a-card
                v-if="selectedSubmissionRecord"
                :title="selectedSubmissionRecord.language"
              >
                <CodeEditor
                  :value="selectedSubmissionRecord.code as string"
                  :readonly="true"
                />
              </a-card>
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-col>
      <a-col :md="12" :xs="24">
        <a-card>
          <a-space style="margin-bottom: 5px">
            <a-form :model="form" layout="inline">
              <a-form-item
                field="language"
                label="编程语言"
                style="min-width: 240px"
                :label-col-style="{ fontWeight: 'bold' }"
              >
                <a-select
                  v-model="form.language"
                  :style="{ width: '200px' }"
                  placeholder="请选择编程语言"
                >
                  <a-option>java</a-option>
                  <a-option>cpp</a-option>
                  <a-option>go</a-option>
                </a-select>
              </a-form-item>
            </a-form>
            <a-button
              type="primary"
              status="success"
              style="min-width: 90px; margin-left: 10px; margin-bottom: 5px"
              @click="doSubmit"
            >
              <svg
                t="1707829136730"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="5160"
                width="25"
                height="25"
              >
                <path
                  d="M892.272 386.496c2.448-11.104 3.728-22.656 3.728-34.496 0-88.368-71.632-160-160-160-14.224 0-28.016 1.872-41.136 5.36-24.8-77.36-97.296-133.36-182.864-133.36-87.344 0-161.056 58.336-184.32 138.176-22.736-6.624-46.8-10.176-71.68-10.176-141.376 0-256 114.608-256 256s114.608 256 256 256l128 0 0 192 256 0 0-192 224 0c88.368 0 160-71.632 160-160 0-78.72-56.848-144.16-131.728-157.504zM576 640l0 192-128 0 0-192-160 0 224-224 224 224-160 0z"
                  fill="#93f669"
                  p-id="5161"
                ></path></svg
              >&nbsp;&nbsp;提交
            </a-button>
            <!--评测过渡动画-->
            <div style="margin-left: 5px">
              <svg
                t="1708092483918"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="4928"
                width="24"
                height="24"
                @click="editorResetCode"
              >
                <path
                  d="M944.443077 355.249231v-236.307693l-236.307692 236.307693h236.307692zM119.729231 707.347692v236.307693l236.307692-236.307693h-236.307692z"
                  p-id="4929"
                  fill="#bfbfbf"
                ></path>
                <path
                  d="M157.538462 512H0a512 512 0 0 1 896.393846-337.92L781.390769 281.206154A364.701538 364.701538 0 0 0 512 157.538462 355.249231 355.249231 0 0 0 157.538462 512zM512 1024a523.815385 523.815385 0 0 1-343.433846-129.181538l109.489231-116.578462A354.461538 354.461538 0 0 0 866.461538 512h157.538462A512.787692 512.787692 0 0 1 512 1024z"
                  p-id="4930"
                  fill="#bfbfbf"
                ></path>
              </svg>
            </div>
            <div v-if="loading" id="loading">
              <a-space>
                <div class="loader"></div>
                <div class="running">Running</div>
              </a-space>
            </div>
          </a-space>
          <CodeEditor
            ref="editorRef"
            :value="form.code as string"
            :language="form.language"
            :handle-change="onCodeChange"
          />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref, withDefaults } from "vue";
import {
  QuestionControllerService,
  QuestionSubmit,
  QuestionSubmitAddRequest,
  QuestionSubmitQueryRequest,
  QuestionVO,
} from "../../../generated/";
import message from "@arco-design/web-vue/es/message";
import CodeEditor from "@/components/CodeEditor.vue";
import MdViewer from "@/components/MdViewer.vue";
import moment from "moment/moment";
import store from "@/store";

interface Props {
  id: string;
}

//1. 当路由的props设置为时true，route.params将会被设置为组件 props，所以这里的props的id会被设置为route.params
const props = withDefaults(defineProps<Props>(), {
  id: () => "",
});
const question = ref<QuestionVO>();

//2. 也可以使用route直接拿到参数
// const route = useRoute();
// console.log(route.params?.id);

/** 重置代码 */
const editorRef = ref<InstanceType<typeof CodeEditor> | null>(null);
const editorResetCode = () => {
  editorRef.value?.resetCode();
};

const tabsKey = ref("question");
/**
 * 点击卡片时触发
 * @param key
 */
const onTabClick = (key: string) => {
  console.log("onTabClick:" + key);
  tabsKey.value = key;
  if (tabsKey.value === "question") {
    loadData1();
  } else if (tabsKey.value === "submissions") {
    loadData3();
    showSubmissionsTable.value = true;
  }
};

/** 卡片1：题目信息 */
const loadData1 = async () => {
  await store.dispatch("user/getLoginUser");
  loginUser.value = store.state.user.loginUser;
  const res = await QuestionControllerService.getQuestionVoByIdUsingGet(
    props.id as any
  );
  if (res.code === 0) {
    question.value = res.data as any;
    console.log(question.value);
  } else {
    message.error("请求失败，" + res.message);
  }
};

const loginUser = ref();
onMounted(async () => {
  await loadData1();
  await store.dispatch("user/getLoginUser");
  loginUser.value = store.state.user.loginUser;
  console.log("用户信息：", loginUser.value, loginUser.value.id);
  searchParams.value.userId = loginUser.value?.id;
});

const form = ref<QuestionSubmitAddRequest>({
  code:
    "public class Main {\n" +
    "   public static void main(String[] args) {\n\n" +
    "   }\n" +
    "}\n",
  language: "java",
});

const onCodeChange = (v: string) => {
  form.value.code = v;
};

/**
 * 提交代码
 */
const errorCase = ref(); //未通过的测试用例
const loading = ref(false); //是否加载过渡动画
const doSubmit = async () => {
  if (!question.value?.id) return;
  loading.value = true;
  const res = await QuestionControllerService.doQuestionSubmitVoUsingPost({
    ...form.value,
    questionId: question.value.id,
  });
  if (res.code === 0) {
    message.success("提交成功");
    tabsKey.value = "submissions";
    // let judgeInfoObj = JSON.parse(res.data.judgeInfo);
    // res.data.judgeInfo = judgeInfoObj;
    show_submission_detail(res.data);
    // 答案错误，展示错误时的测试用例
    if (res.data.errorCase) {
      errorCase.value = res.data.errorCase;
    } else {
      errorCase.value = null;
    }
    console.log(tabsKey.value, res.data);
  } else {
    message.error("提交失败，" + res.message);
    console.log(res);
  }
  loading.value = false;
};

/** 卡片3：提交列表信息 */
const dataList = ref([]);
const total = ref(0);
const searchParams = ref<QuestionSubmitQueryRequest>({
  language: "",
  questionId: props.id as any,
  userId: loginUser.value?.id,
  judgeStatus: "",
  pageSize: 8,
  sortField: "createTime",
  sortOrder: "descend",
});
/** 加载分页数据*/
const loadData3 = async () => {
  await store.dispatch("user/getLoginUser");
  loginUser.value = store.state.user.loginUser;
  const res = await QuestionControllerService.listQuestionSubmitByPageUsingPost(
    searchParams.value
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
  } else {
    message.error("请求失败，" + res.message);
  }
  console.log(dataList.value);
};

// 切换页码
const onPageChange = (page: number) => {
  console.log(page);
  searchParams.value = {
    ...searchParams.value,
    current: page,
  };
  loadData3();
};

const columns = [
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
  {
    title: "状态",
    slotName: "judgeStatus",
    headerCellStyle: {
      fontWeight: "bold",
    },
    bodyCellStyle: {
      fontWeight: "500",
    },
  },
  {
    title: "运行时间",
    slotName: "runTime",
    headerCellStyle: {
      fontWeight: "bold",
    },
    bodyCellStyle: {
      color: "gray",
      fontWeight: "500",
    },
  },
  {
    title: "语言",
    dataIndex: "language",
    headerCellStyle: {
      fontWeight: "bold",
    },
    bodyCellStyle: {
      color: "gray",
      fontWeight: "500",
    },
  },
];

const showSubmissionsTable = ref(true);
const selectedSubmissionRecord = ref(); //点击查看了哪个提交记录
//展示某条提交记录
const show_submission_detail = (record: any) => {
  showSubmissionsTable.value = false;
  selectedSubmissionRecord.value = record;
  console.log(showSubmissionsTable.value);
  console.log("selectedSubmissionRecord", selectedSubmissionRecord.value);
};
</script>

<style>
.loader {
  border: 5px solid #f3f3f3;
  border-radius: 50%;
  border-top: 5px solid #5fa0ea;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  margin-left: 10px;
}
.running {
  color: #5fa0ea;
  font-size: 20px;
  font-weight: 500;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

#ViewQuestionView {
  max-width: 1400px;
  margin: 0 auto;
}

#ViewQuestionView .arco-space-horizontal .arco-space-item {
  margin-bottom: 0 !important;
}

.ACStatus {
  color: green;
}
.ACStatus:hover {
  text-decoration: underline !important;
  cursor: pointer;
}
.ERRStatus {
  color: red;
}
.ERRStatus:hover {
  text-decoration: underline;
  cursor: pointer;
}
</style>
