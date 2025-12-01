import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      usePolling: true,
      interval: 300,
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/dist/**",
        "**/build/**",
        "**/dev-server/**",
      ],
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2015',
    modulePreload: {
      polyfill: false, // Reduce overhead
    },
    minify: 'terser', // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console methods
        passes: 2, // Multiple passes for better compression
      },
      mangle: {
        safari10: true, // Better compatibility
      },
      format: {
        comments: false, // Remove all comments
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('react-router-dom')) {
              return 'vendor-router';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            return 'vendor-other';
          }
          // Split pages into separate chunks for lazy loading
          if (id.includes('src/pages/')) {
            const pageName = id.split('src/pages/')[1].split('.')[0];
            return `page-${pageName}`;
          }
        },
        // Optimize chunk names for better caching
        chunkFileNames: (chunkInfo) => {
          // Use shorter names for page chunks to reduce overhead
          if (chunkInfo.name.startsWith('page-')) {
            return 'assets/p/[name]-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    cssCodeSplit: true,
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
    sourcemap: true, // Enable source maps for better debugging and Lighthouse insights
    reportCompressedSize: false,
    // Optimize build for better LCP
    assetsInlineLimit: 4096,
    // Enable tree shaking
    treeshake: {
      moduleSideEffects: false,
    },
  },
}));
