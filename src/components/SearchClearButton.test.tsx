import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SearchClearButton } from './SearchClearButton'

describe('SearchClearButton', () => {
  it('expõe uma ação acessível para limpar a busca', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()

    render(<SearchClearButton onClear={onClear} />)

    await user.click(screen.getByRole('button', { name: 'Limpar busca' }))

    expect(onClear).toHaveBeenCalledOnce()
  })
})
