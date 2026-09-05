import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.birthdaybuddy.app',
  appName: 'Birthday Buddy',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'LIGHT',
      backgroundColor: '#FAF8F5'
    }
  }
};

export default config;
