import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index";
import trim from "./directives/trim.js";

import "./assets/main.css";
import "element-plus/theme-chalk/el-notification.css";
// 引入vue-pro-table

const app = createApp(App);
app.use(router);
app.directive("trim", trim);
app.mount("#app");
