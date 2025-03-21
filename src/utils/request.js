import axios from 'axios';
import { getConfig } from '../config/api';

// 创建axios实例
const request = axios.create();

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 在这里可以添加通用的请求头等配置
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    // 统一处理错误
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 获取微信授权URL
export const getWechatAuthUrl = (redirectUri, state = '') => {
  const config = getConfig();
  const params = {
    appid: import.meta.env.VITE_WECHAT_APPID,
    redirect_uri: encodeURIComponent(redirectUri),
    response_type: 'code',
    scope: 'snsapi_base',
    state: state
  };
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return `${config.wechat.authUrl}?${queryString}#wechat_redirect`;
};

// 获取支付宝授权URL
export const getAlipayAuthUrl = (redirectUri, state = '') => {
  const config = getConfig();
  const params = {
    app_id: import.meta.env.VITE_ALIPAY_APPID,
    scope: 'auth_base',
    redirect_uri: encodeURIComponent(redirectUri),
    state: state
  };
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return `${config.alipay.authUrl}?${queryString}`;
};

// 获取微信openid
export const getWechatOpenId = async (code) => {
  const config = getConfig();
  return request({
    url: config.wechat.getOpenId,
    method: 'POST',
    data: { code }
  });
};

// 获取支付宝buyer_id
export const getAlipayBuyerId = async (authCode) => {
  const config = getConfig();
  return request({
    url: config.alipay.getBuyerId,
    method: 'POST',
    data: { auth_code: authCode }
  });
};

// 创建微信支付订单
export const createWechatOrder = async (params) => {
  const config = getConfig();
  return request({
    url: config.wechat.createOrder,
    method: 'POST',
    data: params
  });
};

// 创建支付宝支付订单
export const createAlipayOrder = async (params) => {
  const config = getConfig();
  return request({
    url: config.alipay.createOrder,
    method: 'POST',
    data: params
  });
};