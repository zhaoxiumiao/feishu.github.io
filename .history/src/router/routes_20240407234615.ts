import { RouteRecordRaw } from "vue-router";
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "index",
    title: "首页",
    component: () => import("@/views/index.vue"), //.vue不能省略
  },
  {
    path: "/search",
    name: "search",
    title: "首页",
    component: () => import("@/views/search.vue"), //.vue不能省略
  },
];
export default routes;
