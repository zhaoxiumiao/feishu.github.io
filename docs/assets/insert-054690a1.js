/* empty css               */import{x as A,r as y,ad as Z,o as q,_ as S,f as E,n as M,j as v,F as z,A as G,h as s,ae as J,l as F,g as O,w as h,i as f,t as H,a5 as P,E as K,a as Q,b as W,c as X,d as Y,u as $,e as tt,k as V,p as et,m as at}from"./index-da2f017f.js";import{p as U}from"./index-cf52f176.js";import{P as N}from"./Parser-c79df6cf.js";const nt=A({props:["inputTags","separator"],emits:["update:inputTags"],setup(a,e){const d=y([]),t=y(""),x=i=>{d.value.splice(i,1),e.emit("update:inputTags",d.value.join(a.separator||","))},C=()=>{t.value&&(d.value.push(t.value),t.value="",e.emit("update:inputTags",d.value.join(a.separator||",")))};return Z(()=>{a.inputTags===""&&(d.value=[])}),q(()=>{a.inputTags&&(d.value=a.inputTags.split(a.separator||","))}),{inputTagList:d,inputValue:t,handleClose:x,handleInputConfim:C}}});const lt={class:"input-multiple-box",id:"inputMultipleBox"};function st(a,e,d,t,x,C){const i=P,I=F;return E(),M("div",lt,[v("div",null,[(E(!0),M(z,null,G(a.inputTagList,(g,c)=>(E(),O(i,{key:c,type:"info",closable:"",onClose:n=>a.handleClose(c)},{default:h(()=>[f(H(g),1)]),_:2},1032,["onClose"]))),128))]),s(I,{modelValue:a.inputValue,"onUpdate:modelValue":e[0]||(e[0]=g=>a.inputValue=g),onKeyup:J(a.handleInputConfim,["enter"]),onBlur:a.handleInputConfim,style:{flex:"1","min-width":"100px"},placeholder:"按下enter键或者失去焦点添加元素"},null,8,["modelValue","onKeyup","onBlur"])])}const R=S(nt,[["render",st],["__scopeId","data-v-a6cdc7a6"]]);const B=async a=>await U.base.getTableByName(a),L=async()=>{const a=await U.base.getSelection();return await(await U.base.getTableById(a.tableId)).getName()},ot={components:{ElButton:K,ElForm:Q,ElFormItem:W,ElSelect:X,ElOption:Y,ElTag:P,InputMultiple:R},setup(){const a=y(""),e=y(""),d=()=>{function m(_){const p=[];let u=0,l={};const T=new N({onopentag(o,w){o==="a"&&(l.id=w.href.split("/")[3],l.link=`https://www.facebook.com/profile.php?id=${l.id}`,u=1)},ontext(o){u&&(l.name=o,p.push(l),l={},u=0)},onclosetag(o){}});return T.write(_),T.end(),p}const r=m(a.value);e.value=r,console.log(r,"ids")},t=y(""),x=y(""),C=()=>{function m(_){let p="",u="",l="";const T=new N({onopentag(o,w){},ontext(o){p+=o+`
`},onclosetag(o){}});return T.write(_),T.end(),p.split(`
`).forEach((o,w)=>{if(console.log(o,w,"11111"),console.log(w%2,"index % 2"),w%2===0)l=o;else{const j=o.split("：")[1];u+=`${j}|${l}
`}}),u}const r=m(t.value);x.value=r,console.log(r,"content")},i=async()=>{const m=await L();if(m==="粉丝页的数据"&&e.value){const r=await B(m),_=["fldqyffZcM","fldKyTNThM","fldGDgtbfT"],p=e.value.map(u=>({fields:{[_[0]]:[{type:"text",text:u.name}],[_[1]]:[{type:"text",text:`${u.id}`}],[_[2]]:[{type:"text",text:u.link}]}}));await r.addRecords(p)}},I=$(),g=()=>{I.push({name:"lark"})},c=y(""),n=y(""),b=y(""),k=y("");return{html:a,data:e,sub:d,insert:i,html2:t,sub2:C,data2:x,tohome:g,adsIDs:c,fansIDs:n,insert2:async()=>{const m=await L();if(m==="广告账户粉丝页"&&c.value&&n.value){const r=[];c.value.split(",").forEach((l,T)=>{n.value.split(",").forEach((o,w)=>{r.push({fansId:o,adsId:l})})});const _=await B(m),p=["fldCEop6sf","fldwymn91m"],u=r.map(l=>({fields:{[p[0]]:[{type:"text",text:l.adsId}],[p[1]]:[{type:"text",text:l.fansId}]}}));await _.addRecords(u)}},clearData:()=>{c.value="",n.value=""},personIDs:b,fansIDs2:k,insert3:async()=>{const m=await L();if(m==="粉丝页个人号"&&b.value&&k.value){const r=[];b.value.split(",").forEach((l,T)=>{k.value.split(",").forEach((o,w)=>{r.push({fansId:o,personId:l})})});const _=await B(m),p=["fldauS6Cg4","fldBLbJcZK"],u=r.map(l=>({fields:{[p[0]]:[{type:"text",text:l.fansId}],[p[1]]:[{type:"text",text:l.personId}]}}));await _.addRecords(u)}},clearData2:()=>{b.value="",k.value=""}}}},D=a=>(et("data-v-ac1ff9c9"),a=a(),at(),a),it={class:"TwoFA"},ut=D(()=>v("h4",null,"广告账户下户时绑定粉丝页数据提取",-1)),rt=D(()=>v("h6",null,"广告账户ID",-1)),pt=D(()=>v("h6",null,"粉丝页ID",-1)),dt=D(()=>v("h6",null,"粉丝页ID",-1)),ct=D(()=>v("h6",null,"个人号ID",-1));function mt(a,e,d,t,x,C){const i=K,I=F,g=R,c=tt("trim");return E(),M(z,null,[v("h4",null,[f(" 粉丝页数据表批量插入 "),s(i,{type:"primary",plain:"",onClick:t.tohome},{default:h(()=>[f("〈-返回主页")]),_:1},8,["onClick"])]),v("div",it,[V(s(I,{modelValue:t.html,"onUpdate:modelValue":e[0]||(e[0]=n=>t.html=n),rows:2,type:"textarea",placeholder:"Please input"},null,8,["modelValue"]),[[c]]),s(i,{type:"primary",plain:"",size:"large",onClick:t.sub},{default:h(()=>[f("提取信息")]),_:1},8,["onClick"]),V(s(I,{modelValue:t.data,"onUpdate:modelValue":e[1]||(e[1]=n=>t.data=n),rows:2,type:"textarea",placeholder:"Please input"},null,8,["modelValue"]),[[c]]),s(i,{onClick:t.insert,type:"primary",plain:"",size:"large"},{default:h(()=>[f("插入")]),_:1},8,["onClick"]),ut,V(s(I,{modelValue:t.html2,"onUpdate:modelValue":e[2]||(e[2]=n=>t.html2=n),rows:2,type:"textarea",placeholder:"Please input"},null,8,["modelValue"]),[[c]]),s(i,{type:"primary",plain:"",size:"large",onClick:t.sub2},{default:h(()=>[f("提取信息")]),_:1},8,["onClick"]),V(s(I,{modelValue:t.data2,"onUpdate:modelValue":e[3]||(e[3]=n=>t.data2=n),rows:2,type:"textarea",placeholder:"Please input"},null,8,["modelValue"]),[[c]]),v("h4",null,[f(" 广告账户粉丝页的批量插入 "),s(i,{type:"primary",size:"default",onClick:t.clearData},{default:h(()=>[f("清空")]),_:1},8,["onClick"])]),rt,s(g,{inputTags:t.adsIDs,"onUpdate:inputTags":e[4]||(e[4]=n=>t.adsIDs=n)},null,8,["inputTags"]),pt,s(g,{inputTags:t.fansIDs,"onUpdate:inputTags":e[5]||(e[5]=n=>t.fansIDs=n)},null,8,["inputTags"]),s(i,{onClick:t.insert2,type:"primary",plain:"",size:"large"},{default:h(()=>[f("插入")]),_:1},8,["onClick"]),v("h4",null,[f(" 粉丝页个人号的批量插入 "),s(i,{type:"primary",size:"default",onClick:t.clearData2},{default:h(()=>[f("清空")]),_:1},8,["onClick"])]),dt,s(g,{inputTags:t.fansIDs2,"onUpdate:inputTags":e[6]||(e[6]=n=>t.fansIDs2=n)},null,8,["inputTags"]),ct,s(g,{inputTags:t.personIDs,"onUpdate:inputTags":e[7]||(e[7]=n=>t.personIDs=n)},null,8,["inputTags"]),s(i,{onClick:t.insert3,type:"primary",plain:"",size:"large"},{default:h(()=>[f("插入")]),_:1},8,["onClick"])])],64)}const Tt=S(ot,[["render",mt],["__scopeId","data-v-ac1ff9c9"]]);export{Tt as default};