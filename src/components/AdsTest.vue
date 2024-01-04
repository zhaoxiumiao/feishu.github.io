<script>
import { bitable, FieldType } from '@lark-base-open/js-sdk';
import { ref, reactive} from 'vue';
import {
  ElButton,
  ElInput,
} from 'element-plus';

export default {
  components: {
    ElButton,
    ElInput,
    ElForm,
    ElFormItem,
  },
  setup(){
    const labelPosition = ref('right')
    const formLabelAlign = reactive({
      ads: '',
      Token: '',
    })
    const baseData = ref('')
    const creat = () => {
      console.log(baseData.value)
      baseData.value = `https://graph.facebook.com/v18.0/act_${formLabelAlign.ads}?fields=amount_spent,balance,spend_cap,account_id,name,currency&access_token=${formLabelAlign.Token}`
      window.open(baseData.value,'_blank')
    }
    
    return {
      labelPosition,
      formLabelAlign,
      baseData,
      creat
    }
  }
}
</script>

<template>
  <div>
  <el-form
    :label-position="labelPosition"
    label-width="50px"
    :model="formLabelAlign"
    style="max-width: 460px"
  >
    <el-form-item label="Ads">
      <el-input v-model="formLabelAlign.ads" />
    </el-form-item>
    <el-form-item label="Token">
      <el-input v-model="formLabelAlign.Token" />
    </el-form-item>
    <el-button type="primary" plain size="large" @click="creat">生成测试链接</el-button>
  </el-form>
  <p>{{baseData}}</p>
  </div>
</template>

<style scoped>
  p{
    margin-top: 1rem;
  }
</style>