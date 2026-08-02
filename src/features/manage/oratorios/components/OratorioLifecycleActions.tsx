import { zodResolver } from '@hookform/resolvers/zod'
import {
  Ban,
  CheckCircle2,
  LockKeyhole,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
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
import { getErrorMessage } from '@/lib/http'

import {
  useOratorioLifecycle,
  useRemoveOratorio,
} from '../hooks/useOratorios'
import {
  getOratorioLifecycleActions,
  type OratorioLifecycleAction,
} from '../oratorioManagement'
import {
  oratorioReasonSchema,
  type OratorioReasonFormValues,
} from '../schemas/oratorioSchemas'

const ACTION_LABELS: Record<OratorioLifecycleAction, string> = {
  cancel: 'Cancelar Oratório',
  finalize: 'Finalizar',
  lock: 'Bloquear presenças',
  remove: 'Excluir ocorrência',
  'reopen-completed': 'Reabrir planejamento e presenças',
  'reopen-locked': 'Reabrir somente planejamento',
}

type OratorioLifecycleActionsProps = {
  oratorioId: string
  status?: string | null
  onRemoved: () => void
}

export function OratorioLifecycleActions({
  oratorioId,
  status,
  onRemoved,
}: OratorioLifecycleActionsProps) {
  const [activeAction, setActiveAction] =
    useState<OratorioLifecycleAction | null>(null)
  const actions = getOratorioLifecycleActions(status)

  if (actions.length === 0) return null

  return (
    <>
      <Card
        aria-label="Ações da ocorrência"
        className="gap-0 py-3"
        role="group"
      >
        <CardContent className="flex flex-wrap gap-2 px-4 sm:px-6">
          {actions.includes('lock') && (
            <Button
              onClick={() => setActiveAction('lock')}
              type="button"
              variant="outline"
            >
              <LockKeyhole aria-hidden="true" className="h-4 w-4" />
              {ACTION_LABELS.lock}
            </Button>
          )}
          {actions.includes('finalize') && (
            <Button
              onClick={() => setActiveAction('finalize')}
              type="button"
            >
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
              {ACTION_LABELS.finalize}
            </Button>
          )}
          {actions.includes('reopen-locked') && (
            <Button
              onClick={() => setActiveAction('reopen-locked')}
              type="button"
              variant="outline"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              {ACTION_LABELS['reopen-locked']}
            </Button>
          )}
          {actions.includes('reopen-completed') && (
            <Button
              onClick={() => setActiveAction('reopen-completed')}
              type="button"
              variant="outline"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              {ACTION_LABELS['reopen-completed']}
            </Button>
          )}
          {actions.includes('cancel') && (
            <Button
              onClick={() => setActiveAction('cancel')}
              type="button"
              variant="destructive"
            >
              <Ban aria-hidden="true" className="h-4 w-4" />
              {ACTION_LABELS.cancel}
            </Button>
          )}
          {actions.includes('remove') && (
            <Button
              onClick={() => setActiveAction('remove')}
              type="button"
              variant="destructive"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              {ACTION_LABELS.remove}
            </Button>
          )}
        </CardContent>
      </Card>

      {(activeAction === 'lock' || activeAction === 'finalize') && (
        <ConfirmLifecycleDialog
          action={activeAction}
          onOpenChange={(open) => {
            if (!open) setActiveAction(null)
          }}
          oratorioId={oratorioId}
        />
      )}
      {activeAction
        && activeAction !== 'lock'
        && activeAction !== 'finalize' && (
        <ReasonLifecycleDialog
          action={activeAction}
          onOpenChange={(open) => {
            if (!open) setActiveAction(null)
          }}
          onRemoved={onRemoved}
          oratorioId={oratorioId}
        />
      )}
    </>
  )
}

function ConfirmLifecycleDialog({
  action,
  onOpenChange,
  oratorioId,
}: {
  action: 'lock' | 'finalize'
  onOpenChange: (open: boolean) => void
  oratorioId: string
}) {
  const mutation = useOratorioLifecycle()
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
            {isLock ? 'Bloquear presenças' : 'Finalizar Oratório'}
          </DialogTitle>
          <DialogDescription>
            {isLock
              ? 'Novas presenças e correções ficarão fechadas até uma reabertura.'
              : 'Planejamento e presenças ficarão fechados após a finalização.'}
          </DialogDescription>
        </DialogHeader>
        {mutation.isError && (
          <Alert variant="destructive">
            <AlertTitle>Não foi possível concluir a ação.</AlertTitle>
            <AlertDescription>
              {getErrorMessage(mutation.error)}
            </AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button
            onClick={() => changeOpen(false)}
            type="button"
            variant="outline"
          >
            Voltar
          </Button>
          <Button
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate(
                { action, oratorioId },
                { onSuccess: () => changeOpen(false) },
              )
            }
            type="button"
          >
            {mutation.isPending
              ? 'Confirmando...'
              : isLock ? 'Bloquear presenças' : 'Finalizar Oratório'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReasonLifecycleDialog({
  action,
  onOpenChange,
  onRemoved,
  oratorioId,
}: {
  action: Exclude<OratorioLifecycleAction, 'lock' | 'finalize'>
  onOpenChange: (open: boolean) => void
  onRemoved: () => void
  oratorioId: string
}) {
  const lifecycleMutation = useOratorioLifecycle()
  const removeMutation = useRemoveOratorio()
  const form = useForm<OratorioReasonFormValues>({
    defaultValues: { reason: '' },
    resolver: zodResolver(oratorioReasonSchema),
  })
  const isRemove = action === 'remove'
  const mutation = isRemove ? removeMutation : lifecycleMutation
  const changeOpen = (open: boolean) => {
    if (!open) {
      form.reset()
      lifecycleMutation.reset()
      removeMutation.reset()
    }
    onOpenChange(open)
  }
  const title = ACTION_LABELS[action]
  const description = action === 'cancel'
    ? 'A ocorrência continuará no histórico e novas presenças não poderão ser incluídas.'
    : action === 'remove'
      ? 'A exclusão só será concluída se não houver presenças ativas.'
      : action === 'reopen-locked'
        ? 'O planejamento voltará a aceitar correções, mas as presenças continuarão bloqueadas.'
        : 'O planejamento e o controle de presença voltarão a aceitar correções.'

  const submit = ({ reason }: OratorioReasonFormValues) => {
    if (action === 'remove') {
      removeMutation.mutate(
        { oratorioId, reason },
        {
          onSuccess: () => {
            changeOpen(false)
            onRemoved()
          },
        },
      )
      return
    }

    if (action === 'cancel') {
      lifecycleMutation.mutate(
        { action: 'cancel', oratorioId, reason },
        { onSuccess: () => changeOpen(false) },
      )
      return
    }

    lifecycleMutation.mutate(
      {
        action: 'reopen',
        oratorioId,
        reason,
        targetStatus: action === 'reopen-locked'
          ? 'LOCKED'
          : 'COMPLETED',
      },
      { onSuccess: () => changeOpen(false) },
    )
  }

  return (
    <Dialog onOpenChange={changeOpen} open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            noValidate
            onSubmit={form.handleSubmit(submit)}
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem required>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Textarea maxLength={2000} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>Não foi possível concluir a ação.</AlertTitle>
                <AlertDescription>
                  {getErrorMessage(mutation.error)}
                </AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button
                onClick={() => changeOpen(false)}
                type="button"
                variant="outline"
              >
                Voltar
              </Button>
              <Button
                disabled={mutation.isPending}
                type="submit"
                variant={
                  action === 'cancel' || action === 'remove'
                    ? 'destructive'
                    : 'default'
                }
              >
                {mutation.isPending ? 'Confirmando...' : title}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
