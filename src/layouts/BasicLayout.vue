<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <!-- <a-layout-footer class="footer"> © 2026 AcCode </a-layout-footer> -->
    </a-layout>
  </div>
</template>

<script>
import GlobalHeader from "@/components/GlobalHeader";

export default {
  components: { GlobalHeader },
};
</script>

<style scoped>
#basicLayout {
  height: 100vh;
}

#basicLayout .header {
  flex: 0 0 auto;
  margin-bottom: 10px;
  box-shadow: #d7d6d6 1px 1px 5px;
}

#basicLayout .content {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  background: linear-gradient(to right, #fefefe, #fff);
  //background: #f2f3f6;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px;
}

#basicLayout .footer {
  //background: #efffff;
  //position: sticky;
  flex: 0 0 auto;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  padding: 12px;
  font-family: "Satisfy", cursive;
  font-size: 18px;
}

#basicLayout :deep(.arco-layout) {
  height: 100%;
}
</style>
