import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormLegend,
} from './Form'
import { Input } from './Input'

function RequiredField({ required = false }: { required?: boolean }) {
  const form = useForm({ defaultValues: { name: '' } })

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem required={required}>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </Form>
  )
}

function RequiredLegend() {
  const form = useForm({ defaultValues: { origin: '' } })

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="origin"
        render={() => (
          <FormItem required>
            <fieldset>
              <FormLegend>Origem</FormLegend>
            </fieldset>
          </FormItem>
        )}
      />
    </Form>
  )
}

describe('componentes de formulário', () => {
  it('indica visual e semanticamente um campo obrigatório', () => {
    render(<RequiredField required />)

    expect(screen.getByText('Nome')).toHaveAttribute('data-required', 'true')
    expect(screen.getByText('Nome')).toHaveClass("after:content-['*']")
    expect(screen.getByText(/obrigatório/)).toHaveClass('sr-only')
    expect(screen.getByRole('textbox')).toHaveAttribute('required')
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true')
  })

  it('não marca campos opcionais', () => {
    render(<RequiredField />)

    expect(screen.queryByText('*')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox')).not.toHaveAttribute('required')
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-required')
  })

  it('indica obrigatoriedade em uma legenda de grupo', () => {
    render(<RequiredLegend />)

    expect(screen.getByRole('group')).toHaveTextContent('Origem*')
    expect(screen.getByText(/obrigatório/)).toHaveClass('sr-only')
  })
})
