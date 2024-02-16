<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer"> © 2024 AcCode </a-layout-footer>
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
}

#basicLayout .header {
  margin-bottom: 10px;
  box-shadow: #d7d6d6 1px 1px 5px;
}

#basicLayout .content {
  background: linear-gradient(to right, #fefefe, #fff);
  //background: #f2f3f6;
  margin-bottom: 16px;
  padding: 10px;
}

#basicLayout .footer {
  //background: #efffff;
  //position: sticky;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  padding: 16px;
  font-family: "Satisfy", cursive;
  font-size: 18px;
}
</style>
