import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Event } from '../api/events'
import { EventPresencesSection } from './EventPresencesSection'

const hookMocks = vi.hoisted(() => ({
  useEventPresences: vi.fn(),
}))

vi.mock('../hooks/useEvents', () => hookMocks)

beforeEach(() => {
  hookMocks.useEventPresences.mockReset()
  hookMocks.useEventPresences.mockReturnValue({
    data: {
      items: [{
        id: 'presence-id',
        member: {
          firstName: 'Maria',
          id: 'member-id',
          status: 'ACTIVE',
          surname: 'Silva',
        },
        observations: null,
        registeredAt: '2026-08-01T13:00:00.000Z',
      }],
      page: 0,
      size: 12,
      totalElements: 13,
      totalPages: 2,
    },
    error: null,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
  })
})

describe('EventPresencesSection', () => {
  it('não apresenta roster nem paginação quando a consulta não é permitida', () => {
    render(
      <EventPresencesSection
        canEditPresences={false}
        canRegisterPresences={false}
        canRemovePresences={false}
        canSearchMembers={false}
        canViewInactiveMembers={false}
        canViewPresences={false}
        event={{
          beginDate: '2026-08-01T13:00:00.000Z',
          status: 'FINALIZED',
          type: 'GENERIC',
        } as Event}
        eventId="event-id"
      />,
    )

    expect(screen.getByText(
      'Sua conta não tem acesso à lista de presenças deste evento.',
    )).toBeInTheDocument()
    expect(screen.queryByText('Maria Silva')).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', {
      name: 'Paginação de presenças',
    })).not.toBeInTheDocument()
    expect(hookMocks.useEventPresences).toHaveBeenCalledWith(
      'event-id',
      0,
      false,
    )
  })

  it('habilita o registro antes do início do evento agendado', () => {
    render(
      <EventPresencesSection
        canEditPresences={false}
        canRegisterPresences
        canRemovePresences={false}
        canSearchMembers
        canViewInactiveMembers={false}
        canViewPresences={false}
        event={{
          beginDate: '2036-08-01T13:00:00.000Z',
          status: 'SCHEDULED',
          type: 'GENERIC',
        } as Event}
        eventId="event-id"
      />,
    )

    expect(screen.getByRole('button', {
      name: 'Registrar presença',
    })).toBeEnabled()
    expect(screen.queryByText(
      'O registro ficará disponível quando a janela de presença deste evento estiver aberta.',
    )).not.toBeInTheDocument()
  })
})
