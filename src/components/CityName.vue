<script>
import { bitable, FieldType } from "@lark-base-open/js-sdk";
import { ref, reactive } from "vue";
import debounce from "lodash/debounce";
import {
  ElButton,
  ElInput,
  ElSelect,
  ElOption,
  ElForm,
  ElFormItem,
} from "element-plus";
import city_cn from "../utils/city";
export default {
  components: {
    ElButton,
    ElInput,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
  },
  setup() {
    const value = ref("");
    const keyVal = ref({});
    const filter = (val) => {
      keyVal.value = {};
      const regex = new RegExp(".*" + val + ".*", "g");
      for (const key in city_cn) {
        if (regex.test(key)) {
          keyVal.value[key] = city_cn[key];
        }
      }
    };
    return {
      value,
      city_cn,
      filter,
      debounce,
      keyVal,
    };
  },
};
</script>

<template>
  <div>
    <el-form
      label-position="right"
      label-width="160px"
      style="max-width: 460px"
    >
      <el-form-item label="请输入城市中文名称：">
        <el-select
          v-model="value"
          filterable
          placeholder="Select"
          style="width: 240px"
          :filter-method="debounce(filter, 1000)"
        >
          <el-option
            v-for="(val, key) in keyVal"
            :key="key"
            :label="key"
            :value="val"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <p>{{ value }}</p>
  </div>
</template>

<style scoped>
p {
  margin-top: 1rem;
}
</style>
