<template>
  <div ref="divRef" class="code-editor" :style="{ minHeight, height }" />
</template>

<script setup lang="ts">
import {
  defineExpose,
  defineProps,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  toRaw,
  watch,
  withDefaults,
} from "vue";
import * as monaco from "monaco-editor";

interface Props {
  value: string;
  language?: string;
  readonly?: boolean;
  height?: string;
  minHeight?: string;
  handleChange: (v: string) => void;
}

const props = withDefaults(defineProps<Props>(), {
  value: () => "",
  language: "java",
  readonly: false,
  height: "70vh",
  minHeight: "500px",
  handleChange: () => undefined,
});

const divRef = ref<HTMLElement | null>(null);
const codeEditor = ref<monaco.editor.IStandaloneCodeEditor | null>(null);
const isSyncingFromProps = ref(false);

onMounted(() => {
  if (!divRef.value) {
    return;
  }
  codeEditor.value = monaco.editor.create(divRef.value, {
    value: props.value,
    language: props.language,
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

  codeEditor.value.onDidChangeModelContent(() => {
    if (isSyncingFromProps.value) {
      return;
    }
    props.handleChange(toRaw(codeEditor.value)?.getValue() || "");
  });

  nextTick(() => {
    toRaw(codeEditor.value)?.layout();
  });
});

onBeforeUnmount(() => {
  toRaw(codeEditor.value)?.dispose();
  codeEditor.value = null;
});

watch(
  () => props.language,
  (language) => {
    const editor = toRaw(codeEditor.value);
    const model = editor?.getModel();
    if (!editor || !model) {
      return;
    }
    monaco.editor.setModelLanguage(model, language);
  }
);

watch(
  () => props.readonly,
  (readonly) => {
    const editor = toRaw(codeEditor.value);
    if (!editor) {
      return;
    }
    editor.updateOptions({
      readOnly: readonly,
    });
  }
);

watch(
  () => props.value,
  (value) => {
    const editor = toRaw(codeEditor.value);
    if (!editor || editor.getValue() === value) {
      return;
    }
    isSyncingFromProps.value = true;
    editor.setValue(value || "");
    isSyncingFromProps.value = false;
  }
);

watch(
  () => [props.height, props.minHeight],
  async () => {
    await nextTick();
    toRaw(codeEditor.value)?.layout();
  }
);

const resetCode = () => {
  toRaw(codeEditor.value)?.setValue("");
};

const layoutEditor = () => {
  toRaw(codeEditor.value)?.layout();
};

defineExpose({
  layoutEditor,
  resetCode,
});
</script>

<style scoped>
.code-editor {
  width: 100%;
}
</style>
