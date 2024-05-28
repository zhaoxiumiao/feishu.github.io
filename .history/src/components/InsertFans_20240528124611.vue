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
    const html = ref("");
    const data = ref("");
    const sub = () => {};
    const insert = () => {};
    return {
      html,
      data,
      sub,
      insert,
    };
  },
};
</script>

<template>
  <div class="TwoFA">
    <el-input
      v-trim
      v-model="html"
      :rows="2"
      type="textarea"
      placeholder="Please input"
    />
    <el-button type="primary" plain size="large" @click="sub"
      >提取信息</el-button
    >
    <el-input
      v-trim
      v-model="data"
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
