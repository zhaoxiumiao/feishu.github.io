<script setup>
import FormLark from "@/components/FormLark.vue";
import AdsTest from "@/components/AdsTest.vue";
import CityName from "@/components/CityName.vue";
import TwoFA from "@/components/TwoFA.vue";
import { useRouter } from "vue-router";
const router = useRouter();
const tolink = () => {
  const routeUrl = router.resolve({ name: "search" });
  window.open(routeUrl.href, "_blank");
};
</script>

<template>
  <main>
    <h4>2FA</h4>
    <TwoFA />
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
