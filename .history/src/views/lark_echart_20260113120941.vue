<script setup>
import { bitable } from "@lark-base-open/js-sdk";
import { ref, onMounted, nextTick } from "vue";
import { ElButton, ElForm, ElMessage } from "element-plus";
// 引入 ECharts
import * as echarts from "echarts";
// ... 保留之前的引入和变量 ...

// 新增：切换全屏的方法
const toggleFullScreen = () => {
  const element = chartRef.value; // 获取图表容器的 DOM 节点

  if (!document.fullscreenElement) {
    // 1. 进入全屏
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      // Firefox
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      // Chrome, Safari and Opera
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      // IE/Edge
      element.msRequestFullscreen();
    }
  } else {
    // 2. 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

// 监听全屏变化事件 (关键步骤！)
// 当进入或退出全屏时，浏览器窗口大小变了，必须通知 ECharts 重绘
onMounted(() => {
  document.addEventListener("fullscreenchange", () => {
    // 稍微延迟一下，等待 DOM 尺寸变化完成
    setTimeout(() => {
      myChart && myChart.resize();
    }, 100);
  });
});

// ... 保留原来的 addtest 和其他逻辑 ...

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
const transformToTreeData = (rawData) => {
  return {
    name: "资产总览根节点",
    symbolSize: 10,
    itemStyle: { color: "#1890ff" },
    label: { fontSize: 16, fontWeight: "bold" },
    children: rawData.map((bm) => {
      // 第一层级：BM 节点
      return {
        name: `BM: ${bm.BMID}`,
        symbolSize: 8,
        itemStyle: { color: "#faad14" }, // BM 用橙色
        // 第二层级：个人号节点
        children: bm.child.map((acc) => {
          // 判断状态颜色：正常=绿色，其他=红色
          const isNormal = acc.status === "正常";
          return {
            name: `${acc.acc_id}`, // 节点主要文字
            // 节点详细信息 (利用 value 存储额外信息，或者直接拼在 name 里)
            value: acc.status,
            // 丰富的标签格式化
            label: {
              formatter: `{a|${acc.acc_id}}\n{b|[${acc.status}] ${acc.remark}}`,
              rich: {
                a: { fontSize: 12, color: "#333", lineHeight: 16 },
                b: {
                  fontSize: 10,
                  color: isNormal ? "#52c41a" : "#f5222d", // 动态变色
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
const renderChart = (treeData) => {
  if (!chartRef.value) return;

  // 注意：我们现在要挂载到 chartRef 下面的 .chart-canvas 子元素上
  // 这样全屏的时候结构更稳
  const canvasDom =
    chartRef.value.querySelector(".chart-canvas") || chartRef.value;

  if (myChart != null) {
    myChart.dispose();
  }

  myChart = echarts.init(canvasDom);

  const option = {
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
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
        initialTreeDepth: 2, // 默认展开几层
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
        emphasis: {
          focus: "descendant",
        },
        animationDurationUpdate: 750,
      },
    ],
  };

  myChart.setOption(option);

  // 监听窗口大小变化
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
          全屏查看
        </el-button>
      </div>
    </el-form>

    <div ref="chartRef" class="chart-container">
      <div class="fullscreen-tools">按 Esc 退出全屏</div>
      <div class="chart-canvas"></div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
}

/* 图表外层容器 */
.chart-container {
  margin-top: 20px;
  width: 100%;
  height: 600px; /* 默认高度 */
  border: 1px solid #eee;
  position: relative;
  background-color: #fff; /* 防止全屏变黑 */
  border-radius: 8px;
  overflow: hidden;
}

/* 真正的 ECharts 画布，撑满容器 */
.chart-canvas {
  width: 100%;
  height: 100%;
}

/* 全屏状态下的样式覆盖 (浏览器原生支持) */
.chart-container:fullscreen {
  width: 100vw;
  height: 100vh;
  margin: 0;
  border: none;
  background-color: #ffffff; /* 必须加！否则全屏可能是黑的 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 兼容 Webkit 内核 */
.chart-container:-webkit-full-screen {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
}

/* 右上角的小提示 */
.fullscreen-tools {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.1);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  z-index: 999;
  display: none; /* 默认隐藏 */
  pointer-events: none;
}

/* 只有全屏时才显示提示 */
.chart-container:fullscreen .fullscreen-tools {
  display: block;
}
</style>
