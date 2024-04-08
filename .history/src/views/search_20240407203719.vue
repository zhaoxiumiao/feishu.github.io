<script setup>
import Vue3ProTable from "vue3-pro-table";
</script>

<template>
  <vue3-pro-table title="列表" :request="getList" :columns="columns">
    <template #operate="scope">
      <el-button size="mini" type="primary">编辑</el-button>
      <el-button size="mini" type="danger">删除</el-button>
    </template>
  </vue3-pro-table>
</template>

<style scoped></style>
