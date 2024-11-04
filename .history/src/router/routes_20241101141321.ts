import { RouteRecordRaw } from "vue-router";
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "index",
    component: () => import("@/views/index.vue"), //.vue不能省略
  },
  {
    path: "/search",
    name: "search",
    component: () => import("@/views/search.vue"), //.vue不能省略
  },
  {
    path: "/lark",
    name: "lark",
    component: () => import("@/views/lark.vue"), //.vue不能省略
  },
  {
    path: "/insert",
    name: "insert",
    component: () => import("@/views/insert.vue"), //.vue不能省略
  },
  {
    path: "/account",
    name: "account",
    component: () => import("@/views/account.vue"), //.vue不能省略
  },
  {
    path: "/phonetic_symbols",
    name: "phonetic_symbols",
    component: () => import("@/views/phonetic_symbols.vue"), //.vue不能省略
  },
];
export default routes;
