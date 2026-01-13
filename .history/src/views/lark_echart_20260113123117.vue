<script setup>
import { bitable } from "@lark-base-open/js-sdk";
import { ref, onMounted, nextTick } from "vue";
import { ElButton, ElForm, ElMessage } from "element-plus";
// 引入 ECharts
import * as echarts from "echarts";
// 在 <script setup> 顶部引入 computed 或 ref
// ...之前的引入...

// 1. 定义一个控制全屏状态的变量
const isFullScreen = ref(false);

// 2. 切换全屏状态的函数 (纯 CSS 逻辑，不调浏览器 API)
const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value;

  // 必须强制让 ECharts 重绘，否则变成全屏后图表还是原来的大小
  nextTick(() => {
    myChart && myChart.resize();
  });
};

// ...其他的 getAllAccountMap, addtest, transformToTreeData, renderChart 等函数保持不变...

// 注意：之前的 onMounted 里的 document.addEventListener('fullscreenchange'...) 可以删掉了，用不到了。

const loading = ref(false);
const chartRef = ref(null); // 图表容器的引用
let myChart = null; // 保存图表实例

// ==========================================
// 1. 工具函数 (保留之前的)
// ==========================================
const getTable = async (name) => {
  return await bitable.base.getTableByName(name);
};

const getCellText = (fields, fieldId) => {
  if (!fields || !fields[fieldId] || !fields[fieldId][0]) {
    return null;
  }
  return fields[fieldId][0].text;
};

const getCellStatusText = (fields, fieldId) => {
  if (!fields || !fields[fieldId]) {
    return null;
  }
  return fields[fieldId].text;
};

// 兼容性复制函数
const copyText = (text) => {
  if (!text) return;

  // 尝试使用现代 API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        ElMessage.success(`复制成功: ${text}`);
      })
      .catch(() => {
        // 如果现代 API 失败（比如权限问题），回退到旧方案
        fallbackCopy(text);
      });
  } else {
    fallbackCopy(text);
  }
};

// 旧版复制方案 (专门应对飞书 iframe 限制)
const fallbackCopy = (text) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  // 移出可视区域
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
    ElMessage.success(`复制成功: ${text}`);
  } catch (err) {
    ElMessage.error("复制失败，请手动输入");
  }
  document.body.removeChild(textarea);
};

// ==========================================
// 2. 数据获取逻辑 (保留之前的优化版)
// ==========================================
const getAllAccountMap = async () => {
  // ... (保留你之前的 getAllAccountMap 代码，此处省略以节省篇幅) ...
  // 请确保这里是你上一版优化过的代码
  console.log("🚀 开始预加载【个人号数据】...");
  const table = await getTable("个人号数据");
  const field_ids = {
    id: "fldDjAnJjN",
    status: "fld0btOhWm",
    remark: "fldf8CdwnX",
  };
  let hasMore = true;
  let pageToken = null;
  const accMap = new Map();
  while (hasMore) {
    const response = await table.getRecords({ pageSize: 5000, pageToken });
    for (const record of response.records) {
      const accId = getCellText(record.fields, field_ids.id);
      if (accId) {
        accMap.set(accId, {
          status: getCellStatusText(record.fields, field_ids.status) || "未知",
          remark: getCellText(record.fields, field_ids.remark) || "--",
        });
      }
    }
    hasMore = response.hasMore;
    pageToken = response.pageToken;
  }
  return accMap;
};

// ==========================================
// 3. 核心：可视化处理 (新增部分!)
// ==========================================

// 将你的原始数据转换为 ECharts 树形结构
// 修改 transformToTreeData 函数
const transformToTreeData = (rawData) => {
  return {
    name: "资产总览",
    rawId: "", // 根节点没有ID
    symbolSize: 10,
    itemStyle: { color: "#1890ff" },
    label: { fontSize: 16, fontWeight: "bold" },
    children: rawData.map((bm) => {
      // 第一层级：BM 节点
      return {
        name: `BM: ${bm.BMID}`,
        rawId: bm.BMID, // <--- 关键：存入纯净的 ID
        symbolSize: 8,
        itemStyle: { color: "#faad14" },
        // 第二层级：个人号节点
        children: bm.child.map((acc) => {
          const isNormal = acc.status === "正常";
          return {
            name: `${acc.acc_id}`,
            rawId: acc.acc_id, // <--- 关键：存入纯净的 ID
            value: acc.status,
            label: {
              formatter: `{a|${acc.acc_id}}\n{b|[${acc.status}] ${acc.remark}}`,
              rich: {
                a: { fontSize: 12, color: "#333", lineHeight: 16 },
                b: {
                  fontSize: 10,
                  color: isNormal ? "#52c41a" : "#f5222d",
                  lineHeight: 14,
                },
              },
            },
            symbolSize: 6,
            itemStyle: {
              color: isNormal ? "#52c41a" : "#f5222d",
            },
          };
        }),
      };
    }),
  };
};

// 渲染图表
// 修改 renderChart 函数
const renderChart = (treeData) => {
  if (!chartRef.value) return;

  const canvasDom =
    chartRef.value.querySelector(".chart-canvas") || chartRef.value;

  if (myChart != null) {
    myChart.dispose();
  }

  myChart = echarts.init(canvasDom);

  // ----------------------------------------
  // 新增：点击事件监听 (Click Listener)
  // ----------------------------------------
  myChart.on("click", (params) => {
    // params.data 就是我们在 transformToTreeData 里构造的那个对象
    if (params.data && params.data.rawId) {
      copyText(params.data.rawId);
    } else {
      // 如果点击的是根节点或者没有ID的节点
      console.log("该节点没有ID");
    }
  });
  // ----------------------------------------

  const option = {
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
      // 修改 Tooltip，提示用户可以点击
      formatter: (params) => {
        const id = params.data.rawId || "--";
        const status = params.data.value
          ? `<br/>状态: ${params.data.value}`
          : "";
        return `<strong>点击复制 ID</strong><br/>ID: ${id}${status}`;
      },
    },
    series: [
      {
        type: "tree",
        data: [treeData],
        top: "1%",
        left: "7%",
        bottom: "1%",
        right: "20%",
        symbol: "emptyCircle",
        expandAndCollapse: true,
        initialTreeDepth: 2,
        label: {
          position: "left",
          verticalAlign: "middle",
          align: "right",
          fontSize: 9,
        },
        leaves: {
          label: {
            position: "right",
            verticalAlign: "middle",
            align: "left",
          },
        },
        emphasis: { focus: "descendant" },
        animationDurationUpdate: 750,
      },
    ],
  };

  myChart.setOption(option);

  window.addEventListener("resize", () => {
    myChart && myChart.resize();
  });
};

// ==========================================
// 4. 业务入口 (修改 addtest)
// ==========================================
const addtest = async () => {
  loading.value = true;
  try {
    const accountMap = await getAllAccountMap();
    const table = await getTable("BM的数据");
    const bmIdField = await table.getFieldByName("BMID");
    const bmIdColId = bmIdField.id;
    const allFields = await table.getFieldMetaList();
    const linkAccFields = allFields.filter((f) =>
      f.name.includes("绑定个人号")
    );
    const linkAccColIds = linkAccFields.map((f) => f.id);

    let hasMore = true;
    let pageToken = null;
    const finalResult = [];

    while (hasMore) {
      const response = await table.getRecords({ pageSize: 5000, pageToken });
      for (const record of response.records) {
        const bmId = getCellText(record.fields, bmIdColId);
        const bmName = getCellText(record.fields, "fldWFmc5Zv");
        const bmStatus = getCellStatusText(record.fields, "fldEIDAKmB");
        console.log(bmName, bmStatus);
        const tempObj = { BMID: bmId || "未知BM", child: [] };
        for (const colId of linkAccColIds) {
          const linkedAccId = getCellText(record.fields, colId);
          if (linkedAccId) {
            const cachedData = accountMap.get(linkedAccId);
            tempObj.child.push({
              acc_id: linkedAccId,
              status: cachedData ? cachedData.status : "未找到",
              remark: cachedData ? cachedData.remark : "",
            });
          }
        }
        // 只有当有子节点的时候才加入图表，或者全部加入？看你需求
        if (tempObj.child.length > 0 || bmId) {
          finalResult.push(tempObj);
        }
      }
      hasMore = response.hasMore;
      pageToken = response.pageToken;
    }

    ElMessage.success(`数据处理完成，生成图表...`);
    console.log("最终数据结构:", finalResult);

    // [关键步骤] 转换数据并画图
    const echartsData = transformToTreeData(finalResult);

    // 确保 DOM 已经更新
    nextTick(() => {
      renderChart(echartsData);
    });
  } catch (err) {
    console.error(err);
    ElMessage.error("运行出错: " + err.message);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container" v-loading="loading">
    <el-form class="form" label-position="top">
      <h4>资产思维导图生成器</h4>

      <div style="display: flex; gap: 10px">
        <el-button type="primary" size="large" @click="addtest" style="flex: 1">
          生成思维导图
        </el-button>
        <el-button
          type="success"
          size="large"
          @click="toggleFullScreen"
          style="flex: 0 0 100px"
        >
          {{ isFullScreen ? "退出全屏" : "全屏查看" }}
        </el-button>
      </div>
    </el-form>

    <div
      ref="chartRef"
      class="chart-container"
      :class="{ 'fixed-fullscreen': isFullScreen }"
    >
      <div v-if="isFullScreen" class="close-btn" @click="toggleFullScreen">
        × 关闭全屏
      </div>

      <div class="chart-canvas"></div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
}

/* 默认状态下的容器 */
.chart-container {
  margin-top: 20px;
  width: 100%;
  height: 600px;
  border: 1px solid #eee;
  position: relative;
  background-color: #fff;
  border-radius: 8px;
  transition: all 0.3s ease; /* 加个过渡动画更顺滑 */
}

/* 伪全屏状态 (关键!) */
.chart-container.fixed-fullscreen {
  position: fixed; /* 固定定位，脱离文档流 */
  top: 0;
  left: 0;
  width: 100vw !important; /* 强制占满宽 */
  height: 100vh !important; /* 强制占满高 */
  z-index: 9999; /* 层级最高，盖住其他元素 */
  margin: 0;
  border: none;
  border-radius: 0;
  padding: 20px; /* 留点边距好看点 */
  box-sizing: border-box;
}

.chart-canvas {
  width: 100%;
  height: 100%;
}

/* 关闭按钮样式 */
.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  z-index: 10000;
  font-size: 14px;
  font-weight: bold;
}
.close-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}
</style>
