<script setup>
import { ref, reactive } from "vue";
import { ElButton, ElInput } from "element-plus";
import {
  addRecords,
  getSelectionName,
  getTableByName,
} from "@/utils/larksheet.js";
const accList = ref("");
const sub = () => {
  const accListObj = [];
  let star = 0;
  let tmp = {};
  accList.value.split("\n").forEach((item, index) => {
    // 0 3 6 9 12
    if (index === star) {
      tmp.name = item;
    }
    if (index === star + 1) {
      tmp.id = item;
    }
    if (index === star + 2) {
      accListObj.push(tmp);
      tmp = {};
      star = index + 1;
    }
  });
  insertU(accListObj);
};
const insertU = async (accListObj) => {
  const name = await getSelectionName();
  console.log(name, "name");
  if (name === "💲💲💲-账户列表") {
    // if (adsIDs.value && fansIDs.value) {
    const mainTable = await getTableByName(name);

    const fieldMetaList = [
      "fldEXlTkOf", // accId
      "fldzzeTnMW", // accName
    ];
    // const insertList = list.map((item) => {
    //   return {
    //     fields: {
    //       [fieldMetaList[0]]: [{ type: "text", text: item.fansId }],
    //       [fieldMetaList[1]]: [{ type: "text", text: item.personId }],
    //     },
    //   };
    // });
    const insertList = [
      {
        fields: {
          [fieldMetaList[0]]: [{ type: "text", text: "123" }],
          [fieldMetaList[1]]: [{ type: "text", text: "test" }],
        },
      },
    ];
    await mainTable.addRecords(insertList);
  }
};
</script>

<template>
  <div class="TwoFA">
    <el-input
      v-trim
      v-model.trim="accList"
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
