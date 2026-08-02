import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Textarea } from '@/components/ui/Textarea'
import {
  MemberSearchPicker,
  type MemberListItem,
} from '@/features/manage/members'
import { getErrorMessage } from '@/lib/http'

import { useRegisterEventPresence } from '../hooks/useEvents'
import {
  registerPresenceSchema,
  type RegisterPresenceFormValues,
} from '../schemas/presenceSchemas'

type RegisterPresenceDialogProps = {
  canSearchMembers: boolean
  canViewInactiveMembers: boolean
  eventId: string
  onOpenChange: (open: boolean) => void
  onRegistered: () => void
  open: boolean
}

export function RegisterPresenceDialog({
  canSearchMembers,
  canViewInactiveMembers,
  eventId,
  onOpenChange,
  onRegistered,
  open,
}: RegisterPresenceDialogProps) {
  const [selectedMember, setSelectedMember] = useState<MemberListItem | null>(null)
  const mutation = useRegisterEventPresence()
  const form = useForm<RegisterPresenceFormValues>({
    resolver: zodResolver(registerPresenceSchema),
    defaultValues: { memberId: '', observations: '' },
  })

  const resetDialog = () => {
    setSelectedMember(null)
    form.reset({ memberId: '', observations: '' })
    mutation.reset()
  }

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDialog()
    }
    onOpenChange(nextOpen)
  }

  const selectMember = (member: MemberListItem) => {
    setSelectedMember(member)
    form.setValue('memberId', member.id, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const clearSelectedMember = () => {
    setSelectedMember(null)
    form.setValue('memberId', '', {
      shouldDirty: true,
      shouldValidate: form.formState.isSubmitted,
    })
  }

  const submit = ({ memberId, observations }: RegisterPresenceFormValues) => {
    mutation.mutate(
      {
        eventId,
        memberId,
        observations: observations || null,
      },
      {
        onSuccess: () => {
          changeOpen(false)
          onRegistered()
        },
      },
    )
  }

  return (
    <Dialog onOpenChange={changeOpen} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar presença</DialogTitle>
          <DialogDescription>
            Busque o membro pelo nome ou e-mail e registre a presença confirmada.
          </DialogDescription>
        </DialogHeader>

        {!canSearchMembers && (
          <Alert>
            <AlertTitle>A seleção de membros não está disponível.</AlertTitle>
            <AlertDescription>
              Esta conta pode registrar presenças, mas não pode usar a busca necessária
              para selecionar uma pessoa com segurança. Nenhum identificador técnico será solicitado.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form className="space-y-4" noValidate onSubmit={form.handleSubmit(submit)}>
            {canSearchMembers && (
              <MemberSearchPicker
                includeInactive={canViewInactiveMembers}
                onSelectionClear={clearSelectedMember}
                onSelect={selectMember}
                required={canSearchMembers}
                selectedMemberId={selectedMember?.id}
              />
            )}
            <FormField
              control={form.control}
              name="memberId"
              render={() => (
                <FormItem required>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      maxLength={2000}
                      placeholder="Informação operacional opcional"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>Não foi possível registrar a presença.</AlertTitle>
                <AlertDescription>{getErrorMessage(mutation.error)}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button onClick={() => changeOpen(false)} type="button" variant="outline">
                Cancelar
              </Button>
              <Button
                disabled={mutation.isPending || !canSearchMembers}
                type="submit"
              >
                {mutation.isPending ? 'Registrando…' : 'Registrar presença'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
