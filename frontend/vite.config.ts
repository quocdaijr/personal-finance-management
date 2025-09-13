import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0', // Allow external connections (required for Docker)
      port: 3000,
      strictPort: true, // Exit if port is already in use
      watch: {
        usePolling: env.CHOKIDAR_USEPOLLING === 'true', // Enable polling for Docker
      },
      hmr: {
        port: 8097, // Hot Module Replacement port for React DevTools
        host: '0.0.0.0',
      },
      proxy: {
        // Proxy API requests to backend during development
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/analytics': {
          target: env.VITE_ANALYTICS_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/analytics/, '/api/analytics'),
        },
      },
    },
    preview: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development', // Source maps only in development
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
            utils: ['axios'],
          },
        },
      },
      // Optimize chunk size warnings
      chunkSizeWarningLimit: 1000,
    },
    define: {
      // Make env variables available to the app
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __API_URL__: JSON.stringify(env.VITE_API_URL || 'http://localhost:8080'),
      __ANALYTICS_URL__: JSON.stringify(env.VITE_ANALYTICS_URL || 'http://localhost:8000'),
    },
  };
});
