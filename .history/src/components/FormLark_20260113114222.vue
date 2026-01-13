<script setup>
import { bitable } from "@lark-base-open/js-sdk";
import { ref } from "vue";
import { ElButton, ElForm, ElMessage } from "element-plus";

const loading = ref(false); // 定义 loading 状态，防止报错

// ==========================================
// 1. 工具函数
// ==========================================

const getTable = async (name) => {
  return await bitable.base.getTableByName(name);
};

// 辅助：安全获取单元格文本
const getCellText = (fields, fieldId) => {
  if (!fields || !fields[fieldId] || !fields[fieldId][0]) {
    return null;
  }
  return fields[fieldId][0].text;
};

// ==========================================
// 2. 核心优化：预加载所有个人号数据到内存
// ==========================================
const getAllAccountMap = async () => {
  console.log("🚀 开始预加载【个人号数据】...");
  const table = await getTable("个人号数据");

  // 你的字段配置
  const field_ids = {
    id: "fldDjAnJjN", // 个人号ID (用于匹配)
    status: "fld0btOhWm", // 个人号状态
    remark: "fldf8CdwnX", // 备注
  };

  let hasMore = true;
  let pageToken = null;
  // Map 结构: { "acc_123": { status: "正常", remark: "xxx" } }
  const accMap = new Map();

  while (hasMore) {
    const response = await table.getRecords({
      pageSize: 5000, // 每次拉满
      pageToken: pageToken,
    });

    // 遍历当前页数据，存入 Map
    for (const record of response.records) {
      const accId = getCellText(record.fields, field_ids.id);

      // 只有当 ID 存在时才存入
      if (accId) {
        accMap.set(accId, {
          status: getCellText(record.fields, field_ids.status) || "",
          remark: getCellText(record.fields, field_ids.remark) || "",
        });
      }
    }

    hasMore = response.hasMore;
    pageToken = response.pageToken;
  }

  console.log(`✅ 个人号数据加载完毕，共缓存 ${accMap.size} 条数据`);
  return accMap;
};

// ==========================================
// 3. 业务逻辑：关联查询
// ==========================================
const addtest = async () => {
  loading.value = true;
  try {
    // [第一步] 先获取所有个人号数据 (只查1次，而不是N次)
    const accountMap = await getAllAccountMap();

    // [第二步] 获取 BM 表信息
    const table = await getTable("BM的数据");

    // 获取 BMID 的列 ID
    const bmIdField = await table.getFieldByName("BMID"); // 假设列名就叫 BMID
    const bmIdColId = bmIdField.id;

    // 获取所有包含 "绑定个人号" 的列 ID
    const allFields = await table.getFieldMetaList();
    const linkAccFields = allFields.filter((f) =>
      f.name.includes("绑定个人号")
    );
    const linkAccColIds = linkAccFields.map((f) => f.id);

    console.log(
      `找到 ${linkAccColIds.length} 个绑定个人号列，开始处理 BM 数据...`
    );

    // [第三步] 遍历 BM 数据
    let hasMore = true;
    let pageToken = null;
    const finalResult = [];

    while (hasMore) {
      const response = await table.getRecords({
        pageSize: 5000,
        pageToken: pageToken,
      });

      // 遍历每一行 BM 数据
      for (const record of response.records) {
        const bmId = getCellText(record.fields, bmIdColId);

        // 如果这行连 BMID 都没有，可能要跳过？这里先保留空ID的情况
        const tempObj = {
          BMID: bmId || "未知BM",
          child: [],
        };

        // 遍历所有 "绑定个人号" 的列 (可能有多个列)
        for (const colId of linkAccColIds) {
          const linkedAccId = getCellText(record.fields, colId);

          if (linkedAccId) {
            // [关键优化] 直接从内存 Map 中拿数据，不需要 await，不需要查库
            const cachedData = accountMap.get(linkedAccId);

            if (cachedData) {
              tempObj.child.push({
                acc_id: linkedAccId,
                status: cachedData.status,
                remark: cachedData.remark,
              });
            } else {
              // 如果在个人号表里找不到这个ID
              tempObj.child.push({
                acc_id: linkedAccId,
                status: "未找到",
                remark: "",
              });
            }
          }
        }

        finalResult.push(tempObj);
      }

      hasMore = response.hasMore;
      pageToken = response.pageToken;
    }

    console.log("处理完成！结果预览 (前3条):", finalResult.slice(0, 3));
    console.log("完整结果:", finalResult);

    ElMessage.success(`处理完成，共生成 ${finalResult.length} 条组合数据`);
  } catch (err) {
    console.error(err);
    ElMessage.error("运行出错: " + err.message);
  } finally {
    loading.value = false;
  }
};
</script>
