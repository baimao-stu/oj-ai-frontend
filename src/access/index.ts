import ACCESS_ENUM from "@/access/accessEnum";
import router from "@/router";
import store from "@/store";
import checkAccess from "@/access/checkAccess";

//路由跳转前判断当前用户权限是否匹配当前路由
router.beforeEach(async (to, from, next) => {
  console.log("登陆用户信息", store.state.user.loginUser);

  const loginUser = store.state.user.loginUser;
  //如果之前未登录，自动登录
  if (!loginUser.userRole) {
    //await 是为了等用户登录成功之后再执行之后的代码
    await store.dispatch("user/getLoginUser");
    console.log("自动登录后", store.state.user.loginUser);
  }
  const needAccess = (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN;
  //若跳转的页面必须登录
  if (needAccess !== ACCESS_ENUM.NOT_LOGIN) {
    //如未登录过（没有userRole），跳转到登录页面
    if (!loginUser.userRole) {
      next(`/user/login?redirect=${to.fullPath}`);
      console.log("未登录过，跳转到登录页面");
      return;
    }
    //已登录，但权限不足
    if (!checkAccess(loginUser, needAccess)) {
      next("/noAuth");
      return;
    }
  }
  next();
});
