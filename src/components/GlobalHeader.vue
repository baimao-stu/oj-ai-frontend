<template>
  <a-row class="grid-demo" align="center" :wrap="false">
    <a-col flex="auto">
      <div>
        <a-menu
          mode="horizontal"
          :selected-keys="selectedKeys"
          @menu-item-click="doMenuClick"
        >
          <a-menu-item
            key="0"
            :style="{ padding: 0, marginRight: '38px' }"
            disabled
          >
            <div class="title-bar">
              <img class="logo" src="../assets/oj-logo.svg" />
              <div class="title">Online Judge</div>
            </div>
          </a-menu-item>
          <a-menu-item v-for="item in visibleRoute" :key="item.path"
            >{{ item.name }}
          </a-menu-item>
        </a-menu>
      </div>
    </a-col>
    <a-col flex="100px">
      <div>
        {{ store.state.user?.loginUser?.userName ?? "未登录" }}
      </div>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { routes } from "@/router/routes";
import { useRouter } from "vue-router";
import { computed, ref } from "vue";
import { useStore } from "vuex";
import checkAccess from "@/access/checkAccess";
import ACCESS_ENUM from "@/access/accessEnum";

const router = useRouter();
const selectedKeys = ref(["/"]); //默认选中的路由
//获取状态管理信息
const store = useStore();

//过滤隐藏的路由
const visibleRoute = computed(() => {
  // console.log("header", store.state.user.loginUser);
  return routes.filter((item, index) => {
    if (item.meta?.hidden) {
      return false;
    }
    //根据用户权限过滤用户不可见的路由
    if (
      !checkAccess(store.state.user?.loginUser, item.meta?.access as string)
    ) {
      return false;
    }
    return true;
  });
});

//点击菜单，更新路由
const doMenuClick = (key: string) => {
  router.push({
    path: key,
  });
};

//路由跳转后更新当前选中的菜单
router.afterEach((to, from, failure) => {
  selectedKeys.value = [to.path];
});

// setTimeout(() => {
//   // 分发 action
//   store.dispatch("user/getLoginUser", {
//     userName: "baimao管理员",
//     userRole: ACCESS_ENUM.ADMIN,
//   });
// }, 3000);
</script>

<style scoped>
.logo {
  height: 48px;
}

.title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: #444;
  margin-left: 16px;
}
</style>
