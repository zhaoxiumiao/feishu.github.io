<script>
import { ref, reactive } from "vue";
import {
  ElButton,
  ElInput,
  ElSelect,
  ElOption,
  ElForm,
  ElFormItem,
  ElNotification,
} from "element-plus";
import getCode from "../utils/2fa.js";
import ClipboardJS from "clipboard";
export default {
  components: {
    ElButton,
    ElInput,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
  },
  setup() {
    const key = ref("");
    const value = ref("");
    const sub = () => {
      value.value = getCode(
        key.value.replace(/\s*/g, "").replace(/[^a-zA-Z0-9]/g, "")
      );
    };
    const copy = () => {
      let clipboard = new ClipboardJS(".TwoFA", {
        text: () => {
          //返回需要复制的字符串
          return value.value;
        },
      });
      clipboard.on("success", () => {
        clipboard.destroy();
        ElNotification({
          title: "Copy Success",
          position: "top-left",
          type: "success",
        });
      });
      clipboard.on("error", () => {
        clipboard.destroy();
      });
    };
    return {
      key,
      value,
      sub,
      copy,
    };
  },
};
</script>

<template>
  <div class="TwoFA">
    <el-input
      v-trim
      v-model="key"
      :rows="2"
      type="textarea"
      placeholder="Please input"
    />
    <el-button type="primary" plain size="large" @click="sub"
      >提取信息</el-button
    >
    <el-input
      v-trim
      v-model="value"
      :rows="2"
      type="textarea"
      placeholder="Please input"
    />
    <el-button @click="copy" type="primary" plain size="large">插入</el-button>
  </div>
</template>

<style scoped>
p {
  margin-top: 1rem;
}
.TwoFA :deep(.el-button) {
  margin-top: 1rem;
  margin-bottom: 1rem;
  display: block;
  margin-left: 0;
}
</style>
