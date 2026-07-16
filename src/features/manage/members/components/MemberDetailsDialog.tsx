import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Link } from '@tanstack/react-router'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
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
import { Input } from '@/components/ui/Input'
import { getErrorMessage } from '@/lib/http'

import { useUpdateMemberStatus } from '../hooks/useUpdateMemberStatus'
import type { MemberListItem } from '../types'

const memberStatusSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Informe o motivo da alteração.')
    .max(2000, 'O motivo deve ter no máximo 2.000 caracteres.'),
})

type MemberStatusFormValues = z.infer<typeof memberStatusSchema>

const statusLabels = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
} as const

type MemberDetailsDialogProps = {
  member: MemberListItem | null
  canChangeStatus: boolean
  onClose: () => void
}

export function MemberDetailsDialog({
  member,
  canChangeStatus,
  onClose,
}: MemberDetailsDialogProps) {
  const form = useForm<MemberStatusFormValues>({
    resolver: zodResolver(memberStatusSchema),
    defaultValues: { reason: '' },
  })
  const updateStatus = useUpdateMemberStatus()

  if (!member) {
    return null
  }

  const nextStatus = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  const actionLabel = nextStatus === 'ACTIVE' ? 'Reativar' : 'Desativar'

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
      updateStatus.reset()
      onClose()
    }
  }

  const handleSubmit = (values: MemberStatusFormValues) => {
    updateStatus.mutate(
      { memberId: member.id, status: nextStatus, reason: values.reason },
      {
        onSuccess: () => {
          form.reset()
          onClose()
        },
      },
    )
  }

  const fullName = [member.firstName, member.surname].filter(Boolean).join(' ')

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{fullName}</DialogTitle>
          <DialogDescription>
            Informações do membro e ações de ciclo de vida disponíveis.
          </DialogDescription>
        </DialogHeader>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Nome de exibição</dt>
            <dd className="font-medium">{member.displayName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="mt-1">
              <Badge variant={member.status === 'INACTIVE' ? 'destructive' : 'secondary'}>
                {member.status ? statusLabels[member.status] : 'Não informado'}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">E-mail</dt>
            <dd className="font-medium">{member.email ?? 'Não informado'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Telefone</dt>
            <dd className="font-medium">{member.phoneNumber ?? 'Não informado'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Nascimento</dt>
            <dd className="font-medium">{member.birthDate ?? 'Não informado'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Identificador</dt>
            <dd className="break-all font-medium">{member.id}</dd>
          </div>
        </dl>

        {canChangeStatus && member.status && (
          <Form {...form}>
            <form className="space-y-4 border-t pt-4" onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo para {actionLabel.toLowerCase()}</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        placeholder="Descreva o motivo da alteração"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {updateStatus.isError && (
                <Alert variant="destructive">
                  <AlertTitle>Não foi possível alterar o status.</AlertTitle>
                  <AlertDescription>{getErrorMessage(updateStatus.error)}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button onClick={onClose} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={updateStatus.isPending} type="submit">
                  {updateStatus.isPending ? 'Salvando...' : actionLabel}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {(!canChangeStatus || !member.status) && (
          <DialogFooter>
            <Button onClick={onClose} type="button">
              Fechar
            </Button>
          </DialogFooter>
        )}

        <Button asChild type="button" variant="outline">
          <Link
            params={{ memberId: member.id }}
            to="/manage/members/$memberId"
          >
            Ver perfil e histórico
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  )
}
