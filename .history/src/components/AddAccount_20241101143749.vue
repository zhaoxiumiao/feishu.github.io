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
    const accList = ref("");
    const sub1 = () => {
      // console.log(11111);
      console.error(11111);

      // console.log(accList.value);

      // accList.value.split("\n").forEach((item) => {
      //   console.log(item, "item");
      // });
    };
    return {
      accList,
      sub1,
    };
  },
};
</script>

<template>
  <div class="TwoFA">
    <el-input
      v-trim
      v-model="accList"
      :rows="8"
      type="textarea"
      placeholder="Please input"
    />
    <el-button type="primary" plain size="large" @click="sub1">提交</el-button>
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
