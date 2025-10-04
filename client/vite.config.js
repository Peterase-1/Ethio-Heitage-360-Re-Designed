import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const isDev = mode === 'development';
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: '0.0.0.0',
      strictPort: true,
      hmr: {
        host: 'localhost',
        port: 5173,
        protocol: 'ws',
        overlay: false
      },
      open: false,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          ws: true
        },
        '/socket.io': {
          target: 'http://localhost:5000',
          ws: true
        }
      },
      watch: {
        usePolling: true,
        interval: 100
      }
    },
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'esbuild',
      cssMinify: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vendor chunks
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react-vendor';
              }
              if (id.includes('@mui') || id.includes('@emotion')) {
                return 'mui-vendor';
              }
              if (id.includes('i18next') || id.includes('react-i18next')) {
                return 'i18n-vendor';
              }
              if (id.includes('three') || id.includes('@react-three')) {
                return 'three-vendor';
              }
              if (id.includes('leaflet') || id.includes('mapbox')) {
                return 'map-vendor';
              }
              return 'vendor';
            }
          },
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split('/').pop().replace(/\.[^/.]+$/, '')
              : 'chunk';
            return `assets/${facadeModuleId}-[hash].js`;
          },
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      reportCompressedSize: false,
      emptyOutDir: true,
      assetsInlineLimit: 4096
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.[jt]sx?$/,
      exclude: [],
      sourcemap: false
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        '@mui/material',
        '@mui/icons-material',
        'i18next',
        'react-i18next',
        'i18next-browser-languagedetector',
        'sonner',
        'lucide-react'
      ],
      exclude: [],
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx'
        },
        sourcemap: false,
        ignoreAnnotations: true
      }
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }
  };
});
