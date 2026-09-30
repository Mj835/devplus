/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        /*
         * Pages are split by React.lazy (src/app/App.tsx). These groups keep third-party code in stable,
         * separately cached chunks: an app deploy doesn't invalidate the (much larger) vendor downloads.
         */
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 30 },
            { name: 'router', test: /node_modules[\\/]react-router[\\/]/, priority: 20 },
            { name: 'query', test: /node_modules[\\/]@tanstack[\\/]/, priority: 20 },
            // Icons are shared by every page; one small chunk beats many 0.2 kB requests.
            { name: 'icons', test: /node_modules[\\/]lucide-react[\\/]/, priority: 10 },
            // App code used by more than one page (API layer, shared components, helpers).
            {
              name: 'shared',
              test: /[\\/]src[\\/](api|components|hooks|lib|styles)[\\/]/,
              minShareCount: 2,
              priority: 5,
            },
          ],
        },
      },
    },
  },
  test: { environment: 'node' },
});
