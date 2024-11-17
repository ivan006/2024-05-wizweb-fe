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
        commonjs(), // Add CommonJS plugin
      ],
    },
  },
});
