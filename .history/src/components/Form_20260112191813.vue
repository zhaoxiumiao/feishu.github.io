<script setup>
import { bitable, FieldType } from "@lark-base-open/js-sdk";
import { ref, onMounted, reactive } from "vue";
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElMessage,
  ElLoading,
} from "element-plus";

// ==========================================
// 1. 配置区域 (关键！请核对这里的 ID)
// ==========================================
// 注意：原代码中有很多类似 'fldamqjgCi' 的字符串，这些是字段(列)的唯一ID。
// 如果你新建了表格，这些ID会变，必须重新去飞书里获取并填入这里。
const CONFIG = {
  // 表名常量
  TABLE_NAMES: {
    MAIN: "资产状态总览",
    AGENCY: "粉丝页代理商",
    STATS: "广告账户统计",
    PACK: "app",
    BM: "BM",
    ADS: "广告账户",
    FANS: "广告账户粉丝页",
    PERSON: "粉丝页个人号",
  },
  // 资产总览表对应的列ID (根据原代码推测)
  MAIN_TABLE_FIELDS: {
    PACK_ID: "fldamqjgCi", // 包ID列
    BM_ID: "fldxs3m5oK", // BM列
    ADS_ID: "flds2sw1zl", // 广告账户列
    FANS_ID: "fldpZOIUJs", // 粉丝页列
    PERSON_ID: "fldYDmwkFW", // 个人号列
    // ...其他状态列ID在逻辑中动态获取或需补充
  },
  // 统计逻辑用的状态枚举
  STATUS_ENUM: {
    NORMAL: ["正常使用中", "正常待使用", "申诉成功"],
    LIMIT: ["受限", "弃用", "申诉失败", "正在申诉"],
  },
};

// ==========================================
// 2. 飞书 API 封装工具函数
// ==========================================

// 获取表实例
const getTable = async (name) => {
  try {
    return await bitable.base.getTableByName(name);
  } catch (e) {
    console.error(`表格不存在: ${name}`, e);
    ElMessage.error(`找不到表格: ${name}`);
    throw e;
  }
};

// 批量清空表格数据 (保留前5000条限制逻辑)
const clearTableData = async (tableName) => {
  const table = await getTable(tableName);
  const recordIdList = await table.getRecordIdList();
  if (recordIdList && recordIdList.length > 0) {
    // 飞书一次最多删5000条
    const idsToDelete = recordIdList.slice(0, 5000);
    await table.deleteRecords(idsToDelete);
    console.log(`已清空 ${tableName} 表格 ${idsToDelete.length} 条数据`);
  }
};

// 获取某列的所有文本值，返回一个 Map 以便快速查找: { recordId: textValue }
const getFieldMap = async (tableName, fieldName) => {
  const table = await getTable(tableName);
  const field = await table.getFieldByName(fieldName);
  // 获取整个列的值 (value是数组结构)
  const valList = await field.getFieldValueList();

  const map = new Map();
  valList.forEach((item) => {
    // 飞书文本字段通常结构: [{ type: 'text', text: '内容' }]
    const text = item.value && item.value[0] ? item.value[0].text : null;
    map.set(item.record_id, {
      recordId: item.record_id,
      text: text,
      raw: item.value, // 保留原始结构备用
    });
  });
  return map;
};

// ==========================================
// 3. 业务逻辑
// ==========================================

const loading = ref(false);

/**
 * 核心功能1：生成【资产状态总览】
 * 逻辑：读取 Pack->BM->Ads->Fans->Person 级联数据并扁平化写入
 */
const generateAssetOverview = async () => {
  loading.value = true;
  try {
    const mainTableName = CONFIG.TABLE_NAMES.MAIN;
    // 1. 清空旧数据
    await clearTableData(mainTableName);

    // 2. 获取目标表的字段实例 (用来写入)
    const mainTable = await getTable(mainTableName);
    // 这里假设目标表的列顺序固定，直接获取所有列元数据
    const mainFieldsMeta = await mainTable.getFieldMetaList();

    // 映射关系：定义每一层级对应的数据源表、字段名、以及它在总览表中对应的列索引(根据原代码推算)
    // 注意：这里的字段名(如"包ID")必须在你的源表中真实存在
    const hierarchyConfig = [
      {
        key: "pack",
        tableName: CONFIG.TABLE_NAMES.PACK,
        nameField: "包ID",
        statusField: "包状态",
        targetNameFieldId: mainFieldsMeta[0].id,
        targetStatusFieldId: mainFieldsMeta[1].id,
      },
      {
        key: "bm",
        tableName: CONFIG.TABLE_NAMES.BM,
        nameField: "BMID",
        statusField: "BM状态",
        parentKey: "pack",
        parentField: "包ID",
        targetNameFieldId: mainFieldsMeta[2].id,
        targetStatusFieldId: mainFieldsMeta[3].id,
      },
      {
        key: "ads",
        tableName: CONFIG.TABLE_NAMES.ADS,
        nameField: "广告账户ID",
        statusField: "广告账户状态",
        parentKey: "bm",
        parentField: "BMID",
        targetNameFieldId: mainFieldsMeta[4].id,
        targetStatusFieldId: mainFieldsMeta[5].id,
      },
      {
        key: "fans",
        tableName: CONFIG.TABLE_NAMES.FANS,
        nameField: "粉丝页ID",
        statusField: "粉丝页的状态",
        parentKey: "ads",
        parentField: "广告账户ID",
        targetNameFieldId: mainFieldsMeta[6].id,
        targetStatusFieldId: mainFieldsMeta[7].id,
      },
      {
        key: "person",
        tableName: CONFIG.TABLE_NAMES.PERSON,
        nameField: "个人号ID",
        statusField: "个人号的状态",
        parentKey: "fans",
        parentField: "粉丝页ID",
        targetNameFieldId: mainFieldsMeta[8].id,
        targetStatusFieldId: mainFieldsMeta[9].id,
      },
    ];

    // 3. 抓取所有源数据 (并行抓取以提速)
    // dataStore 结构: { pack: [items...], bm: [items...] }
    const dataStore = {};

    for (const config of hierarchyConfig) {
      const nameMap = await getFieldMap(config.tableName, config.nameField);
      const statusMap = await getFieldMap(config.tableName, config.statusField);

      let parentMap = null;
      if (config.parentKey) {
        // 如果有父级，获取"父级关联字段"的值
        // 注意：这里假设源表中有一个关联字段指向父级，且字段名就是父级的名字
        // 原代码逻辑比较绕，这里简化为：去当前表找名为 "父级字段名" 的列
        parentMap = await getFieldMap(config.tableName, config.parentField); // e.g. 在BM表中找 "包ID" 列
      }

      dataStore[config.key] = [];

      // 组装当前层级数据
      for (const [recordId, nameObj] of nameMap) {
        const statusObj = statusMap.get(recordId);
        const parentObj = parentMap ? parentMap.get(recordId) : null;

        dataStore[config.key].push({
          id: recordId,
          text: nameObj.text,
          statusText: statusObj ? statusObj.text : "",
          // 关联的关键：如果这个是BM，它的 parentText 应该是它所属的 Pack 的 ID 文本
          parentText: parentObj ? parentObj.text : null,
          children: [], // 预留给子节点
        });
      }
    }

    // 4. 构建树 (从下往上挂载，或者从上往下递归)
    // 这里使用 Map 引用来快速挂载
    // 逻辑：遍历 BM，找到它的 Parent (Pack)，把 BM push 到 Pack 的 children 里

    // 这是一个通用的挂载函数
    const linkChildren = (parentList, childList) => {
      // 建立父节点文本到父节点对象的索引 (假设文本ID唯一)
      const parentLookup = new Map();
      parentList.forEach((p) => parentLookup.set(p.text, p));

      childList.forEach((child) => {
        if (child.parentText && parentLookup.has(child.parentText)) {
          parentLookup.get(child.parentText).children.push(child);
        }
      });
    };

    // 依次挂载：Person -> Fans -> Ads -> BM -> Pack
    linkChildren(dataStore.fans, dataStore.person);
    linkChildren(dataStore.ads, dataStore.fans);
    linkChildren(dataStore.bm, dataStore.ads);
    linkChildren(dataStore.pack, dataStore.bm);

    // 5. 扁平化树并生成写入数据 (递归)
    // 飞书写入格式: fields: { [fieldId]: value }
    const recordsToAdd = [];

    const flattenAndPush = (nodes, parentFields = {}) => {
      nodes.forEach((node) => {
        // 找到当前节点在配置中的定义
        // 根据层级深度判断是哪个 config，这里简化处理，假设我们知道 node 属于哪一层
        // 更好的方式是在 dataStore 构建时就带上 config 信息
        // 为演示逻辑，我们需要反查 node 属于哪一层。
        // 由于上面是从 pack 开始根遍历，我们可以通过递归参数传递 config
      });
    };

    // 重新写一个简单的递归写入生成器
    const buildInsertRecords = (nodes, levelIndex, accumulatedFields) => {
      const config = hierarchyConfig[levelIndex];
      if (!config) return;

      nodes.forEach((node) => {
        // 构建当前行的字段数据
        const currentFields = {
          ...accumulatedFields, // 继承父级的字段 (比如包ID、BM ID)
          [config.targetNameFieldId]: [{ type: "text", text: node.text }],
          // [config.targetStatusFieldId]: [{ type: 'text', text: node.statusText }] // 如果需要状态也写进去
        };

        // 如果没有子节点了，或者已经是最后一层，这行数据就是一个完整的记录
        if (!node.children || node.children.length === 0) {
          recordsToAdd.push({ fields: currentFields });
        } else {
          // 如果有子节点，继续往下递归
          buildInsertRecords(node.children, levelIndex + 1, currentFields);
        }
      });
    };

    // 开始构建写入数据，从 Pack 层(index 0)开始
    buildInsertRecords(dataStore.pack, 0, {});

    console.log(`准备写入 ${recordsToAdd.length} 条数据...`);

    // 6. 批量写入 (每5000条一次)
    const chunkSize = 4000; // 安全起见用 4000
    for (let i = 0; i < recordsToAdd.length; i += chunkSize) {
      const chunk = recordsToAdd.slice(i, i + chunkSize);
      await mainTable.addRecords(chunk);
      console.log(`已写入批次 ${i} - ${i + chunk.length}`);
    }

    ElMessage.success("资产总览更新完成！");
  } catch (error) {
    console.error(error);
    ElMessage.error("更新失败，请查看控制台");
  } finally {
    loading.value = false;
  }
};

/**
 * 核心功能2：粉丝页代理商去重检查
 * 逻辑：从【资产状态总览】读取数据，去重后写入【粉丝页代理商】
 */
const checkAgency = async () => {
  loading.value = true;
  try {
    const sourceTableName = CONFIG.TABLE_NAMES.MAIN; // 资产状态总览
    const targetTableName = CONFIG.TABLE_NAMES.AGENCY; // 粉丝页代理商

    // 1. 清空目标表
    await clearTableData(targetTableName);

    // 2. 读取源表数据
    const sourceTable = await getTable(sourceTableName);
    // 这里需要指定具体的列ID来读取数据，为了演示方便，假设我们要读取的是 FansName 和 FansAds
    // 原代码中写死了 ID，建议你在 CONFIG 中配好
    const recordList = await sourceTable.getRecords({ pageSize: 5000 });

    // 3. 数据处理 (提取与去重)
    const uniqueMap = new Map();

    // 假设 fieldMetaList[1] 是粉丝页名， fieldMetaList[2] 是广告账户
    // 这里需要你根据实际情况填充正确的 FieldId
    const FANS_NAME_FIELD_ID = "请填写_资产总览_中_粉丝页名_的字段ID";

    recordList.records.forEach((record) => {
      const fields = record.fields;
      const fanNameVal = fields[FANS_NAME_FIELD_ID];

      if (fanNameVal && fanNameVal[0]) {
        const name = fanNameVal[0].text;
        if (!uniqueMap.has(name)) {
          // 构造写入数据，这里仅作示例，需根据目标表结构调整
          uniqueMap.set(name, {
            fields: {
              ["目标表_粉丝页名_列ID"]: [{ type: "text", text: name }],
              // ...其他字段
            },
          });
        }
      }
    });

    // 4. 写入
    const records = Array.from(uniqueMap.values());
    const targetTable = await getTable(targetTableName);
    await targetTable.addRecords(records); // 记得加分批逻辑如果数据量大

    ElMessage.success("代理商数据检查完成");
  } catch (e) {
    console.error(e);
    ElMessage.error("检查失败");
  } finally {
    loading.value = false;
  }
};

/**
 * 核心功能3：广告账户统计
 * 逻辑：统计每个Pack下的账号状态
 */
const calculateStats = async () => {
  loading.value = true;
  try {
    const sourceName = CONFIG.TABLE_NAMES.ADS;
    const targetName = CONFIG.TABLE_NAMES.STATS;

    await clearTableData(targetName);

    const sourceTable = await getTable(sourceName);
    // 获取源表的 "包名" 和 "状态" 列
    // 注意：这里需要你确认源表里是否有“包名”这一列，或者是通过关联字段获取
    const packNameMap = await getFieldMap(sourceName, "包ID"); // 假设列名叫 包ID
    const statusMap = await getFieldMap(sourceName, "广告账户状态");

    // 统计对象: { "PackA": { all: 10, normal: 5, limit: 5 } }
    const stats = {};

    for (const [id, packObj] of packNameMap) {
      const packName = packObj.text;
      if (!packName) continue;

      const statusObj = statusMap.get(id);
      const statusText = statusObj ? statusObj.text : "未知";

      if (!stats[packName]) {
        stats[packName] = { name: packName, all: 0, normal: 0, limit: 0 };
      }

      stats[packName].all += 1;

      if (CONFIG.STATUS_ENUM.NORMAL.includes(statusText)) {
        stats[packName].normal += 1;
      } else if (CONFIG.STATUS_ENUM.LIMIT.includes(statusText)) {
        stats[packName].limit += 1;
      }
    }

    // 构造写入数据
    const targetTable = await getTable(targetName);
    const targetFields = await targetTable.getFieldMetaList();
    // 假设目标表列顺序: [0]包名, [1]总数, [2]正常数, [3]受限数

    const insertList = Object.values(stats).map((item) => {
      return {
        fields: {
          [targetFields[0].id]: [{ type: "text", text: item.name }],
          [targetFields[1].id]: [{ type: "text", text: String(item.all) }],
          [targetFields[2].id]: [{ type: "text", text: String(item.normal) }],
          [targetFields[3].id]: [{ type: "text", text: String(item.limit) }],
        },
      };
    });

    await targetTable.addRecords(insertList);
    ElMessage.success("统计完成");
  } catch (e) {
    console.error(e);
    ElMessage.error("统计失败");
  } finally {
    loading.value = false;
  }
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

      <el-button type="primary" size="large" @click="generateAssetOverview">
        1. 更新【资产状态总览】(Pack->BM->Ads...)
      </el-button>

      <el-button type="success" size="large" @click="checkAgency">
        2. 更新【粉丝页代理商】(提取唯一粉丝页)
      </el-button>

      <el-button type="warning" size="large" @click="calculateStats">
        3. 更新【广告账户统计】(统计账号状态)
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
