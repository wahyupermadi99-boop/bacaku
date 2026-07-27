import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bacaku.app',
  appName: 'Bacaku - Jurnal Membaca',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
