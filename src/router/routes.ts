import { RouteRecordRaw } from "vue-router";
import HomeView from "../views/SampleView.vue";
import NoAuthView from "@/views/NoAuthView.vue";
import AdminView from "@/views/AdminView.vue";
import ACCESS_ENUM from "@/access/accessEnum";
import UserLayout from "@/layouts/UserLayout.vue";
import UserLoginView from "@/views/user/UserLoginView.vue";
import UserRegisterView from "@/views/user/UserRegisterView.vue";
import AddQuestionView from "@/views/question/AddQuestionView.vue";
import ManageQuestionView from "@/views/question/ManageQuestionView.vue";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/user",
    name: "用户模块",
    component: UserLayout,
    children: [
      {
        path: "/user/login",
        name: "用户登录",
        component: UserLoginView,
      },
      {
        path: "/user/register",
        name: "用户注册",
        component: UserRegisterView,
      },
    ],
    meta: {
      hidden: true,
    },
  },
  {
    path: "/add/question",
    name: "新增题目",
    component: AddQuestionView,
    // meta: {
    //   access: ACCESS_ENUM.ADMIN, //有canAdmin权限的用户才可访问
    // },
  },
  {
    path: "/update/question",
    name: "修改题目",
    component: AddQuestionView,
    meta: {
      // access: ACCESS_ENUM.ADMIN, //有canAdmin权限的用户才可访问
      hidden: true,
    },
  },
  {
    path: "/manage/question",
    name: "管理题目",
    component: ManageQuestionView,
    // meta: {
    //   access: ACCESS_ENUM.ADMIN, //有canAdmin权限的用户才可访问
    // },
  },
  {
    path: "/",
    name: "题目模块",
    component: HomeView,
  },
  {
    path: "/admin",
    name: "管理员可见",
    component: AdminView,
    meta: {
      access: ACCESS_ENUM.ADMIN, //有canAdmin权限的用户才可访问
    },
  },
  {
    path: "/noAuth",
    name: "没有权限",
    component: NoAuthView,
    meta: {
      hidden: true,
    },
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },
];
