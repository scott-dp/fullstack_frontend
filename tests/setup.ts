/**
 * Shared Vitest setup for DOM cleanup and restored mocks between tests.
 */
import { cleanup } from '@testing-library/vue'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
