import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PermissionResponse } from '@/features/account'

import { EditEventDialog } from './EditEventDialog'

const hookMocks = vi.hoisted(() => ({
  useLocationOptions: vi.fn(),
  useReplaceEvent: vi.fn(),
}))

vi.mock('@/features/manage/locations', () => ({
  useLocationOptions: hookMocks.useLocationOptions,
}))

vi.mock('../hooks/useEvents', () => ({
  useReplaceEvent: hookMocks.useReplaceEvent,
}))

const permission: PermissionResponse = {
  code: 'EVENT_VIEW',
  description: 'Visualizar eventos',
  id: '550e8400-e29b-41d4-a716-446655440000',
  label: 'Eventos',
}

const event = {
  beginDate: '2026-08-08T21:37:00.000Z',
  description: 'Descrição do evento',
  endDate: '2026-08-08T23:37:00.000Z',
  gamLocation: {
    city: 'Piracicaba',
    code: null,
    countryCode: 'BR',
    id: '650e8400-e29b-41d4-a716-446655440000',
    latitude: null,
    longitude: null,
    name: 'Dom Bosco Assunção',
    postalCode: null,
    state: 'SP',
    street: null,
    systemManaged: false,
  },
  id: '750e8400-e29b-41d4-a716-446655440000',
  requiredPermission: undefined,
  title: 'Reunião de coordenação',
  type: 'GENERIC' as const,
}

beforeEach(() => {
  hookMocks.useLocationOptions.mockReset()
  hookMocks.useLocationOptions.mockReturnValue({
    data: { items: [event.gamLocation] },
    isError: false,
    isLoading: false,
  })
  hookMocks.useReplaceEvent.mockReset()
  hookMocks.useReplaceEvent.mockReturnValue({
    error: null,
    isError: false,
    isPending: false,
    mutate: vi.fn(),
  })
})

describe('EditEventDialog', () => {
  it('marca o motivo somente quando o público é alterado', async () => {
    const user = userEvent.setup()

    render(
      <EditEventDialog
        audiencePermissions={[permission]}
        audiencePermissionsError={false}
        audiencePermissionsLoading={false}
        event={event}
        eventId={event.id ?? ''}
        onOpenChange={vi.fn()}
        open
      />,
    )

    const audience = screen.getByLabelText('Público do evento')
    const reasonLabel = screen.getByText('Motivo da alteração')
    const reason = screen.getByLabelText('Motivo da alteração')

    expect(reasonLabel).not.toHaveAttribute('data-required')
    expect(reason).not.toHaveAttribute('required')
    expect(reason).not.toHaveAttribute('aria-required')

    await user.selectOptions(audience, permission.id)

    expect(reasonLabel).toHaveAttribute('data-required', 'true')
    expect(reason).toHaveAttribute('required')
    expect(reason).toHaveAttribute('aria-required', 'true')

    await user.selectOptions(audience, '')

    expect(reasonLabel).not.toHaveAttribute('data-required')
    expect(reason).not.toHaveAttribute('required')
    expect(reason).not.toHaveAttribute('aria-required')
  })
})
