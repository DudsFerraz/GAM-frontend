import { zodResolver } from '@hookform/resolvers/zod'
import {
  Ban,
  CheckCircle2,
  LockKeyhole,
  Pencil,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
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
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import type { PermissionResponse } from '@/features/account'
import { getErrorMessage } from '@/lib/http'

import type { Event } from '../api/events'
import {
  getGenericEventManagementActions,
  type GenericEventManagementAction,
} from '../eventManagement'
import {
  useEventLifecycleCommand,
  useRemoveEvent,
} from '../hooks/useEvents'
import {
  eventReasonSchema,
  reopenEventSchema,
  type EventReasonFormValues,
  type ReopenEventFormValues,
} from '../schemas/eventSchema'
import { EditEventDialog } from './EditEventDialog'

type EventManagementActionsProps = {
  audiencePermissions: PermissionResponse[]
  audiencePermissionsError: boolean
  audiencePermissionsLoading: boolean
  event: Event
  eventId: string
  onRemoved: () => void
}

const ACTION_LABELS: Readonly<Record<GenericEventManagementAction, string>> = {
  edit: 'Editar',
  cancel: 'Cancelar evento',
  lock: 'Bloquear presenças',
  finalize: 'Finalizar',
  reopen: 'Reabrir',
  remove: 'Remover',
}

export function EventManagementActions({
  audiencePermissions,
  audiencePermissionsError,
  audiencePermissionsLoading,
  event,
  eventId,
  onRemoved,
}: EventManagementActionsProps) {
  const [activeAction, setActiveAction] =
    useState<GenericEventManagementAction | null>(null)
  const actions = getGenericEventManagementActions(event.status)

  if (actions.length === 0) {
    return null
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar evento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            As ações disponíveis respeitam a situação atual deste evento genérico.
          </p>
          <div className="flex flex-wrap gap-2">
            {actions.includes('edit') && (
              <Button onClick={() => setActiveAction('edit')} variant="outline">
                <Pencil className="h-4 w-4" />
                {ACTION_LABELS.edit}
              </Button>
            )}
            {actions.includes('lock') && (
              <Button onClick={() => setActiveAction('lock')} variant="outline">
                <LockKeyhole className="h-4 w-4" />
                {ACTION_LABELS.lock}
              </Button>
            )}
            {actions.includes('finalize') && (
              <Button onClick={() => setActiveAction('finalize')}>
                <CheckCircle2 className="h-4 w-4" />
                {ACTION_LABELS.finalize}
              </Button>
            )}
            {actions.includes('reopen') && (
              <Button onClick={() => setActiveAction('reopen')} variant="outline">
                <RotateCcw className="h-4 w-4" />
                {ACTION_LABELS.reopen}
              </Button>
            )}
            {actions.includes('cancel') && (
              <Button onClick={() => setActiveAction('cancel')} variant="destructive">
                <Ban className="h-4 w-4" />
                {ACTION_LABELS.cancel}
              </Button>
            )}
            {actions.includes('remove') && (
              <Button onClick={() => setActiveAction('remove')} variant="destructive">
                <Trash2 className="h-4 w-4" />
                {ACTION_LABELS.remove}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {activeAction === 'edit' && (
        <EditEventDialog
          audiencePermissions={audiencePermissions}
          audiencePermissionsError={audiencePermissionsError}
          audiencePermissionsLoading={audiencePermissionsLoading}
          event={event}
          eventId={eventId}
          onOpenChange={(open) => {
            if (!open) setActiveAction(null)
          }}
          open
        />
      )}
      {(activeAction === 'lock' || activeAction === 'finalize') && (
        <ConfirmLifecycleDialog
          action={activeAction}
          eventId={eventId}
          onOpenChange={(open) => {
            if (!open) setActiveAction(null)
          }}
        />
      )}
      {activeAction === 'cancel' && (
        <CancelEventDialog
          eventId={eventId}
          onOpenChange={(open) => {
            if (!open) setActiveAction(null)
          }}
        />
      )}
      {activeAction === 'reopen' && (
        <ReopenEventDialog
          eventId={eventId}
          eventStatus={event.status}
          onOpenChange={(open) => {
            if (!open) setActiveAction(null)
          }}
        />
      )}
      {activeAction === 'remove' && (
        <RemoveEventDialog
          eventId={eventId}
          onOpenChange={(open) => {
            if (!open) setActiveAction(null)
          }}
          onRemoved={onRemoved}
        />
      )}
    </>
  )
}

function ConfirmLifecycleDialog({
  action,
  eventId,
  onOpenChange,
}: {
  action: 'lock' | 'finalize'
  eventId: string
  onOpenChange: (open: boolean) => void
}) {
  const mutation = useEventLifecycleCommand()
  const isLock = action === 'lock'
  const changeOpen = (open: boolean) => {
    if (!open) mutation.reset()
    onOpenChange(open)
  }

  return (
    <Dialog onOpenChange={changeOpen} open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isLock ? 'Bloquear presenças' : 'Finalizar evento'}
          </DialogTitle>
          <DialogDescription>
            {isLock
              ? 'Após o bloqueio, registros de presença não poderão ser alterados até a reabertura.'
              : 'A finalização conclui administrativamente o evento e bloqueia alterações normais.'}
          </DialogDescription>
        </DialogHeader>
        {mutation.isError && (
          <Alert variant="destructive">
            <AlertTitle>Não foi possível concluir a ação.</AlertTitle>
            <AlertDescription>{getErrorMessage(mutation.error)}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button onClick={() => changeOpen(false)} type="button" variant="outline">
            Voltar
          </Button>
          <Button
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(
              { action, eventId },
              { onSuccess: () => changeOpen(false) },
            )}
            type="button"
          >
            {mutation.isPending
              ? 'Confirmando...'
              : isLock ? 'Bloquear presenças' : 'Finalizar evento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CancelEventDialog({
  eventId,
  onOpenChange,
}: {
  eventId: string
  onOpenChange: (open: boolean) => void
}) {
  const mutation = useEventLifecycleCommand()
  const form = useForm<EventReasonFormValues>({
    resolver: zodResolver(eventReasonSchema),
    defaultValues: { reason: '' },
  })
  const changeOpen = (open: boolean) => {
    if (!open) mutation.reset()
    onOpenChange(open)
  }

  return (
    <Dialog onOpenChange={changeOpen} open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar evento</DialogTitle>
          <DialogDescription>
            O evento continuará no histórico com o motivo do cancelamento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(({ reason }) => mutation.mutate(
              { action: 'cancel', eventId, reason },
              { onSuccess: () => changeOpen(false) },
            ))}
          >
            <ReasonField control={form.control} label="Motivo do cancelamento" />
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>Não foi possível cancelar o evento.</AlertTitle>
                <AlertDescription>{getErrorMessage(mutation.error)}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button onClick={() => changeOpen(false)} type="button" variant="outline">
                Voltar
              </Button>
              <Button disabled={mutation.isPending} type="submit" variant="destructive">
                {mutation.isPending ? 'Cancelando...' : 'Cancelar evento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function ReopenEventDialog({
  eventId,
  eventStatus,
  onOpenChange,
}: {
  eventId: string
  eventStatus?: string
  onOpenChange: (open: boolean) => void
}) {
  const mutation = useEventLifecycleCommand()
  const canKeepAttendanceLocked = eventStatus === 'FINALIZED'
  const form = useForm<ReopenEventFormValues>({
    resolver: zodResolver(reopenEventSchema),
    defaultValues: { reason: '', targetStatus: 'COMPLETED' },
  })
  const changeOpen = (open: boolean) => {
    if (!open) mutation.reset()
    onOpenChange(open)
  }

  return (
    <Dialog onOpenChange={changeOpen} open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reabrir evento</DialogTitle>
          <DialogDescription>
            Informe o motivo e escolha se as presenças também devem ser reabertas.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(({ reason, targetStatus }) => mutation.mutate(
              { action: 'reopen', eventId, reason, targetStatus },
              { onSuccess: () => changeOpen(false) },
            ))}
          >
            {canKeepAttendanceLocked && (
              <FormField
                control={form.control}
                name="targetStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de reabertura</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="COMPLETED">Reabrir evento e presenças</option>
                        <option value="LOCKED">Manter presenças bloqueadas</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo da reabertura</FormLabel>
                  <FormControl><Textarea maxLength={2000} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>Não foi possível reabrir o evento.</AlertTitle>
                <AlertDescription>{getErrorMessage(mutation.error)}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button onClick={() => changeOpen(false)} type="button" variant="outline">
                Voltar
              </Button>
              <Button disabled={mutation.isPending} type="submit">
                {mutation.isPending ? 'Reabrindo...' : 'Reabrir evento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function RemoveEventDialog({
  eventId,
  onOpenChange,
  onRemoved,
}: {
  eventId: string
  onOpenChange: (open: boolean) => void
  onRemoved: () => void
}) {
  const mutation = useRemoveEvent()
  const form = useForm<EventReasonFormValues>({
    resolver: zodResolver(eventReasonSchema),
    defaultValues: { reason: '' },
  })
  const changeOpen = (open: boolean) => {
    if (!open) mutation.reset()
    onOpenChange(open)
  }

  return (
    <Dialog onOpenChange={changeOpen} open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover evento</DialogTitle>
          <DialogDescription>
            O evento deixará de aparecer nas consultas. Presenças ativas impedem a remoção.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(({ reason }) => mutation.mutate(
              { eventId, reason },
              {
                onSuccess: () => {
                  changeOpen(false)
                  onRemoved()
                },
              },
            ))}
          >
            <ReasonField control={form.control} label="Motivo da remoção" />
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>Não foi possível remover o evento.</AlertTitle>
                <AlertDescription>{getErrorMessage(mutation.error)}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button onClick={() => changeOpen(false)} type="button" variant="outline">
                Voltar
              </Button>
              <Button disabled={mutation.isPending} type="submit" variant="destructive">
                {mutation.isPending ? 'Removendo...' : 'Remover evento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function ReasonField({
  control,
  label,
}: {
  control: ReturnType<typeof useForm<EventReasonFormValues>>['control']
  label: string
}) {
  return (
    <FormField
      control={control}
      name="reason"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl><Textarea maxLength={2000} {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
