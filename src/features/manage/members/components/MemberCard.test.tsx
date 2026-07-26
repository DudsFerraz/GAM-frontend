import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { MemberListItem } from '../types'
import { MemberCard } from './MemberCard'

const member: MemberListItem = {
  birthDate: '2000-01-01',
  displayName: 'Ana Silva',
  email: 'ana@example.test',
  firstName: 'Ana',
  id: '550e8400-e29b-41d4-a716-446655440000',
  phoneNumber: '+5519999999999',
  status: 'ACTIVE',
  surname: 'Silva',
}

describe('MemberCard', () => {
  it('abre os detalhes pela área principal sem exibir ação redundante', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()

    render(<MemberCard member={member} onClick={onClick} />)

    expect(screen.queryByText('Ver detalhes')).not.toBeInTheDocument()

    const action = screen.getByRole('button', {
      name: 'Ver detalhes de Ana Silva',
    })
    action.focus()
    await user.keyboard(' ')

    expect(onClick).toHaveBeenCalledWith(member)
  })
})
