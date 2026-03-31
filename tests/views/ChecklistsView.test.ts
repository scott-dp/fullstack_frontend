/**
 * View tests for checklist templates.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import ChecklistsView from '../../src/views/checklists/ChecklistsView.vue'

const { listTemplatesMock, createTemplateMock, authStoreMock } = vi.hoisted(() => ({
  listTemplatesMock: vi.fn(),
  createTemplateMock: vi.fn(),
  authStoreMock: {
    hasManageAccess: true,
  },
}))

vi.mock('@/api/operations/checklists.ts', () => ({
  checklistApi: {
    listTemplates: listTemplatesMock,
    createTemplate: createTemplateMock,
  },
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('ChecklistsView', () => {
  beforeEach(() => {
    listTemplatesMock.mockReset()
    createTemplateMock.mockReset()
    authStoreMock.hasManageAccess = true
  })

  it('creates a checklist template and adds it to the list', async () => {
    listTemplatesMock.mockResolvedValue([])
    createTemplateMock.mockResolvedValue({
      id: 9,
      title: 'Daily opening',
      description: 'Opening checks',
      frequency: 'DAILY',
      category: 'FOOD',
      items: [
        { id: 1, description: 'Check fridge', sortOrder: 0, requiresComment: false },
      ],
      active: true,
      createdAt: '2026-03-31T10:00:00',
      updatedAt: '2026-03-31T10:00:00',
    })

    render(ChecklistsView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
        },
      },
    })

    expect(await screen.findByText('No checklists found')).toBeTruthy()
    await fireEvent.click(screen.getByRole('button', { name: 'New Template' }))

    await fireEvent.update(screen.getAllByRole('textbox')[0], 'Daily opening')
    await fireEvent.update(screen.getByPlaceholderText('Item 1'), 'Check fridge')
    await fireEvent.click(screen.getByRole('button', { name: 'Create Template' }))

    await waitFor(() => {
      expect(createTemplateMock).toHaveBeenCalled()
      expect(screen.getByText('Daily opening')).toBeTruthy()
    })
  })
})
