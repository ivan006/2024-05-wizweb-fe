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
      // Make sure to externalize dependencies that you don't want to bundle
      external: ['vue', 'vuetify'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
          vuetify: 'Vuetify',
        },
      },
    },
  },
});
