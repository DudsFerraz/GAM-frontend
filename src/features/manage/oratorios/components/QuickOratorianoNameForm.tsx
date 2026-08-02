import type { UseFormReturn } from 'react-hook-form'

import { Search } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'

import type { RegisterOratorianoFormValues } from '@/features/manage/oratorianos'

type QuickOratorianoNameFormProps = {
  enabled: boolean
  form: UseFormReturn<RegisterOratorianoFormValues>
  isCheckingName: boolean
  onCheckName: () => void
}

export function QuickOratorianoNameForm({
  enabled,
  form,
  isCheckingName,
  onCheckName,
}: QuickOratorianoNameFormProps) {
  return (
    <Form {...form}>
      <form
        className="space-y-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          onCheckName()
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem required>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    disabled={!enabled}
                    maxLength={32}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem required>
                <FormLabel>Sobrenome completo</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    disabled={!enabled}
                    maxLength={64}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          disabled={!enabled || isCheckingName}
          type="submit"
          variant="outline"
        >
          <Search aria-hidden="true" className="h-4 w-4" />
          Conferir nome
        </Button>
      </form>
    </Form>
  )
}
