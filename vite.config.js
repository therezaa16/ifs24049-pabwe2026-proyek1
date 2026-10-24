import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [vue()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
    },
    server: {
      port: 5173,
      proxy: {
        '/api': { target: env.VITE_PROXY_TARGET || 'http://localhost:5000', changeOrigin: true }
      }
    },
    build: {
      target: 'esnext',
      sourcemap: false,
      chunkSizeWarningLimit: 700
    },
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['tests/**/*.test.js'],
      coverage: {
        provider: 'v8',
        // lcov dipakai SonarQube (coverage/lcov.info)
        reporter: ['text', 'json', 'html', 'lcov'],
        include: ['src/**/*.{js,vue}'],
        // main.js hanya titik masuk (mount aplikasi), sama seperti pengecualian di sonar-project.properties
        exclude: ['src/main.js', 'tests/**', 'node_modules/**'],
        thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 }
      }
    }
  };
});
