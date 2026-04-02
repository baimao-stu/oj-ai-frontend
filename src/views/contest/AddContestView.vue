<template>
  <div id="AddContestView">
    <h2 class="page-title">{{ pageTitle }}</h2>
    <a-form :model="form">
      <a-form-item
        field="title"
        label="比赛标题（必填）"
        :label-col-style="{ fontWeight: 'bold' }"
      >
        <a-input
          v-model="form.title"
          placeholder="请输入标题"
          allow-clear
          style="width: 680px; min-width: 680px"
        />
      </a-form-item>
      <a-form-item
        field="description"
        label="比赛描述（非必填）"
        :label-col-style="{ fontWeight: 'bold' }"
      >
        <MdEditor :value="form.description" :handle-change="onContentChange" />
      </a-form-item>
      <a-form-item
        label="人数上限（必填）"
        :content-flex="false"
        :merge-props="false"
        :label-col-style="{ fontWeight: 'bold' }"
      >
        <a-space style="min-width: 640px">
          <a-input-number
            v-model="form.plimit"
            placeholder="请输入人数上限"
            mode="button"
            min="0"
            size="large"
          />
        </a-space>
      </a-form-item>

      <a-form-item
        field="type"
        label="比赛类型（必选）"
        style="min-width: 240px"
        :label-col-style="{ fontWeight: 'bold' }"
      >
        <a-select
          allow-clear
          v-model="form.type"
          :style="{ width: '200px' }"
          placeholder="请选择比赛类型"
          defaultValue="1"
          :options="type"
        >
          <!--          <a-option label="基础" value="0" />-->
          <!--          <a-option label="提高" value="1" />-->
          <!--          <a-option label="进阶" value="2" />-->
        </a-select>
      </a-form-item>

      <a-form-item
        field="isPublic"
        label="公开范围（必选）"
        style="min-width: 240px"
        :label-col-style="{ fontWeight: 'bold' }"
      >
        <a-select
          allow-clear
          v-model="form.isPublic"
          :style="{ width: '200px' }"
          placeholder="请选择公开范围"
          default-value="0"
          :options="is_public"
        >
          <!--          <a-option label="公开" value="1" />-->
          <!--          <a-option label="私有" value="0" />-->
        </a-select>
      </a-form-item>

      <a-form-item
        label="时间范围（必选）"
        style="min-width: 240px"
        :label-col-style="{ fontWeight: 'bold' }"
      >
        <a-range-picker
          style="width: 360px; margin: 0 24px 24px 0"
          show-time
          v-model="rangeTime"
          format="YYYY-MM-DD HH:mm"
          @ok="onOk"
        />
      </a-form-item>

      <a-form-item
        label="题目列表（必选）"
        style="min-width: 160px"
        :label-col-style="{ fontWeight: 'bold' }"
      >
        <a-list style="min-width: 160px" :scrollbar="true" :max-height="300">
          <template #header>
            <a-space>
              <a-checkbox
                :model-value="checkedAll"
                :indeterminate="indeterminate"
                @change="handleChangeAll"
                >全选
              </a-checkbox>
              <span style="font-size: 15px; font-weight: bold"
                >可选题目列表</span
              >
            </a-space>
          </template>
          <a-checkbox-group
            direction="vertical"
            v-model="selectingQuestionIds"
            @change="handleChange"
          >
            <a-checkbox
              v-for="question in allQuestions"
              :value="question.id"
              :key="question.id"
              >{{ question.title }}</a-checkbox
            >
          </a-checkbox-group>
        </a-list>
      </a-form-item>

      <a-form-item>
        <div style="margin-top: 12px">
          <a-space>
            <a-button type="primary" style="min-width: 180px" @click="doSubmit">
              提交
            </a-button>
          </a-space>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import MdEditor from "@/components/MdEditor.vue";
import {
  ContestControllerService,
  QuestionControllerService,
} from "../../../generated/";
import message from "@arco-design/web-vue/es/message";
import { useRoute, useRouter } from "vue-router";

const is_public = ref([
  {
    label: "公开",
    value: 1,
  },
  {
    label: "不公开",
    value: 0,
  },
]);
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
//日期选择器范围双响绑定
const rangeTime = ref();

let form = ref({
  title: "",
  description: "",
  type: 0,
  isPublic: 1,
  plimit: 1,
  startTime: "",
  endTime: "",
  questionIdList: [],
});

const pageTitle = ref("创建比赛");
const originForm = ref(form.value);
const route = useRoute();
const router = useRouter();

const allQuestions = ref(); //所有可选的题目
const selectedQuestionIds = ref(); //该比赛已选的题目id列表
const selectingQuestionIds = ref(); //当前选择的题目id列表

//多选框全选
const indeterminate = ref(false);
const checkedAll = ref(false);
//点击全选时的响应
const handleChangeAll = (value: any) => {
  indeterminate.value = false;
  if (value) {
    checkedAll.value = true;
    selectingQuestionIds.value = allQuestions.value.map(
      (question: any) => question.id
    );
    form.value.questionIdList = selectingQuestionIds.value.map((id: any) =>
      Number(id)
    );
  } else {
    checkedAll.value = false;
    selectingQuestionIds.value = [];
    form.value.questionIdList = [];
  }
  console.log("点击全选", selectingQuestionIds.value);
};

//点击单个复选框时的响应
const handleChange = (values: string | any[]) => {
  if (values.length === allQuestions.value.length) {
    checkedAll.value = true;
    indeterminate.value = false;
  } else if (values.length === 0) {
    checkedAll.value = false;
    indeterminate.value = false;
  } else {
    checkedAll.value = false;
    indeterminate.value = true;
  }
  console.log("点击单选", selectingQuestionIds.value);
  form.value.questionIdList = selectingQuestionIds.value.map((id: any) =>
    Number(id)
  );
};

let updatePage = route.path.includes("update"); //是否是修改操作
router.afterEach((to, from) => {
  updatePage = route.path.includes("update");
  if (!updatePage) {
    form.value = originForm.value; //不是修改操作，恢复form的值
    pageTitle.value = "创建比赛";
  }
});

if (!route.path.includes("update")) {
  pageTitle.value = "创建比赛";
} else {
  pageTitle.value = "修改比赛";
}
/**
 * 修改时先加载原有数据
 */
const loadData = async () => {
  //获取可选题目
  const res2 = await QuestionControllerService.listQuestionVoByPageUsingPost(
    {}
  );
  if (res2.code === 0) {
    allQuestions.value = res2.data.records as any;
    console.log("所有题目:", allQuestions.value);
  } else {
    message.error("题目加载失败，" + res2.message);
  }
  /**
   * 修改：获取该比赛信息、该比赛已选择的题目列表
   */
  const id = route.query.id;
  if (!id) return;
  //获取比赛信息
  const res = await ContestControllerService.getContestByIdUsingGet(id as any);
  if (res.code === 0) {
    form.value = res.data as any;
    rangeTime.value = [form.value.startTime, form.value.endTime];
    console.log("比赛信息:", form.value, rangeTime.value);
  } else {
    message.error("比赛加载失败，" + res.message);
  }
  //获取已选择的题目列表
  const res3 =
    await ContestControllerService.listContestQuestionVoByContestIdUsingPost(
      id as any
    );
  if (res.code === 0) {
    selectedQuestionIds.value = res3.data.map(
      (question: any) => question.id as number
    );
    selectingQuestionIds.value = selectedQuestionIds.value;
    form.value.questionIdList = selectingQuestionIds.value;
    console.log("该比赛的题目id列表:", selectedQuestionIds.value);

    if (selectingQuestionIds.value.length === allQuestions.value.length) {
      checkedAll.value = true;
      indeterminate.value = false;
    }
  } else {
    message.error("比赛题目加载失败，" + res.message);
  }
};
onMounted(() => {
  loadData();
});

const doSubmit = async () => {
  if (form.value.questionIdList.length === 0) {
    message.error("请选择题目");
    return;
  }

  console.log("表单提交：", form.value);
  if (updatePage) {
    //修改操作
    const res = await ContestControllerService.editContestUsingPost(form.value);
    if (res.code === 0) {
      message.success("修改成功");
      router.push({
        path: "/list/contest",
      });
    } else {
      message.error("修改失败，" + res.message);
    }
  } else {
    //增加操作
    const res = await ContestControllerService.addContestUsingPost(form.value);
    if (res.code === 0) {
      message.success("提交成功");
      router.push({
        path: "/list/contest",
      });
    } else {
      message.error("提交失败，" + res.message);
    }
  }
};
/**
 * 文本编辑器的改变
 */
const onContentChange = (value: string) => {
  form.value.description = value;
};

/**
 * 日期选择器
 */
const onOk = (dateString: any, date: any) => {
  console.log("onOk", dateString, date);
  form.value.startTime = dateString[0];
  form.value.endTime = dateString[1];
};
</script>

<style>
#AddContestView {
}

.page-title {
  margin-left: 64px;
  margin-top: 0;
}
</style>
