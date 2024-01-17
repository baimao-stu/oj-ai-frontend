<template>
  <div id="userLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <a-space>
          <img src="../assets/oj-logo.svg" class="logo" />
          <div>Online Judge</div>
        </a-space>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">baimao@Online Judge</a-layout-footer>
    </a-layout>
  </div>
</template>

<script></script>

<style scoped>
.logo {
  height: 64px;
  width: 64px;
}

#userLayout {
  text-align: center;
  background: url("https://gw.alipayobjects.com/zos/rmsportal/FfdJeJRQWjEeGTpqgBKj.png")
    0% 0% / 100% 100%;
}

#userLayout .header {
  margin-bottom: 10px;
  margin-top: 16px;
}

#userLayout .content {
  margin-bottom: 16px;
  padding: 20px;
}

#userLayout .footer {
  position: sticky;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  padding: 16px;
}
</style>
