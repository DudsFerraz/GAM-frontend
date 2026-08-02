import { fireEvent, render, screen, within } from '@testing-library/react'
import { forwardRef, type AnchorHTMLAttributes } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ManageEventsPage } from './ManageEventsPage'

const pageMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  useAccountInfo: vi.fn(),
  useAccountPermissionRecords: vi.fn(),
  useAccountPermissions: vi.fn(),
  useEvents: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: forwardRef<
    HTMLAnchorElement,
    AnchorHTMLAttributes<HTMLAnchorElement> & {
      params?: Record<string, string>
      to: string
    }
  >(({ params, to, ...props }, ref) => {
    const href = Object.entries(params ?? {}).reduce(
      (path, [key, value]) => path.replace(`$${key}`, value),
      to,
    )

    return <a href={href} ref={ref} {...props} />
  }),
  useNavigate: () => pageMocks.navigate,
}))

vi.mock('@/features/account', () => ({
  useAccountInfo: pageMocks.useAccountInfo,
  useAccountPermissionRecords: pageMocks.useAccountPermissionRecords,
  useAccountPermissions: pageMocks.useAccountPermissions,
}))

vi.mock('../hooks/useEvents', () => ({
  useEvents: pageMocks.useEvents,
}))

vi.mock('../components/CreateEventDialog', () => ({
  CreateEventDialog: () => null,
}))

vi.mock('../components/EventDetailsDialog', () => ({
  EventDetailsDialog: () => null,
}))

beforeEach(() => {
  pageMocks.navigate.mockReset()
  pageMocks.useAccountInfo.mockReset()
  pageMocks.useAccountInfo.mockReturnValue({ account: { id: 'account-id' } })
  pageMocks.useAccountPermissionRecords.mockReset()
  pageMocks.useAccountPermissionRecords.mockReturnValue({
    isError: false,
    isLoading: false,
    permissionRecords: [],
  })
  pageMocks.useAccountPermissions.mockReset()
  pageMocks.useAccountPermissions.mockReturnValue({
    permissions: ['EVENT_MANAGE', 'ORATORIO_GET'],
  })
  pageMocks.useEvents.mockReset()
  pageMocks.useEvents.mockReturnValue({
    data: {
      items: [
        {
          beginDate: '2026-08-01T14:00:00.000Z',
          id: 'generic-id',
          status: 'SCHEDULED',
          title: 'Evento genérico',
          type: 'GENERIC',
        },
        {
          beginDate: '2026-08-02T14:00:00.000Z',
          id: 'oratorio-id',
          status: 'SCHEDULED',
          title: 'Encontro do Oratório',
          type: 'ORATORIO',
        },
        {
          beginDate: '2026-08-03T14:00:00.000Z',
          id: 'missa-id',
          status: 'SCHEDULED',
          title: 'Missa da comunidade',
          type: 'MISSA',
        },
        {
          beginDate: '2026-08-04T14:00:00.000Z',
          id: 'future-id',
          status: 'SCHEDULED',
          title: 'Evento futuro',
          type: 'FUTURE_EVENT',
        },
      ],
      page: 0,
      totalElements: 4,
      totalPages: 1,
    },
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
  })
})

describe('ManageEventsPage', () => {
  it('usa a apresentação central nos filtros e nos cards sem alterar destinos', () => {
    render(
      <ManageEventsPage
        onSelectedEventIdChange={vi.fn()}
        selectedEventId={null}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Filtrar' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Campo do filtro' }), {
      target: { value: 'type' },
    })
    expect(
      within(screen.getByRole('combobox', { name: 'Valor do filtro' }))
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['Selecione...', 'Genérico', 'Oratório', 'Missa'])

    const genericCard = screen
      .getByRole('button', { name: 'Ver detalhes de Evento genérico' })
      .closest<HTMLElement>('[data-slot="card"]')
    const oratorioCard = screen
      .getByRole('link', { name: 'Abrir Oratório Encontro do Oratório' })
      .closest<HTMLElement>('[data-slot="card"]')
    const missaCard = screen
      .getByRole('button', { name: 'Ver detalhes de Missa da comunidade' })
      .closest<HTMLElement>('[data-slot="card"]')
    const futureCard = screen
      .getByRole('button', { name: 'Ver detalhes de Evento futuro' })
      .closest<HTMLElement>('[data-slot="card"]')

    if (!genericCard || !oratorioCard || !missaCard || !futureCard) {
      throw new Error('Todos os cards de teste devem estar presentes.')
    }

    expect(genericCard).not.toHaveClass('border-l-4')
    expect(oratorioCard).toHaveClass('border-l-4')
    expect(oratorioCard?.className).toContain(
      'border-l-[light-dark(#059669,#34d399)]',
    )
    expect(missaCard).toHaveClass('border-l-4')
    expect(missaCard?.className).toContain(
      'border-l-[light-dark(#d97706,#fbbf24)]',
    )
    expect(futureCard).not.toHaveClass('border-l-4')

    expect(
      within(genericCard)
        .getByText('Genérico')
        .closest('p')
        ?.querySelector('[aria-hidden]'),
    ).not.toBeInTheDocument()
    expect(
      within(oratorioCard)
        .getByText('Oratório')
        .closest('p')
        ?.querySelector('[aria-hidden]'),
    ).toBeInTheDocument()
    expect(
      within(missaCard)
        .getByText('Missa')
        .closest('p')
        ?.querySelector('[aria-hidden]'),
    ).toBeInTheDocument()
    expect(
      within(futureCard)
        .getByText('Tipo não identificado')
        .closest('p')
        ?.querySelector('[aria-hidden]'),
    ).not.toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: 'Abrir Oratório Encontro do Oratório',
      }),
    ).toHaveAttribute('href', '/manage/oratorios/oratorio-id')
    expect(
      screen.getByRole('link', { name: 'Gerenciar Evento genérico' }),
    ).toHaveAttribute('href', '/manage/events/generic-id')
  })
})
