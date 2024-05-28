<script setup>
import Form from "@/components/Form.vue";
import AdsTest from "@/components/AdsTest.vue";
import CityName from "@/components/CityName.vue";
import TwoFA from "@/components/TwoFA.vue";
import InsertFans from "@/components/InsertFans.vue";
import { useRouter } from "vue-router";
const router = useRouter();
const tolink = () => {
  const routeUrl = router.resolve({ name: "search" });
  window.open(routeUrl.href, "_blank");
};
</script>

<template>
  <main>
    <h4>数据表的更改</h4>
    <Form />
    <h4>BI录入测试链接生成</h4>
    <AdsTest />
    <h4>城市英文名称检索</h4>
    <CityName />
    <h4>2FA</h4>
    <TwoFA />
    <h4>Facebook 兴趣词工具</h4>
    <el-button type="primary" plain size="large" @click="tolink"
      >前往工具页面</el-button
    >
    <h4>粉丝页数据表批量插入</h4>
  </main>
</template>

<style scoped>
main {
  padding: 1rem;
}
h4 {
  font-size: calc(1.275rem + 0.3vw);
  margin-bottom: 1rem;
}
h4:nth-of-type(2) {
  margin-top: 1rem;
}
code {
  font-size: 0.875em;
  color: #d63384;
  word-wrap: break-word;
}
</style>
