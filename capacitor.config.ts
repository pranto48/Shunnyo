import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shunnyo.chat',
  appName: 'শূন্য (Shunnyo)',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // For development: use live URL; for production: remove this and use bundled webDir
    // url: 'https://shunnyo.itsupport.com.bd',
    cleartext: false
  },
  android: {
    backgroundColor: '#0a0a0f',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a0a0f',
      androidSplashResourceName: 'splash',
      showSpinner: false
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
