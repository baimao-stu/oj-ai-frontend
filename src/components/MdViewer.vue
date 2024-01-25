<template>
  <Viewer :value="value" :plugins="plugins" />
</template>

<script setup lang="ts">
import gfm from "@bytemd/plugin-gfm";
import { Editor, Viewer } from "@bytemd/vue-next";
import { defineProps, withDefaults } from "vue";
import highlight from "@bytemd/plugin-highlight";

const plugins = [
  gfm(),
  highlight(),
  // Add more plugins here
];

/**
 * 将组件的props抽象出一个单独的接口
 */
interface Props {
  value: string;
}

/**
 * 给组件的 props属性默认值
 */
const props = withDefaults(defineProps<Props>(), {
  value: () => "",
});
</script>
<style></style>
