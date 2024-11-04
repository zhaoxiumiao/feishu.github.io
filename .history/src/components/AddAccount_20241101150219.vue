<script setup>
import { ref, reactive } from "vue";
import { ElButton, ElInput } from "element-plus";
const accList = ref("");
const sub = () => {
  accList.value.split("\n").forEach((item) => {
    console.log(item, "item");
  });
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
    <el-button type="primary" plain size="large" @click="sub">提交</el-button>
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
