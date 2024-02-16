import { RouteRecordRaw } from "vue-router";
import NoAuthView from "@/views/NoAuthView.vue";
import ACCESS_ENUM from "@/access/accessEnum";
import UserLayout from "@/layouts/UserLayout.vue";
import UserLoginView from "@/views/user/UserLoginView.vue";
import UserRegisterView from "@/views/user/UserRegisterView.vue";
import AddQuestionView from "@/views/question/AddQuestionView.vue";
import ManageQuestionView from "@/views/question/ManageQuestionView.vue";
import QuestionsView from "@/views/question/QuestionsView.vue";
import ViewQuestionView from "@/views/question/ViewQuestionView.vue";
import QuestionSubmitView from "@/views/question/QuestionSubmitView.vue";
import SampleView from "@/views/SampleView.vue";

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
    path: "/list/question",
    name: "题库",
    component: QuestionsView,
  },
  {
    path: "/add/question",
    name: "新增题目",
    component: AddQuestionView,
    meta: {
      access: ACCESS_ENUM.USER,
    },
  },
  {
    path: "/view/question/:id",
    name: "浏览题目",
    component: ViewQuestionView,
    meta: {
      access: ACCESS_ENUM.USER,
      hidden: true,
    },
    props: true,
  },
  {
    path: "/update/question",
    name: "修改题目",
    component: AddQuestionView,
    meta: {
      access: ACCESS_ENUM.USER,
      hidden: true,
    },
  },
  {
    path: "/manage/question",
    name: "管理题目",
    component: ManageQuestionView,
    meta: {
      access: ACCESS_ENUM.ADMIN, //有canAdmin权限的用户才可访问
    },
  },
  {
    path: "/list/question_submit",
    name: "提交列表",
    component: QuestionSubmitView,
    meta: {
      access: ACCESS_ENUM.USER,
    },
  },
  {
    path: "/",
    name: "主页",
    component: QuestionsView,
  },
  {
    path: "/sample",
    name: "示例",
    component: SampleView,
    meta: {
      hidden: true,
    },
  },

  // {
  //   path: "/admin",
  //   name: "管理员可见",
  //   component: AdminView,
  //   meta: {
  //     access: ACCESS_ENUM.ADMIN, //有canAdmin权限的用户才可访问
  //   },
  // },
  {
    path: "/noAuth",
    name: "没有权限",
    component: NoAuthView,
    meta: {
      hidden: true,
    },
  },
  // {
  //   path: "/about",
  //   name: "about",
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  // },
];
