/**
 * 去除两边空格
 * 使用 <el-input v-model="xxx" v-trim></el-input>
 */
function getInput(el: any) {
  let inputEle;
  if (el.tagName !== "INPUT") {
    inputEle = el.querySelector("input");
    if (!inputEle) {
      inputEle = el.querySelector("textarea");
    }
  } else {
    inputEle = el;
  }
  return inputEle;
}
function dispatchEvent(el: any, type: any) {
  let evt = new Event(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
  });
  el.dispatchEvent(evt); //手动触发input时间
}
const Trim = {
  mounted(el) {
    let inputEle = getInput(el);
    const handler = function (event) {
      const newVal = event.target.value.trim();
      if (event.target.value != newVal) {
        event.target.value = newVal;
        dispatchEvent(inputEle, "input");
      }
    };
    el.inputEle = inputEle;
    el._blurHandler = handler;
    inputEle.addEventListener("blur", handler);
  },
  unmounted(el) {
    const { inputEle } = el;
    inputEle.removeEventListener("blur", el._blurHandler);
  },
};
export default Trim;
