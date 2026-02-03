import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cn.suton.ccycle',
  appName: '碳循',
  webDir: 'out',
  server: {
    // 使用已部署的 Vercel 网站
    url: 'https://suton.cn',
    cleartext: false
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'App'
  }
};

export default config;
