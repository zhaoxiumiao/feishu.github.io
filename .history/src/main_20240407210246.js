import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index";
import trim from "./directives/trim.js";

import "./assets/main.css";
// import "element-plus/theme-chalk/el-notification.css";
// 引入element-plus
import ElementPlus from "element-plus";
import "element-plus/theme-chalk/el-notification.css";
import locale from "element-plus/lib/locale/lang/zh-cn";

const app = createApp(App);
app.use(ElementPlus, { locale });
app.use(router);
app.directive("trim", trim);
app.mount("#app");
