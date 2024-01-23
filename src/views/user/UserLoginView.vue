<template>
  <div class="about">
    <a-form
      style="max-width: 480px; margin: 0 auto"
      label-align="left"
      auto-label-width
      :model="form"
      @submit="handleSubmit"
    >
      <a-form-item field="userAccount" label="账号">
        <a-input v-model="form.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item field="userPassword" tooltip="密码不少于 8 位" label="密码">
        <a-input-password
          v-model="form.userPassword"
          placeholder="请输入密码"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 120px"
          >登录</a-button
        >
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
import { reactive } from "vue";
import { UserControllerService, UserLoginRequest } from "../../../generated";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import message from "@arco-design/web-vue/es/message";
// import { Message } from "@arco-design/web-vue";

const store = useStore();
const router = useRouter();

const form = reactive({
  userAccount: "",
  userPassword: "",
} as UserLoginRequest);
const handleSubmit = async () => {
  //登陆
  const res = await UserControllerService.userLoginUsingPost(form);
  if (res.code === 0) {
    //更新用户状态信息
    await store.dispatch("user/getLoginUser", res.data);
    // console.log("更新登录状态", store.state.user.loginUser);
    router.push({
      path: "/", //登陆成功，跳转到首页
      replace: true,
    });
  } else {
    message.error("登录失败，" + res.message);
    // message.error("登陆失败", res.message);
  }
};
</script>
