import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { ErrorState, LoadingState } from '@/components/AsyncState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Textarea } from '@/components/ui/Textarea'
import { formatDate, formatDateTime } from '@/lib/format'
import { getErrorMessage } from '@/lib/http'

import { useReviewSolicitation, useSolicitation } from '../hooks/useSolicitations'
import { getSolicitationStatusLabel } from '../presentation'
import { reviewSchema, type ReviewFormValues } from '../schemas/solicitationSchemas'

type Props = { id: string | null; canReview: boolean; onClose: () => void }

export function SolicitationDetailsDialog({ id, canReview, onClose }: Props) {
  const query = useSolicitation(id)
  const mutation = useReviewSolicitation()
  const form = useForm<ReviewFormValues>({ resolver: zodResolver(reviewSchema), defaultValues: { reason: '' } })

  if (!id) return null
  const solicitation = query.data

  return (
    <Dialog open onOpenChange={(open) => { if (!open) { form.reset(); mutation.reset(); onClose() } }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>Detalhes da solicitação</DialogTitle><DialogDescription>Dados enviados e resultado da análise.</DialogDescription></DialogHeader>
        {query.isLoading && <LoadingState className="min-h-48" />}
        {query.isError && <ErrorState className="min-h-48" onRetry={() => void query.refetch()} />}
        {solicitation && (
          <>
            <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-semibold">{[solicitation.firstName, solicitation.surname].filter(Boolean).join(' ')}</h3>{solicitation.status && <Badge variant={solicitation.status === 'REJECTED' ? 'destructive' : 'secondary'}>{getSolicitationStatusLabel(solicitation.status)}</Badge>}</div>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-muted-foreground">Conta</dt><dd className="font-medium">{solicitation.account?.displayName ?? 'Não informada'}</dd></div>
              <div><dt className="text-muted-foreground">E-mail</dt><dd className="font-medium">{solicitation.account?.email ?? 'Não informado'}</dd></div>
              <div><dt className="text-muted-foreground">Nascimento</dt><dd className="font-medium">{formatDate(solicitation.birthDate)}</dd></div>
              <div><dt className="text-muted-foreground">Telefone</dt><dd className="font-medium">{solicitation.phoneNumber ?? 'Não informado'}</dd></div>
              <div><dt className="text-muted-foreground">Enviada em</dt><dd className="font-medium">{formatDateTime(solicitation.submittedAt)}</dd></div>
              <div><dt className="text-muted-foreground">Decidida em</dt><dd className="font-medium">{formatDateTime(solicitation.decidedAt)}</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted-foreground">Justificativa</dt><dd className="mt-1 whitespace-pre-wrap">{solicitation.justification}</dd></div>
              {solicitation.reviewReason && <div className="sm:col-span-2"><dt className="text-muted-foreground">Motivo da decisão</dt><dd className="mt-1 whitespace-pre-wrap">{solicitation.reviewReason}</dd></div>}
            </dl>
            {canReview && solicitation.status === 'PENDING' && (
              <Form {...form}>
                <form className="space-y-4 border-t pt-4" onSubmit={(event) => event.preventDefault()}>
                  <FormField control={form.control} name="reason" render={({ field }) => <FormItem><FormLabel>Motivo da decisão</FormLabel><FormControl><Textarea maxLength={2000} {...field} /></FormControl><FormMessage /></FormItem>} />
                  {mutation.isError && <Alert variant="destructive"><AlertTitle>Não foi possível registrar a decisão.</AlertTitle><AlertDescription>{getErrorMessage(mutation.error)}</AlertDescription></Alert>}
                  <DialogFooter>
                    <Button disabled={mutation.isPending} onClick={form.handleSubmit(({ reason }) => mutation.mutate({ id, decision: 'reject', reason }))} type="button" variant="destructive">Rejeitar</Button>
                    <Button disabled={mutation.isPending} onClick={form.handleSubmit(({ reason }) => mutation.mutate({ id, decision: 'approve', reason }))} type="button">Aprovar</Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
