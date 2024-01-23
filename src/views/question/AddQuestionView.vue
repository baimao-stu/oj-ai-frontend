<template>
  <div id="AddQuestionView">
    <h2 class="page-title">{{ pageTitle }}</h2>
    <a-form :model="form">
      <a-form-item
        field="title"
        label="题目标题"
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
        field="tags"
        label="题目标签"
        :label-col-style="{ fontWeight: 'bold' }"
      >
        <a-input-tag
          v-model="form.tags"
          placeholder="请输入标签"
          allow-clear
          style="width: 680px; min-width: 680px"
        />
      </a-form-item>
      <a-form-item
        field="content"
        label="题目内容"
        :label-col-style="{ fontWeight: 'bold' }"
      >
        <MdEditor :value="form.content" :handle-change="onContentChange" />
      </a-form-item>
      <a-form-item
        field="answer"
        label="题目答案"
        :label-col-style="{ fontWeight: 'bold' }"
      >
        <MdEditor :value="form.answer" :handle-change="onAnswerChange" />
      </a-form-item>
      <a-form-item
        label="判题配置"
        :content-flex="false"
        :merge-props="false"
        :label-col-style="{ fontWeight: 'bold' }"
      >
        <a-space direction="vertical" style="min-width: 480px">
          <a-form-item
            field="judgeConfig.timeLimit"
            label="时间限制"
            :label-col-style="{ fontWeight: 'bold' }"
          >
            <a-input-number
              v-model="form.judgeConfig.timeLimit"
              placeholder="请输入时间限制"
              mode="button"
              min="0"
              size="large"
            />
          </a-form-item>
          <a-form-item
            field="judgeConfig.memoryLimit"
            label="内存限制"
            :label-col-style="{ fontWeight: 'bold' }"
          >
            <a-input-number
              v-model="form.judgeConfig.memoryLimit"
              placeholder="请输入内存限制"
              mode="button"
              min="0"
              size="large"
            />
          </a-form-item>
          <a-form-item
            field="judgeConfig.stackLimit"
            label="堆栈限制"
            :label-col-style="{ fontWeight: 'bold' }"
          >
            <a-input-number
              v-model="form.judgeConfig.stackLimit"
              placeholder="请输入堆栈限制"
              mode="button"
              min="0"
              size="large"
            />
          </a-form-item>
        </a-space>
      </a-form-item>
      <a-form-item
        label="测试用例配置"
        :content-flex="false"
        :merge-props="false"
        :label-col-style="{ fontWeight: 'bold' }"
      >
        <a-form-item
          v-for="(judgeCaseItem, index) of form.judgeCase"
          :key="index"
          no-style
        >
          <a-space
            direction="vertical"
            style="min-width: 480px; margin-right: 16px; margin-bottom: 16px"
          >
            <a-form-item
              :field="`form.judgeCase[${index}].input`"
              :label="`输入用例${index}`"
              :key="index"
              :label-col-style="{ fontWeight: 'bold' }"
            >
              <a-input
                v-model="judgeCaseItem.input"
                placeholder="请输入测试输入用例"
              />
            </a-form-item>
            <a-form-item
              :field="`form.judgeCase[${index}].output`"
              :label="`输出用例${index}`"
              :key="index"
              :label-col-style="{ fontWeight: 'bold' }"
            >
              <a-input
                v-model="judgeCaseItem.output"
                placeholder="请输入测试输出用例"
              />
            </a-form-item>
            <a-button
              @click="handleDelete(index)"
              status="danger"
              style="margin-left: 16px"
              >删除
            </a-button>
          </a-space>
        </a-form-item>
        <div style="margin-top: 24px">
          <a-space>
            <a-button @click="handleAdd" type="outline" status="success"
              >新增测试用例
            </a-button>
            <a-button
              type="primary"
              style="min-width: 180px; margin-left: 64px"
              @click="doSubmit"
            >
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
import { QuestionControllerService } from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useRoute, useRouter } from "vue-router";

let form = ref({
  title: "",
  content: "",
  answer: "",
  tags: [],
  judgeConfig: {
    memoryLimit: 1000,
    stackLimit: 1000,
    timeLimit: 1000,
  },
  judgeCase: [
    {
      input: "",
      output: "",
    },
  ],
});

const pageTitle = ref("创建题目");
const originForm = ref(form.value);
const route = useRoute();
const router = useRouter();

let updatePage = route.path.includes("update"); //是否是修改操作
router.afterEach((to, from) => {
  updatePage = route.path.includes("update");
  if (!updatePage) {
    form.value = originForm.value; //不是修改操作，恢复form的值
    pageTitle.value = "创建题目";
  }
});

if (!route.path.includes("update")) {
  pageTitle.value = "创建题目";
} else {
  pageTitle.value = "修改题目";
}
/**
 * 修改时先加载原有数据
 */
const loadData = async () => {
  const id = route.query.id;
  if (!id) return;
  const res = await QuestionControllerService.getQuestionByIdUsingGet(
    id as any
  );
  if (res.code === 0) {
    form.value = res.data as any;
    // 为空，则给 judgeCase、 judgeConfig、tags 默认值，否则将后端返回的json字符串转为对象
    if (!form.value.judgeCase) {
      form.value.judgeCase = [
        {
          input: "",
          output: "",
        },
      ];
    } else {
      form.value.judgeCase = JSON.parse(form.value.judgeCase as any);
    }
    if (!form.value.judgeConfig) {
      form.value.judgeConfig = {
        memoryLimit: 1000,
        stackLimit: 1000,
        timeLimit: 1000,
      };
    } else {
      form.value.judgeConfig = JSON.parse(form.value.judgeConfig as any);
    }
    if (!form.value.tags) {
      form.value.tags = [];
    } else {
      form.value.tags = JSON.parse(form.value.tags as any);
    }
  } else {
    message.error("加载失败，" + res.message);
  }
};
onMounted(() => {
  loadData();
});

/**
 * 测试用例的增加与删除
 */
const handleAdd = () => {
  form.value.judgeCase.push({
    input: "",
    output: "",
  });
};
const handleDelete = (index: number) => {
  form.value.judgeCase.splice(index, 1);
};

const doSubmit = async () => {
  if (updatePage) {
    //修改操作
    const res = await QuestionControllerService.updateQuestionUsingPost(
      form.value
    );
    if (res.code === 0) {
      message.success("修改成功，" + res.message);
      router.push({
        path: "/manage/question",
      });
    } else {
      message.error("修改失败，" + res.message);
    }
  } else {
    //增加操作
    const res = await QuestionControllerService.addQuestionUsingPost(
      form.value
    );
    if (res.code === 0) {
      message.success("提交成功，" + res.message);
      router.push({
        path: "/manage/question",
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
  form.value.content = value;
};
const onAnswerChange = (value: string) => {
  form.value.answer = value;
};
</script>

<style>
#AddQuestionView {
}
.page-title {
  margin-left: 64px;
  margin-top: 0;
}
</style>
