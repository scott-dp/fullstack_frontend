import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'istanbul',
      reportsDirectory: './coverage/unit',
      reporter: ['text', 'html', 'lcov', 'json-summary', 'json', 'cobertura'],
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/main.ts'],
      all: true,
    },
  },
})
