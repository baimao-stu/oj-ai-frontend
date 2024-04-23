import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@/router/routes";

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  // history: createWebHistory("/oj"), //路由前缀
  routes,
});

export default router;
