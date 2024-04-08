<script>
import Vue3ProTable from "vue3-pro-table";
import { defineComponent, reactive, ref, toRefs } from "vue";
export default defineComponent({
  components: {
    Vue3ProTable,
  },
  setup() {
    const state = reactive({
      // 表格列配置，大部分属性跟el-table-column配置一样
      columns: [
        { label: "序号", type: "index" },
        { label: "名称", prop: "nickName", width: 180 },
        { label: "邮箱", prop: "userEmail" },
        {
          label: "操作",
          fixed: "right",
          width: 180,
          align: "center",
          tdSlot: "operate", // 自定义单元格内容的插槽名称
        },
      ],
    });

    function getUserList() {
      Promise.resolve({
        list: [
          {
            nickName: "fool",
            userEmail: "fool@123",
          },
          {
            nickName: "fool2",
            userEmail: "fool@1234",
          },
        ],
        total: 1,
      });
    }
    // 请求函数
    const getList = async (params) => {
      // params是从组件接收的，包含分页和搜索字段。
      const data = await getUserList(params);

      // 必须要返回一个对象，包含data数组和total总数
      console.log(data, "data");
      return {
        data: data.list,
        total: +data.total,
      };
    };

    return {
      ...toRefs(state),
      getList,
    };
  },
});
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
