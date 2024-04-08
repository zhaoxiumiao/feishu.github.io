import axios from "axios";
// https://graph.facebook.com/v18.0/act_${formLabelAlign.ads}?fields=amount_spent,balance,spend_cap,account_id,name,currency&access_token=${formLabelAlign.Token}
export const api = axios.create({
  baseURL: "https://graph.facebook.com/v18.0",
  timeout: 3000,
  // 跨域时候允许携带凭证
  withCredentials: true,
});

interface ResPage<T> {
  list: T[];
  pageNum: number;
  pageSize: number;
  total: number;
}

interface ResUserList {
  id: string;
  username: string;
  gender: number;
  user: { detail: { age: number } };
  idCard: string;
  email: string;
  address: string;
  createTime: string;
  status: number;
  avatar: string;
  photo: any[];
  children?: ResUserList[];
}

// 获取用户列表
export const getUserList = (params: any) => {
  return api.post<ResPage<ResUserList>>(`/geeker/user/list`, params);
};

// 获取用户列表
export const getInterestWord = (params: any) => {
  return api.get(`/search`, params);
};
