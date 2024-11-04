import { bitable, FieldType } from "@lark-base-open/js-sdk";

const getSelectionName = async () => {
  const selection = await bitable.base.getSelection();
  const table = await bitable.base.getTableById(selection.tableId);
  const name = await table.getName();
  return name;
};
const getTableByName = async (name) => {
  const table = await bitable.base.getTableByName(name);
  return table;
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

export { addRecords, getSelectionName, getTableByName };
