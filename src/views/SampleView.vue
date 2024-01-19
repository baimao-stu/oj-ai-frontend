<template>
  <div class="home">
    <CodeEditor :value="codeValue" :handle-change="onCodeChange" />
    <MdEditor :value="mdValue" :handle-change="onMdChange" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import MdEditor from "@/components/MdEditor.vue";
import CodeEditor from "@/components/CodeEditor.vue"; // @ is an alias to /src

/**
 * 给子组件 CodeEditor传递的属性
 */
const codeValue = ref();
const onCodeChange = (v: string) => {
  codeValue.value = v;
};

/**
 * 给子组件 MdEditor传递的属性
 */
const mdValue = ref();
const onMdChange = (v: string) => {
  mdValue.value = v;
};
</script>
