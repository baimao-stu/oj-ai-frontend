<template>
  <div id="AddQuestionView">
    <h2>创建题目</h2>
    <a-form :model="form" label-align="left" @submit="handleSubmit">
      <a-form-item field="title" label="标题">
        <a-input v-model="form.title" placeholder="请输入标题" />
      </a-form-item>
      <a-form-item field="tags" label="标签">
        <a-input-tag v-model="form.tags" placeholder="标签" />
      </a-form-item>
      <a-form-item field="content" label="内容">
        <MdEditor />
      </a-form-item>
      <a-form-item field="answer" label="答案">
        <MdEditor />
      </a-form-item>
      <a-form-item label="判题配置" :content-flex="false" :merge-props="false">
        <a-space direction="vertical" style="min-width: 480px">
          <a-form-item field="judgeConfig.timeLimit" label="时间限制">
            <a-input-number
              v-model="form.judgeConfig.timeLimit"
              placeholder="请输入时间限制"
              mode="button"
              min="0"
              size="large"
            />
          </a-form-item>
          <a-form-item field="judgeConfig.memoryLimit" label="内存限制">
            <a-input-number
              v-model="form.judgeConfig.memoryLimit"
              placeholder="请输入内存限制"
              mode="button"
              min="0"
              size="large"
            />
          </a-form-item>
          <a-form-item field="judgeConfig.stackLimit" label="堆栈限制">
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
            >
              <a-input
                v-model="judgeCaseItem.output"
                placeholder="请输入测试输出用例"
              />
            </a-form-item>
            <a-button @click="handleDelete(index)" status="danger"
              >删除
            </a-button>
          </a-space>
        </a-form-item>
        <div style="margin-top: 24px">
          <a-button @click="handleAdd" type="outline" status="success"
            >新增测试用例
          </a-button>
        </div>
      </a-form-item>
      <div style="margin-top: 16px" />
      <a-form-item>
        <a-button html-type="submit" type="primary" style="min-width: 180px"
          >提交</a-button
        >
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import MdEditor from "@/components/MdEditor.vue";

/**
 * 测试用例的增加与删除
 */
const handleAdd = () => {
  form.judgeCase.push({
    input: "",
    output: "",
  });
};
const handleDelete = (index: number) => {
  form.judgeCase.splice(index, 1);
};

const form = reactive({
  title: "A + B",
  content: "两数求和",
  answer: "a+b",
  tags: ["栈", "数组"],
  judgeConfig: {
    memoryLimit: 1000,
    stackLimit: 100,
    timeLimit: 10,
  },
  judgeCase: [
    {
      input: "1",
      output: "2",
    },
    {
      input: "3",
      output: "4",
    },
  ],
});

const handleSubmit = (data: any) => {
  console.log(data);
};
</script>

<style>
#AddQuestionView {
}
</style>
