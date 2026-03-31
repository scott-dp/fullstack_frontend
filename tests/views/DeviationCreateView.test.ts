/**
 * View tests for deviation creation.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import DeviationCreateView from '../../src/views/deviations/DeviationCreateView.vue'

const pushMock = vi.fn()

const { createDeviationMock } = vi.hoisted(() => ({
  createDeviationMock: vi.fn(),
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push: pushMock }),
  }
})

vi.mock('@/api/operations/deviations.ts', () => ({
  deviationApi: {
    create: createDeviationMock,
  },
}))

describe('DeviationCreateView', () => {
  beforeEach(() => {
    createDeviationMock.mockReset()
    pushMock.mockReset()
  })

  it('creates a deviation and redirects to the deviation list', async () => {
    createDeviationMock.mockResolvedValue({ id: 5 })

    render(DeviationCreateView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
        },
      },
    })

    await fireEvent.update(screen.getByPlaceholderText('Brief description of the issue'), 'Cold storage issue')
    await fireEvent.update(
      screen.getByPlaceholderText('Detailed description of what happened, where, and any immediate actions taken'),
      'Fridge 2 exceeded the safe threshold for 20 minutes.',
    )
    await fireEvent.click(screen.getByRole('button', { name: 'Report Deviation' }))

    await waitFor(() => {
      expect(createDeviationMock).toHaveBeenCalledWith({
        title: 'Cold storage issue',
        description: 'Fridge 2 exceeded the safe threshold for 20 minutes.',
        category: 'FOOD',
        severity: 'MEDIUM',
      })
      expect(pushMock).toHaveBeenCalledWith('/app/deviations')
    })
  })
})
