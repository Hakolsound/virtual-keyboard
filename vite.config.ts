import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import type { Plugin } from 'postcss'

// Convert rem → px so shadow DOM CSS isn't broken by host pages that set
// a non-standard html { font-size } (e.g. 0.052083svh ≈ 0.56px).
// rem in shadow DOM always resolves against the DOCUMENT root, not ours.
const remToPx: Plugin = {
  postcssPlugin: 'rem-to-px',
  Declaration(decl) {
    if (decl.value.includes('rem')) {
      decl.value = decl.value.replace(/(\d*\.?\d+)rem/g, (_, n) =>
        `${Math.round(parseFloat(n) * 16 * 100) / 100}px`
      )
    }
  },
}

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [remToPx],
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssMinify: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
})
