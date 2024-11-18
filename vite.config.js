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
      external: ['vue', 'vuetify', 'dayjs'], // Externalize dayjs
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
          vuetify: 'Vuetify',
          dayjs: 'dayjs', // Add dayjs as a global variable
        },
      },
    },
  },
  resolve: {
    alias: {
      dayjs: 'dayjs', // Ensure it resolves to the main package
    },
  },
  optimizeDeps: {
    include: ['dayjs'], // Pre-bundle dayjs to avoid import issues
  },
});
