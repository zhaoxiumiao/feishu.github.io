<script>
import { bitable, FieldType } from "@lark-base-open/js-sdk";
import { ref, onMounted, defineComponent } from "vue";
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElTag,
} from "element-plus";
import { Parser } from "htmlparser2";
import { useRouter } from "vue-router";

const getTableByName = async (name) => {
  const table = await bitable.base.getTableByName(name);
  return table;
};

const getFieldValueList = async (name, fieldName) => {
  const table = await getTableByName(name);
  const field = await table.getFieldByName(fieldName);
  const list = await field.getFieldValueList();
  return list;
};

const getFieldByName = async (name, fieldName) => {
  const table = await getTableByName(name);
  const field = await table.getFieldByName(fieldName); // 获取名为 多行文本 的字段实例
  return field;
};

const getFieldMetaList = async (name) => {
  const table = await getTableByName(name);
  const res = await table.getFieldMetaList();
  return res;
};

const clearAll = async (mainTable, name) => {
  // const fieldMetaList = await getFieldMetaList(name)
  // console.log(fieldMetaList, 'name')
  // for(let [index, ele] of fieldMetaList.entries()){
  //   if(ele.isPrimary){
  //     continue
  //   }
  //   const res = await mainTable.deleteField(ele.id)
  // }
  // // await fieldMetaList.forEach(async (ele,index) => {
  // //   if(ele.isPrimary){
  // //     return null
  // //   }
  // //   const res = await mainTable.deleteField(ele.id)
  // // })
  const recordIds = await mainTable.getRecordIdList(); // 获取所有记录id
  if (recordIds && recordIds.length) {
    const res = await mainTable.deleteRecords(recordIds.slice(0, 5000)); // 删除前500条记录
  }
};

const getSelectionName = async () => {
  const selection = await bitable.base.getSelection();
  const table = await bitable.base.getTableById(selection.tableId);
  const name = await table.getName();
  return name;
};

const setField = async (mainTable, id, name2) => {
  const res = await mainTable.setField(id, {
    name: name2,
  });
  return res;
};

const addRecords = async (name, item) => {
  const { id, nameId, status, statusId } = item;
  const table = await getTableByName(name);
  const res = await table.addRecords([
    {
      // 添加1行
      fields: {
        [nameId]: [id],
        [statusId]: [
          {
            type: "text",
            text: status.text,
          },
        ],
      },
    },
  ]);

  return res;
};

const getRecordIdList = async (name) => {
  const table = await getTableByName(name);

  const res = await table.getRecordIdList();
};

const addField = async (mainName, name) => {
  // console.log(name, type || 3, 'na')
  // const res = await table.addField({ // 新增一列多行文本类型的字段
  //   type: 'text',
  //   name,
  // })
  // return res
  // console.log(res) // 'fldILo3L59' ; 新增的字段的字段id
  const table = await getTableByName(mainName, name); // 获取当前数据表实例

  const res = await table.addField({
    // 新增一列多行文本类型的字段
    type: FieldType.Text,
    name,
  });
  return res;
};

const getRecords = async (name, pageSize) => {
  const table = await getTableByName(name);
  const res = await table.getRecords({ pageSize: 5000 });
  return res;
};

const addRecordList = async (tableFieldNames) => {};

export default {
  components: {
    ElButton,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
    ElTag,
  },
  props: ["inputTags", "separator"],
  emits: ["update:inputTags"],
  setup(props, _) {
    const html = ref("");
    const data = ref("");
    const sub = () => {
      let content = "";
      function extractClassList(html) {
        const classList = [];
        let tmp = {
          // name: '',
          // id: ''
        };
        const parser = new Parser({
          onopentag(name, attributes) {
            if (name === "a" && attributes) {
              tmp.id = attributes.href.split("/")[3];
            }
          },
          ontext(text) {
            if (!text.includes("编号：")) {
              tmp.name = text;
              classList.push(tmp);
              tmp = {};
            }
          },
          onclosetag(tagname) {},
        });
        parser.write(html);
        parser.end();
        return classList;
      }
      const ids = extractClassList(html.value);
      data.value = ids;
      console.log(ids, "ids");
    };
    const insert = async () => {
      const name = await getSelectionName();
      if (name === "粉丝页的数据" && data.value) {
        const mainTable = await getTableByName(name);
        const fieldMetaList = [
          "fldKyTNThM", // 名称
          "fldqyffZcM", // ID
          "fldGDgtbfT", // 主页链接
        ];
        const insertList = data.value.map((item) => {
          return {
            fields: {
              [fieldMetaList[0]]: [{ type: "text", text: item.name }],
              [fieldMetaList[1]]: [{ type: "text", text: `${item.id}` }],
              [fieldMetaList[2]]: [
                {
                  type: "text",
                  text: `https://www.facebook.com/profile.php?id=${item.id}`,
                },
              ],
            },
          };
        });
        await mainTable.addRecords(insertList);
      }
    };
    // 返回
    const router = useRouter();
    const tohome = () => {
      router.push({ name: "lark" });
    };
    // 返回

    // 插入
    const inputTagList = ref([]);
    const inputValue = ref("");
    const handleClose = (index) => {
      inputTagList.value.splice(index, 1);
      _.emit(
        "update:inputTags",
        inputTagList.value.join(props.separator || ",")
      );
    };
    const handleInputConfim = () => {
      if (inputValue.value) {
        inputTagList.value.push(inputValue.value);
        inputValue.value = "";
        _.emit(
          "update:inputTags",
          inputTagList.value.join(props.separator || ",")
        );
      }
    };
    onMounted(() => {
      if (props.inputTags) {
        inputTagList.value = props.inputTags.split(props.separator || ",");
      }
    });
    return {};

    return {
      html,
      data,
      sub,
      insert,
      // 返回按钮
      tohome,
      // 插入
      inputTagList,
      inputValue,
      handleClose,
      handleInputConfim,
    };
  },
};
</script>

<template>
  <el-form ref="form" class="form" :model="formData" label-position="top">
    <h4>
      粉丝页数据表批量插入
      <el-button type="primary" plain @click="tohome">〈-返回主页</el-button>
    </h4>
    <div class="TwoFA">
      <el-input
        v-trim
        v-model="html"
        :rows="2"
        type="textarea"
        placeholder="Please input"
      />
      <el-button type="primary" plain size="large" @click="sub"
        >提取信息</el-button
      >
      <el-input
        v-trim
        v-model="data"
        :rows="2"
        type="textarea"
        placeholder="Please input"
      />
      <el-button @click="insert" type="primary" plain size="large"
        >插入</el-button
      >
    </div>
    <h4>广告账户粉丝页的批量插入</h4>
    <div class="input-multiple-box" id="inputMultipleBox">
      <div>
        <el-tag
          v-for="(tag, index) in inputTagList"
          :key="index"
          type="info"
          closable
          @close="handleClose(index)"
        >
          {{ tag }}
        </el-tag>
      </div>
      <el-input
        v-model="inputValue"
        @keyup.enter="handleInputConfim"
        @blur="handleInputConfim"
        style="flex: 1; min-width: 100px"
        placeholder="按下enter键或者失去焦点添加元素"
      ></el-input>
    </div>
    ———————————————— 版权声明：本文为博主原创文章，遵循 CC 4.0 BY-SA
    版权协议，转载请附上原文出处链接和本声明。
    原文链接：https://blog.csdn.net/m0_37755267/article/details/125768287
  </el-form>
</template>

<style scoped>
.form :deep(.el-form-item__label) {
  font-size: 16px;
  color: var(--el-text-color-primary);
  margin-bottom: 0;
}
.form :deep(.el-form-item__content) {
  font-size: 16px;
}
.form :deep(.el-button) {
  margin-bottom: 1rem;
  display: block;
  margin-left: 0;
}
.form {
  overflow: hidden;
}
p {
  margin-top: 1rem;
}
.TwoFA :deep(.el-button) {
  margin-top: 1rem;
  margin-bottom: 1rem;
  display: block;
  margin-left: 0;
}

h4 {
  font-size: calc(1.275rem + 0.3vw);
  margin-bottom: 1rem;
}

h4:nth-of-type(1) {
  display: flex;
  margin-bottom: 0rem;
}

.input-multiple-box {
  width: 100%;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  padding: 0 5px;
  display: flex;
  flex-wrap: wrap;
}

#inputMultipleBox .el-input__inner {
  border: none;
}
</style>
