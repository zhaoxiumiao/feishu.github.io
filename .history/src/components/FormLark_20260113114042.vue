<script setup>
import { bitable } from "@lark-base-open/js-sdk";
import { ref, reactive } from "vue";
import { ElButton, ElForm, ElMessage } from "element-plus";

// ==========================================
// 1. 配置区域 (完全沿用你原版代码的 ID)
// ==========================================
// 原代码中的硬编码 ID 列表

// ==========================================
// 2. 工具函数
// ==========================================

const getTable = async (name) => {
  return await bitable.base.getTableByName(name);
};

// 批量清空表 (保留)
const clearTableData = async (tableName) => {
  const table = await getTable(tableName);
  const recordIds = await table.getRecordIdList();
  if (recordIds && recordIds.length) {
    // 飞书限制每次操作5000条
    await table.deleteRecords(recordIds.slice(0, 5000));
  }
};
// 寻找个人号数据
const getAccData = async (acc_id) => {
  const table = await getTable("个人号数据");
  const field_ids = [
    "fldDjAnJjN", // 0: 个人号ID
    "fld0btOhWm", // 1: 个人号状态
    "fldf8CdwnX", // 2: 备注
  ];
  let hasMore = true;
  let pageToken = null;
  let res = {};
  console.log(acc_id);

  while (hasMore) {
    // 每次最多拉取 5000 条 (飞书上限)
    const response = await table.getRecords({
      pageSize: 5000,
      pageToken: pageToken,
    });
    const records = response.records; // 这是当前页的所有行数据
    if (records.length) {
      const acc_data = records.find((item) => {
        if (!item.fields[field_ids[0]]) {
          return false;
        }
        if (!item.fields[field_ids[0]][0]) {
          return false;
        }
        return item.fields[field_ids[0]][0].text == acc_id;
      });
      if (acc_data) {
        res = {
          acc_id,
          status: acc_data.fields[field_ids[1]].text,
          remark: acc_data.fields[field_ids[2]][0].text,
        };
      }
    }

    // 处理下一页
    hasMore = response.hasMore;
    pageToken = response.pageToken;
  }
  return res;
};
const addtest = async () => {
  const table = await getTable("BM的数据");
  const bm_id_data = await table.getFieldByName("BMID");
  const bm_id_field_id = bm_id_data.id;
  // const nameList = await nameF.getFieldValueList();
  const fieldIdList = await table.getFieldMetaList();
  const acc_list = fieldIdList.filter((field) =>
    field.name.includes("绑定个人号")
  );
  const acc_id_list = acc_list.map((f) => f.id);
  // console.log("ID 数组 (可直接复制):", acc_id_list);
  // console.log(bm_id_field_id, "bm");
  let hasMore = true;
  let pageToken = null;
  const res = [
    // {
    //   BMID: '123',
    //   child: [
    //     '334',
    //     '335',
    //   ]
    // }
  ];
  while (hasMore) {
    // 每次最多拉取 5000 条 (飞书上限)
    const response = await table.getRecords({
      pageSize: 5000,
      pageToken: pageToken,
    });
    const records = response.records; // 这是当前页的所有行数据
    console.log(records, "re");

    records.forEach((item) => {
      const temp = {
        BMID: item.fields[bm_id_field_id][0].text,
      };
      const a = acc_id_list
        .map((item2) => item.fields[item2])
        .filter((item) => {
          if (item) {
            return item;
          }
        });
      temp.child = a.map(async (item) => {
        const res = await getAccData(item[0].text);
        return res;
      });
      res.push(temp);
    });
    // console.log(res[0].child, "000");

    // 处理下一页
    hasMore = response.hasMore;
    pageToken = response.pageToken;
  }
  // console.log(res, "res");
};

const check = async () => {
  ElMessage.info("请使用原版逻辑或等待修复");
};
const total = async () => {
  ElMessage.info("请使用原版逻辑或等待修复");
};
</script>

<template>
  <div
    class="container"
    v-loading="loading"
    element-loading-text="正在处理大量数据，请稍候..."
  >
    <el-form class="form" label-position="top">
      <h4>多维表格自动化工具</h4>
      <el-button type="primary" size="large" @click="addtest">
        测试-test
      </el-button>
    </el-form>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
}
.desc {
  color: #666;
  margin-bottom: 20px;
  font-size: 14px;
}
.el-button {
  display: block;
  width: 100%;
  margin-left: 0 !important;
  margin-bottom: 15px;
}
h4 {
  margin-bottom: 10px;
}
</style>
