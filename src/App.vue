<script setup>
import Form from './components/Form.vue'
import AdsTest from './components/AdsTest.vue'
</script>

<template>
  <main>
    <h4>数据表的更改</h4>
    <Form />
    <h4>BI录入测试链接生成</h4>
    <AdsTest />
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
  h4:nth-of-type(2){
    margin-top: 1rem;
  }
  code {
    font-size: 0.875em;
    color: #d63384;
    word-wrap: break-word;
  }
</style>
