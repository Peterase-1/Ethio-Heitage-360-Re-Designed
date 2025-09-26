import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    hmr: {
      overlay: false
    },
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true
      }
    }
  },
  build: {
    // Disable build sourcemaps to avoid missing map lookups in third-party deps
    sourcemap: false,
    // Ignore sourcemaps for problematic third-party packages to silence noisy warnings
    sourcemapIgnoreList: (relativeSourcePath, sourcemapPath) => {
      return /node_modules[\\/](lucide-react)/.test(relativeSourcePath) || /node_modules[\\/](lucide-react)/.test(sourcemapPath)
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
        chunkFileNames: 'assets/[name].[hash].js'
      }
    }
  },
  css: {
    devSourcemap: false
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
    // Disable esbuild sourcemaps during dev optimize to prevent Vite trying to fetch non-existent maps
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
      // Prebundle lucide-react so its files are processed by esbuild (without sourcemaps)
      'lucide-react'
    ],
    // Do not exclude lucide-react so it gets pre-bundled (avoids raw sourcemap references)
    exclude: [],
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
      sourcemap: false,
      ignoreAnnotations: true
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})
