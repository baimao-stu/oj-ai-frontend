<template>
  <div class="home">
    <svg
      t="1707969544206"
      class="icon"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="4216"
      width="32"
      height="32"
    >
      <path
        d="M512 843.52a322.986667 322.986667 0 0 1-269.653333-146.346667h-85.333334A395.946667 395.946667 0 0 0 512 917.333333a400.213333 400.213333 0 0 0 395.52-368.64H981.333333l-108.373333-147.2-108.373333 147.2h70.4A327.253333 327.253333 0 0 1 512 843.52zM512 106.666667a399.36 399.36 0 0 0-390.4 331.52H42.666667l108.373333 147.626666 108.373333-147.626666H194.986667a326.826667 326.826667 0 0 1 317.013333-256 322.133333 322.133333 0 0 1 244.906667 113.493333l14.08-3.413333h73.386666A393.813333 393.813333 0 0 0 512 106.666667z"
        fill="#bfbfbf"
        p-id="4217"
      ></path>
    </svg>
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
