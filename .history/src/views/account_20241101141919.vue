<script setup>
import AddAccount from "@/components/AddAccount";
import { useRouter } from "vue-router";
</script>

<template>
  <main>
    <h4>2FA</h4>
    <AddAccount />
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
