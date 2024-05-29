<template>
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
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watchEffect } from "vue";
export default defineComponent({
  props: ["inputTags", "separator"],
  emits: ["update:inputTags"],
  setup(props, _) {
    const inputTagList = ref<any>([]);
    const inputValue = ref("");
    const handleClose = (index: number) => {
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
    watchEffect(() => {
      if (props.inputTags === "") {
        inputTagList.value = [];
      }
    });
    onMounted(() => {
      if (props.inputTags) {
        inputTagList.value = props.inputTags.split(props.separator || ",");
      }
    });
    return { inputTagList, inputValue, handleClose, handleInputConfim };
  },
});
</script>

<style scoped>
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
