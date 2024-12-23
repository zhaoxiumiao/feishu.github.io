import { bitable, FieldType } from "@lark-base-open/js-sdk";

const getSelectionName = async () => {
  const selection = await bitable.base.getSelection();
  const table = await bitable.base.getTableById(selection.tableId);
  const name = await table.getName();
  return name;
};

return {
  getSelectionName,
};
