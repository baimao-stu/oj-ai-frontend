<template>
  <div id="codeEditor" ref="divRef" style="min-height: 500px; height: 70vh" />
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref, toRaw, watch, withDefaults } from "vue";
import * as monaco from "monaco-editor";

/**
 * 将组件的props抽象出一个单独的接口
 */
interface Props {
  value: string;
  language?: string;
  readonly?: boolean;
  handleChange: (v: string) => void;
}

/**
 * 给组件的 props属性默认值
 */
const props = withDefaults(defineProps<Props>(), {
  value: () =>
    "public class Main {\n" +
    "   public static void main(String[] args) {\n\n" +
    "   }\n" +
    "}\n",
  language: "java",
  handleChange: (v: string) => {
    console.log("编辑器的内容：" + v);
  },
});

const divRef = ref(); //div的引用
const codeEditor = ref(); //代码编辑器的引用

onMounted(() => {
  //div加载完成时再挂载代码编辑器
  if (!divRef.value) {
    return;
  }
  //创建代码编辑器，并配置属性
  codeEditor.value = monaco.editor.create(divRef.value, {
    value: props.value,
    language: props.language,
    // theme: "vs-dark",
    automaticLayout: true,
    colorDecorators: true,
    minimap: {
      enabled: false,
    },
    readOnly: props.readonly,
    scrollbar: {
      vertical: "hidden",
      horizontal: "hidden",
    },
  });
  // 监听代码编辑器内容变化
  codeEditor.value.onDidChangeModelContent(() => {
    props.handleChange(toRaw(codeEditor.value).getValue());
  });
});

//语言变化时设置代码编辑器的语言环境
watch(
  () => [props.language, props.readonly],
  () => {
    if (codeEditor.value) {
      monaco.editor.setModelLanguage(
        toRaw(codeEditor.value).getModel(),
        props.language
      );
    }
  }
);

/**
 * 重置编辑器内部代码
 */
const resetCode = () => {
  console.log("reset code");
  toRaw(codeEditor.value).setValue("");
};
// eslint-disable-next-line no-undef
defineExpose({
  resetCode,
});
</script>
