<template>
  <div id="codeEditor" ref="divRef" style="min-height: 400px" />
</template>

<script setup lang="ts">
import { onMounted, ref, toRaw, withDefaults, defineProps } from "vue";
import * as monaco from "monaco-editor";

/**
 * 将组件的props抽象出一个单独的接口
 */
interface Props {
  value: string;
  handleChange: (v: string) => void;
}

/**
 * 给组件的 props属性默认值
 */
const props = withDefaults(defineProps<Props>(), {
  value: () => "",
  handleChange: (v: string) => {
    console.log(v);
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
    language: "java",
    // theme: "vs-dark",
    automaticLayout: true,
    colorDecorators: true,
    minimap: {
      enabled: true,
    },
    readOnly: false,
  });
  // 监听代码编辑器内容变化
  codeEditor.value.onDidChangeModelContent(() => {
    console.log("目前内容为：", toRaw(codeEditor.value).getValue());
  });
});
</script>
