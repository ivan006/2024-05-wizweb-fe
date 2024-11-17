import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'QuickLists',
      fileName: (format) => `quicklists.${format}.js`,
    },
    rollupOptions: {
      external: [
        'vue',
        'vuetify',
        'moment',
        'moment-timezone',
        '@quasar/quasar-ui-qcalendar',
        'quasar',
        'vue3-google-map',
      ],
      output: {
        globals: {
          vue: 'Vue',
          vuetify: 'Vuetify',
          moment: 'moment',
          'moment-timezone': 'momentTimezone',
          quasar: 'Quasar',
        },
      },
      plugins: [
        commonjs(), // Keep CommonJS plugin
      ],
    },
  },
  optimizeDeps: {
    include: ['moment', 'moment-timezone'], // Pre-bundle these dependencies
  },
  resolve: {
    alias: {
      moment: 'moment/moment.js', // Alias for moment
      'moment-timezone': 'moment-timezone/builds/moment-timezone-with-data.js', // Alias for moment-timezone
    },
  },
});
