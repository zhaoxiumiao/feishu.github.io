<script>
  import { bitable, FieldType } from '@lark-base-open/js-sdk';
  import { ref, onMounted} from 'vue';
  import {
    ElButton,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
  } from 'element-plus';

  const getTableByName = async (name) => {
    const table = await bitable.base.getTableByName(name);
    return table
  }

  const getFieldValueList = async (name, fieldName) => {
    const table = await getTableByName(name)
    const field = await table.getFieldByName(fieldName)
    const list = await field.getFieldValueList()
    return list
  }

  const getFieldByName = async (name, fieldName) => {
    const table = await getTableByName(name)
    const field = await table.getFieldByName(fieldName); // 获取名为 多行文本 的字段实例
    return field
  }

  const getFieldMetaList = async (name) => {
    const table = await getTableByName(name)
    const res = await table.getFieldMetaList()
    return res
  }

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
    if(recordIds && recordIds.length){
      const res = await mainTable.deleteRecords(recordIds.slice(0,5000)); // 删除前500条记录
    }
  }

  const getSelectionName = async () => {
    const selection = await bitable.base.getSelection()
    const table = await bitable.base.getTableById(selection.tableId)
    const name = await table.getName()
    return name
  }

  const setField = async (mainTable, id, name2) => {
    const res = await mainTable.setField(id,{
        name: name2,
    })
    return res
  }

  const addRecords = async (name, item) => {
    const {id, nameId, status, statusId} = item
    const table = await getTableByName(name)
    const res = await table.addRecords([
        {// 添加1行
          fields: {
            [nameId]: [ 
              id
            ],
            [statusId]: [
              {
                type: 'text',
                text: status.text
              }
            ],
          }
        }
    ])
    
    return res
  }

  const getRecordIdList = async (name) => {
    const table = await getTableByName(name);
    
    const res = await table.getRecordIdList();
  }

  const addField = async (mainName, name) => {
    // console.log(name, type || 3, 'na')
    // const res = await table.addField({ // 新增一列多行文本类型的字段
    //   type: 'text',
    //   name,
    // })
    // return res
    // console.log(res) // 'fldILo3L59' ; 新增的字段的字段id
    const table = await getTableByName(mainName, name); // 获取当前数据表实例
    
    const res = await table.addField({ // 新增一列多行文本类型的字段
      type: FieldType.Text,
      name,
    })
    return res
  }

  const getRecords = async (name, pageSize) => {
    const table = await getTableByName(name);
    const res = await table.getRecords({ pageSize: 5000 });
    return res
  }

  const addRecordList = async (tableFieldNames) => {
    
  }

  export default {
    components: {
      ElButton,
      ElForm,
      ElFormItem,
      ElSelect,
      ElOption,
    },
    setup() {
      const formData = ref('');
      const tableMetaList = ref([]);
      const fieldMetaList = ref([])
      const table = ref({})
      const mainName = '资产状态总览'
      const tableFieldNames =  {
        pack:{
          name: '包ID',
          status: '包状态',
          nameId: 'xxx',
          statusId: 'xxx',
          tableName: 'app',
          childName: 'bm'
        },
        bm:{
          name: 'BMID',
          status: 'BM状态',
          tableName: 'BM',
          parent: 'pack',
          childName: 'ads'
        },
        ads:{
          name: '广告账户ID',
          status: '广告账户状态',
          tableName: '广告账户',
          parent: 'bm',
          childName: 'fans',
          packId: '包ID'
        },
        fans:{
          name: '粉丝页名称',
          status: '粉丝页的状态',
          tableName: '广告账户粉丝页',
          parent: 'ads',
          adsTableName: '广告账户粉丝页',
          adsId: '',
          childName: 'person',
        },
        person:{
          name: '个人号ID',
          status: '个人号的状态',
          tableName: '粉丝页个人号',
          parent: 'fans',
          childName: ''
        },
      }
      let searchData = {
        pack:[
          {
            
          }
        ]
      }

      const addRecord = async () => {
        const name = await getSelectionName()
        if (name === mainName) {
          /* 初始化 */
          const fieldMetaList = ['fldamqjgCi', 'fldxs3m5oK', 'flds2sw1zl', 'fldpZOIUJs', 'fldYDmwkFW', 'fldOtNEMD7', 'fldODZOISb', 'fldZKS0Qrl', 'fldlPGwOHc', 'fldU13dDiD']
          // 清空表
          const mainTable = await getTableByName(mainName) // 获得要总览表的实例
          await clearAll(mainTable, mainName) // 清空表格
          // let fieldMetaList = await getFieldMetaList(mainName) // 获取表格的所有列信息
          tableFieldNames.pack.nameId = fieldMetaList[0] // 记录包ID的列ID
          // await setField(mainTable, tableFieldNames.pack.nameId, tableFieldNames.pack.name) // 改列的名字
          // console.log(fieldMetaList.map(item => item.id), 'fieldMetaList')
          
          // 创建所有的列
          let num = 0
          for(let obj in tableFieldNames){
            num++
            if(obj == 'pack'){
              // tableFieldNames[obj].statusId = await addField(mainName, tableFieldNames[obj].status)
              tableFieldNames[obj].statusId = fieldMetaList[num]
              continue
            }
            tableFieldNames[obj].nameId = fieldMetaList[num]
            num++
            tableFieldNames[obj].statusId = fieldMetaList[num]
            // tableFieldNames[obj].nameId = await addField(mainName, tableFieldNames[obj].name)
            // tableFieldNames[obj].statusId = await addField(mainName, tableFieldNames[obj].status)
          }
          let fansAdsIdList = []
          // 查找到所有的数据
          for (let obj in tableFieldNames){
            // 获取ID列和状态列信息
            const nameList = await getFieldValueList(tableFieldNames[obj].tableName, tableFieldNames[obj].name)
            const statusList = await getFieldValueList(tableFieldNames[obj].tableName, tableFieldNames[obj].status)
            // 获取父的ID信息
            let parentIdList = null
            let adsPackIdList = null
            
            const parent = tableFieldNames[obj].parent
            if(parent){
               parentIdList =  await getFieldValueList(tableFieldNames[obj].tableName, tableFieldNames[parent].name)
            }
            if(obj == 'ads'){
              adsPackIdList = await getFieldValueList(tableFieldNames[obj].tableName, tableFieldNames[obj].packId)
            }
            if(obj == 'fans'){
              // const adsIdList = await getFieldValueList(tableFieldNames[obj].adsTableName, tableFieldNames.ads.name)
              // const fansList = await getFieldValueList(tableFieldNames[obj].adsTableName, tableFieldNames.fans.name)
              // console.log(statusList, 'statusList')
              // for(let i = 0; i < adsIdList.length; i++){
              //   for(let x = 0; x < fansList.length; x++){
              //     if(adsIdList[i].record_id == fansList[x].record_id){
              //       fansAdsIdList.push({
              //         ads: adsIdList[i].value[0].text,
              //         fans: fansList[x].value[0].text
              //       })
              //     }
              //   }
              // }
            }
            
            searchData[obj] = []
            for(let i = 0; i < nameList.length; i++){
              for(let x = 0; x < statusList.length; x++){
                if(nameList[i].record_id == statusList[x].record_id){
                  // 将所需的信息整合到一个对象中
                  let tmp = {
                    record_id: nameList[i].record_id,
                    id: nameList[i].value[0], // ID信息
                    status: statusList[x].value instanceof Array ? statusList[x].value[0] : statusList[x].value, // 状态信息
                    nameId: tableFieldNames[obj].nameId, // ID列ID
                    statusId: tableFieldNames[obj].statusId, // 状态列ID
                    childName: tableFieldNames[obj].childName
                  }
                  if(adsPackIdList){
                    for(let c = 0; c < adsPackIdList.length; c++){
                      if(adsPackIdList[c].record_id == nameList[i].record_id){
                        tmp.packId = adsPackIdList[c].value[0]
                      }
                    }
                  }
                  // if(fansAdsIdList.length){
                  //   tmp.adsId = true
                  // }
                  if(parentIdList){ // 查找到父ID的信息
                    for(let y = 0; y < parentIdList.length; y++){
                      if(parentIdList[y].record_id == nameList[i].record_id){
                        tmp.parentId = parentIdList[y].value[0]
                      }
                    }
                  }
                  searchData[obj].push(tmp)
                }
              } 
            }
            
          }
          const treeData = JSON.parse(JSON.stringify(searchData.pack))
          const insertList = []
          function tree(data) { //开始组装成树形结构
            data.forEach(item => {
              if(!item.childName){
                return
              }
              item.child = []
              for(let item2 of searchData[item.childName]){
                if(item.id.text == item2.parentId.text){
                  if(item2.packId && item.parentId.text !== item2.packId.text){
                    continue
                  }   
                  if(item2.adsId){
                    fansAdsIdList.forEach(data => {
                      if(data.fans == item2.id.text && data.ads == item.parentId.text){
                        item.child.push(item2)
                      }
                    })
                  }else {
                    item.child.push(item2)
                  }
                }
              }
              tree(item.child)
            })
          }
          tree(treeData)
          const flatTree = async (data, parent) => { // 一列一列插入
            for (const item of data) {
              const tmp = {
                [item.nameId]:[
                  {
                    type: 'text',
                    text: item.id.text
                  }
                ],
                // [item.statusId]:[
                //   {
                //     type: 'text',
                //     text: item.status.text
                //   }
                // ]
              }
              let current = {
                fields:{
                  ...tmp
                }
              }

              if(!parent){
                if(!item.child || !(item.child && item.child.length)){
                  insertList.push(current)
                  continue
                }
              }else {
                Object.assign(current.fields, parent.fields)
                if(!item.child || !(item.child && item.child.length)){
                  insertList.push(current)
                }
              }
              
              if(item.child && item.child.length){
                flatTree(item.child, current)
              }
            }
          }
          flatTree(treeData)
          await mainTable.addRecords(insertList)
          const showTreeData = async (data) => { // 一列一列插入
            for (const item of data) {
              await addRecords(mainName, item)
              if(item.child && item.child.length){
                await showTreeData(item.child)
              }
            }
          }
          // if(formData.value){
          //   const packData = treeData.find(item => {
          //     if(item.id.text === formData.value){
          //       return true
          //     }
          //   })
          //   console.log(packData, 'packData')
          //   await showTreeData([packData])
          // }else {
          //   await showTreeData(treeData)
          // }
          
          
          // searchData.pack.forEach(item => {
          //   item.child = []
          //   searchData.bm.forEach(item2 => {
          //     if(item.id.text == item2.parentId.text){
          //       item.child.push(item2)
          //     }
          //   })
          //   treeData.push(item)
          // })

          // addRecordList(tableFieldNames)
          // const packTableIdList = await getFieldValueList(appName, tableFieldNames.pack.name)
          // const tablePackField = await getFieldByName(mainName, tableFieldNames.pack.name)
          // await addRecords(mainName, tablePackField, packTableIdList[0].text)
          // await getRecordIdList(appName)
          
          
        }
        
      };

      const check = async () => {
        const name = await getSelectionName()
        if (name === '粉丝页代理商') {
          
          const fieldMetaList = ['fldogQk5yi', 'fld2NwOTxm', 'fldS9ktQOH', 'fldWfgfA2z']
          const infoData = {
            id: 'fldamqjgCi',
            fansName: 'fldODZOISb',
            fansAds: 'fld1JtRKJR',
            fansStatus: 'fldZKS0Qrl'
          }
          // 清空表
          const mainTable = await getTableByName(name) // 获得要总览表的实例
          await clearAll(mainTable, name) // 清空表格
          const res = await getRecords(mainName)
          const change  = (item) =>{
            if(item){
              return {
                id: item[0].id,
                text: item[0].text,
                type: 'singleSelect'
              }
            }
            return null
          }
          let baseData = res.records.map(item => {
            const fieldsData = item.fields
            return {
              fields:{
                [fieldMetaList[0]]:fieldsData[infoData.id],
                [fieldMetaList[1]]:fieldsData[infoData.fansName],
                [fieldMetaList[2]]:change(fieldsData[infoData.fansAds]),
                [fieldMetaList[3]]:change(fieldsData[infoData.fansStatus])
              }
            }
          })
          baseData = baseData.filter((item) => item.fields[fieldMetaList[1]]);
          let obj = {};
          baseData = baseData.reduce((cur,next) => {
            obj[next.fields[fieldMetaList[1]][0].text] ? "" : obj[next.fields[fieldMetaList[1]][0].text] = true && cur.push(next);
            return cur;
          },[]);
          
          await mainTable.addRecords(baseData)
          // const mainTable = await getTableByName(name)
          // const field = await getFieldByName(name, '包状态')
          // const appField = await getFieldByName('粉丝页', '粉丝页状态')
          // const meta = await appField.getMeta()
          // const res2 = await mainTable.setField('fldh4O2jwX',meta)
          // const insertList = [
          //   {
          //     fields: {
          //       'fldh4O2jwX':[
          //         {
          //           type: 'singleSelect',
          //           text: '正常'
          //         }
          //       ]
          //     }
          //   }
          // ]
          // await mainTable.addRecords(insertList)
        }
      }

      const total = async () => {
        const name = await getSelectionName()
        if (name === '广告账户统计') {
          const normal = ['正常使用中','正常待使用', '申诉成功']
          const limitation = ['受限', '弃用', '申诉失败', '正在申诉']
          const fieldMetaList = ['fldrI191pn', 'fldZGEKDU2', 'fldNGkPjyc', 'fldmzjaJgX']
          const infoData = {
            packName: 'fld6PJoJmr',
            adsStatus: 'fldIy5Lrqv'
          }
          // 清空表
          const mainTable = await getTableByName(name) 
          await clearAll(mainTable, name) // 清空表格
          const res = await getRecords('广告账户')
          // const change  = (item) =>{
          //   if(item){
          //     return {
          //       id: item[0].id,
          //       text: item[0].text,
          //       type: 'singleSelect'
          //     }
          //   }
          //   return null
          // }
          const counter = [] // {name: '包名', all: 0, normal: 0, limitation: 0}
          let baseData = res.records.map(item => {
            const fieldsData = item.fields
            return {
              name: fieldsData[infoData.packName][0].text,
              status: fieldsData[infoData.adsStatus].text
            }
          })
          const isSave = (name) => {
            let res = -1
              counter.forEach((item, index) => {
              if(item.name === name){
                res = index
              }
            })
            return res
          }
          baseData.forEach(item => {
            const name = item.name
            const status = item.status
            const isNormal = normal.includes(status)
            const index = isSave(name)
            item.all = item.all + 1
            if(index === -1){
              const tmp = {
                name: name,
                all: 1,
                normal: 0,
                limitation: 0
              }
              if (isNormal) {
                tmp.normal = 1
              }else {
                tmp.limitation = 1
              }
              counter.push(tmp)
            }else {
              counter[index].all = counter[index].all + 1
              if (isNormal) {
                counter[index].normal = counter[index].normal + 1
              }else {
                counter[index].limitation = counter[index].limitation + 1
              }
            }
            
          })
          const insertList = counter.map(item => {
            return {
              fields:{
                [fieldMetaList[0]]:[{type: 'text', text: item.name}],
                [fieldMetaList[1]]:[{type: 'text', text: `${item.all}`}],
                [fieldMetaList[2]]:[{type: 'text', text: `${item.normal}`}],
                [fieldMetaList[3]]:[{type: 'text', text: `${item.limitation}`}]
              }
            } 
          })
          await mainTable.addRecords(insertList)
          // let baseData = res.records.map(item => {
          //   const fieldsData = item.fields
          //   return {
          //     fields:{
          //       [fieldMetaList[0]]:fieldsData[infoData.id],
          //       [fieldMetaList[1]]:fieldsData[infoData.fansName],
          //       [fieldMetaList[2]]:change(fieldsData[infoData.fansAds]),
          //       [fieldMetaList[3]]:change(fieldsData[infoData.fansStatus])
          //     }
          //   }
          // })
          // baseData = baseData.filter((item) => item.fields[fieldMetaList[1]]);
          // let obj = {};
          // baseData = baseData.reduce((cur,next) => {
          //   obj[next.fields[fieldMetaList[1]][0].text] ? "" : obj[next.fields[fieldMetaList[1]][0].text] = true && cur.push(next);
          //   return cur;
          // },[]);

          // await mainTable.addRecords(baseData)
          // const mainTable = await getTableByName(name)
          // const field = await getFieldByName(name, '包状态')
          // const appField = await getFieldByName('粉丝页', '粉丝页状态')
          // const meta = await appField.getMeta()
          // const res2 = await mainTable.setField('fldh4O2jwX',meta)
          // const insertList = [
          //   {
          //     fields: {
          //       'fldh4O2jwX':[
          //         {
          //           type: 'singleSelect',
          //           text: '正常'
          //         }
          //       ]
          //     }
          //   }
          // ]
          // await mainTable.addRecords(insertList)
        }
      }
      
    
        
        
          
          
          
          
          

      onMounted(async () => {
        const packList =  await getFieldValueList(tableFieldNames.pack.tableName, tableFieldNames.pack.name)
        tableMetaList.value = packList.map(item => {
          return item.value[0].text
        })
      });

      return {
        formData,
        tableMetaList,
        addRecord,
        check,
        total
      };
    }
  };
</script>

<template>
  <el-form ref="form" class="form" :model="formData" label-position="top">
    <!--
    <el-form-item label="选择数据表" size="large">
        <el-select v-model="formData" placeholder="请选择数据表" style="width: 100%">
          <el-option
            v-for="id in tableMetaList"
            :key="id"
            :label="id"
            :value="id"
          />
        </el-select>
    </el-form-item>
    -->
    <el-button type="primary" plain size="large" @click="addRecord">修改{{formData.value}}数据源</el-button>
    <el-button type="primary" plain size="large" @click="check">粉丝页代理商</el-button>
    <el-button type="primary" plain size="large" @click="total">广告账户统计</el-button>
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
</style>
