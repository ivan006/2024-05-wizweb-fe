import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.js', // Replace with the path to your entry file
      name: 'QuickLists',
      fileName: (format) => `quicklists.${format}.js`,
    },
    rollupOptions: {
      // Externalize dependencies you don’t want to bundle
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
        // Provide global variables for externalized deps
        globals: {
          vue: 'Vue',
          vuetify: 'Vuetify',
          moment: 'moment',
          'moment-timezone': 'momentTimezone',
          quasar: 'Quasar',
        },
      },
    },
  },
});
