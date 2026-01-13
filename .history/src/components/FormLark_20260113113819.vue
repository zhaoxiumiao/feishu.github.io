<script setup>
import { bitable } from "@lark-base-open/js-sdk";
import { ref, reactive } from "vue";
import { ElButton, ElForm, ElMessage } from "element-plus";

// ==========================================
// 1. 配置区域 (完全沿用你原版代码的 ID)
// ==========================================
// 原代码中的硬编码 ID 列表
const ORIGINAL_FIELD_IDS = [
  "fldamqjgCi", // 0: Pack Name ID
  "fldxs3m5oK", // 1: Pack Status ID
  "flds2sw1zl", // 2: BM Name ID
  "fldpZOIUJs", // 3: BM Status ID
  "fldYDmwkFW", // 4: Ads Name ID
  "fldOtNEMD7", // 5: Ads Status ID
  "fldODZOISb", // 6: Fans Name ID
  "fldZKS0Qrl", // 7: Fans Status ID
  "fldlPGwOHc", // 8: Person Name ID
  "fldU13dDiD", // 9: Person Status ID
];

const CONFIG = {
  MAIN_TABLE_NAME: "资产状态总览",
  // 层级结构配置
  HIERARCHY: {
    pack: {
      tableName: "app",
      nameField: "包ID",
      statusField: "包状态",
      childKey: "bm",
    },
    bm: {
      tableName: "BM",
      nameField: "BMID",
      statusField: "BM状态",
      childKey: "ads",
      parentField: "包ID",
    }, // 注意原代码 parent 是 'pack'
    ads: {
      tableName: "广告账户",
      nameField: "广告账户ID",
      statusField: "广告账户状态",
      childKey: "fans",
      parentField: "BMID",
    }, // 原代码 parent 是 'bm'
    fans: {
      tableName: "广告账户粉丝页",
      nameField: "粉丝页ID",
      statusField: "粉丝页的状态",
      childKey: "person",
      parentField: "广告账户ID",
    },
    person: {
      tableName: "粉丝页个人号",
      nameField: "个人号ID",
      statusField: "个人号的状态",
      childKey: null,
      parentField: "粉丝页ID",
    },
  },
};

const loading = ref(false);

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

// 高效读取：一次性获取所有数据并转为 Map
const fetchTableDataMap = async (
  tableName,
  nameField,
  statusField,
  parentField
) => {
  const table = await getTable(tableName);
  const nameF = await table.getFieldByName(nameField);
  const statusF = await table.getFieldByName(statusField);

  const nameList = await nameF.getFieldValueList();
  const statusList = await statusF.getFieldValueList();

  let parentList = null;
  if (parentField) {
    const parentF = await table.getFieldByName(parentField);
    parentList = await parentF.getFieldValueList();
  }

  // 构建 Map: recordId -> { text, status, parentText }
  const map = new Map();

  // 辅助获取 text
  const getText = (val) => (val && val[0] ? val[0].text : null);

  // 建立索引
  const statusMap = new Map(
    statusList.map((item) => [item.record_id, item.value])
  );
  const parentMap = parentList
    ? new Map(parentList.map((item) => [item.record_id, item.value]))
    : new Map();

  nameList.forEach((item) => {
    const id = item.record_id;
    map.set(id, {
      id: id,
      text: getText(item.value),
      // status: getText(statusMap.get(id)), // 原代码其实没用到写入状态，这里读出来备用
      parentText: getText(parentMap.get(id)),
      children: [],
    });
  });

  return map; // 返回 Map<RecordId, Object>
};

// ==========================================
// 3. 核心逻辑：addRecord (重构版)
// ==========================================
const addRecord = async () => {
  loading.value = true;
  try {
    const mainTable = await getTable(CONFIG.MAIN_TABLE_NAME);

    // 1. 清空旧数据
    await clearTableData(CONFIG.MAIN_TABLE_NAME);

    // 2. 准备数据源 (并行读取，提速)
    // 根据原代码逻辑，我们需要把 pack, bm, ads, fans, person 的数据都取出来
    const dataStore = {};
    const levels = ["pack", "bm", "ads", "fans", "person"];

    // 串行或并行读取所有源表数据
    for (const key of levels) {
      const conf = CONFIG.HIERARCHY[key];
      // 注意：这里需要对应原代码的关联逻辑。原代码是通过 "Parent Name" 匹配 "Current ID Name"
      // 例如 BM 表里有个列叫 "PackID" (对应 parentField)，它的值应该等于 Pack 表里的 "PackID"
      // 为了适配原代码逻辑，这里参数要做对应
      // 原代码：parent = tableFieldNames[obj].parent
      let parentFieldNameInCurrentTable = null;
      if (key !== "pack") {
        // 这里的逻辑是：在 BM 表里找 "pack" 对应的列名。
        // 原代码里写死了一些逻辑，这里为了简化，假设 CONFIG 里配置的 parentField 就是列名
        parentFieldNameInCurrentTable = conf.parentField;
      }

      dataStore[key] = await fetchTableDataMap(
        conf.tableName,
        conf.nameField,
        conf.statusField,
        parentFieldNameInCurrentTable // 比如在 BM 表里读取 "包ID" 列
      );
    }

    // 3. 组装树结构 (Link Phase)
    // 从下往上挂载，或者从上往下查找。原代码用了双重循环，这里用 Map 优化。
    // 逻辑：遍历子级，找到父级，push 进去。

    const linkLevels = (parentKey, childKey) => {
      const parentMap = dataStore[parentKey]; // Map<RecordId, Item>
      const childMap = dataStore[childKey]; // Map<RecordId, Item>

      // 因为关联是通过 Text 匹配的 (原代码逻辑: item.id.text == item2.parentId.text)
      // 我们需要一个 Text -> ParentItem 的反向索引
      const parentTextMap = new Map();
      for (const item of parentMap.values()) {
        if (item.text) parentTextMap.set(item.text, item);
      }

      for (const child of childMap.values()) {
        if (child.parentText && parentTextMap.has(child.parentText)) {
          parentTextMap.get(child.parentText).children.push(child);
        }
      }
    };

    linkLevels("pack", "bm");
    linkLevels("bm", "ads");
    linkLevels("ads", "fans");
    linkLevels("fans", "person");

    // 4. 扁平化并生成写入数据 (Flatten Phase)
    const insertRecords = [];

    // 递归函数：生成要写入的行
    // accumulatedFields: 继承下来的父级字段数据
    const processNode = (nodes, levelIndex, accumulatedFields) => {
      // 映射当前层级对应的 目标列ID
      // 原代码逻辑：pack用 index 0, bm 用 index 2, ads 用 index 4... (跳过状态列)
      const nameColId = ORIGINAL_FIELD_IDS[levelIndex * 2];
      // const statusColId = ORIGINAL_FIELD_IDS[levelIndex * 2 + 1]; // 状态列ID，原代码未写入，这里也不写

      for (const node of nodes) {
        // 构建当前行的字段
        const currentFields = {
          ...accumulatedFields,
          [nameColId]: [{ type: "text", text: node.text }],
          // 注意：这里绝对不能写 statusColId，否则就会报 Error: not support
        };

        if (node.children && node.children.length > 0) {
          // 有子节点，继续向下，传递当前字段
          processNode(node.children, levelIndex + 1, currentFields);
        } else {
          // 没有子节点（或者是最后一层），这行数据完结，加入待写入列表
          // 原代码逻辑：只有叶子节点或者无子节点的才 push
          insertRecords.push({ fields: currentFields });
        }
      }
    };

    // 从 Pack 层开始处理
    // dataStore.pack 是 Map，转为 Array
    processNode(Array.from(dataStore.pack.values()), 0, {});

    console.log(`共生成 ${insertRecords.length} 条数据，开始写入...`);
    console.log(insertRecords, "re");

    // 5. 批量写入 (Batch Insert)
    const BATCH_SIZE = 1000;
    for (let i = 0; i < insertRecords.length; i += BATCH_SIZE) {
      const chunk = insertRecords.slice(i, i + BATCH_SIZE);
      await mainTable.addRecords(chunk);
    }

    ElMessage.success(`成功更新！共写入 ${insertRecords.length} 条数据`);
  } catch (error) {
    console.error(error);
    ElMessage.error(`运行报错: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

// 这里的 check 和 total 函数暂时省略，你可以按需保留你原版的或者用我上次优化的
// 重点是 addRecord 修复了
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
      <p class="desc">请确保已正确配置表名和字段ID</p>
      <el-button type="primary" size="large" @click="addRecord">
        1. 更新【资产状态总览】(Pack->BM->Ads...)
      </el-button>
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
