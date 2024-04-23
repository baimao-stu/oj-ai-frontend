<template>
  <div id="GlobalHeader">
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
                <div class="title">AcCode</div>
              </div>
            </a-menu-item>
            <a-menu-item v-for="item in visibleRoute" :key="item.path"
              >{{ item.name }}
            </a-menu-item>
            <a-sub-menu key="contest">
              <template #title>比赛</template>
              <a-menu-item key="1" @click="to_contestList"
                >比赛列表</a-menu-item
              >
              <a-menu-item key="2" @click="to_my_join">我的加入</a-menu-item>
              <a-menu-item key="3" @click="to_my_add">我的创建</a-menu-item>
              <a-menu-item key="4" @click="to_add">创建比赛</a-menu-item>
            </a-sub-menu>
          </a-menu>
        </div>
      </a-col>
      <a-col flex="120px">
        <div>
          <a-space>
            <div class="dropdown-div">
              <a-dropdown trigger="hover" style="width: 80px">
                <a-button
                  type="outline"
                  status="success"
                  class="dropdown-button"
                >
                  {{ store.state.user?.loginUser?.userName ?? "未登录" }}
                </a-button>
                <template #content>
                  <a-doption @click="login_logout">
                    {{
                      store.state.user?.loginUser?.userName ? "退出" : "登录"
                    }}
                  </a-doption>
                  <a-doption @click="to_register">注册</a-doption>
                </template>
              </a-dropdown>
            </div>
          </a-space>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { routes } from "@/router/routes";
import { useRouter } from "vue-router";
import { computed, ref } from "vue";
import { useStore } from "vuex";
import checkAccess from "@/access/checkAccess";
import ACCESS_ENUM from "@/access/accessEnum";
import message from "@arco-design/web-vue/es/message";
import { UserControllerService } from "../../generated";

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

/**
 * 登录、退出、注册
 */
const login_logout = async () => {
  await store.dispatch("user/getLoginUser");
  const loginUser = store.state.user.loginUser;
  //如果未登录，跳转到登录页面
  if (loginUser.userRole === ACCESS_ENUM.NOT_LOGIN) {
    router.push({
      path: "/user/login",
      replace: true,
    });
  } else {
    //如果已登录，则退出
    const res = await UserControllerService.userLogoutUsingPost();
    if (res.code === 0) {
      message.success("已退出");
      router.push({
        path: "/user/login",
        replace: true,
      });
    } else {
      message.error("退出失败，" + res.message);
    }
  }
};
const to_register = () => {
  router.push({
    path: "/user/register",
    replace: true,
  });
};

const to_contestList = () => {
  router.push({
    path: "/list/contest",
    replace: true,
  });
};
const to_my_join = () => {
  router.push({
    path: "/myJoin/contest",
    replace: true,
  });
};
const to_my_add = () => {
  router.push({
    path: "/myAdd/contest",
    replace: true,
  });
};
const to_add = () => {
  router.push({
    path: "/add/contest",
    replace: true,
  });
};

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
  font-family: "Satisfy", cursive;
  font-size: 30px;
}

.dropdown-button {
  text-align: left;
  display: inline;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
