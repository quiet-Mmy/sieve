// 支付相关接口配置
export const API_CONFIG = {
  development: {
    // 开发环境接口地址
    baseURL: 'http://localhost:3000',
    wechat: {
      // 获取微信授权code的地址
      authUrl: 'https://open.weixin.qq.com/connect/oauth2/authorize',
      // 获取openid的接口路径
      getOpenId: '/api/wechat/openid',
      // 发起支付的接口路径
      createOrder: '/api/wechat/pay'
    },
    alipay: {
      // 获取支付宝授权的地址
      authUrl: 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm',
      // 获取buyer_id的接口路径
      getBuyerId: '/api/alipay/buyer-id',
      // 发起支付的接口路径
      createOrder: '/api/alipay/pay'
    }
  },
  production: {
    // 生产环境接口地址
    baseURL: 'https://api.yourdomain.com',
    wechat: {
      authUrl: 'https://open.weixin.qq.com/connect/oauth2/authorize',
      getOpenId: '/api/wechat/openid',
      createOrder: '/api/wechat/pay'
    },
    alipay: {
      authUrl: 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm',
      getBuyerId: '/api/alipay/buyer-id',
      createOrder: '/api/alipay/pay'
    }
  }
};

// 获取当前环境
export const getCurrentEnv = () => {
  return import.meta.env.MODE || 'development';
};

// 获取当前环境的配置
export const getConfig = () => {
  const env = getCurrentEnv();
  return API_CONFIG[env];
};