import { CalendarDays, MapPin, Navigation, ShieldCheck } from 'lucide-react'

import { ErrorState, ForbiddenState, LoadingState } from '@/components/AsyncState'
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
import { formatCountryName, formatDateTime } from '@/lib/format'
import { isForbiddenError } from '@/lib/http'

import { useEvent } from '../hooks/useEvents'
import {
  getEventAudienceLabel,
  getEventMapUrl,
  getEventStatusLabel,
  getEventTypeLabel,
} from '../presentation'

type EventDetailsDialogProps = {
  eventId: string | null
  onClose: () => void
}

export function EventDetailsDialog({ eventId, onClose }: EventDetailsDialogProps) {
  const query = useEvent(eventId)

  if (!eventId) {
    return null
  }

  const event = query.data
  const mapUrl = getEventMapUrl(event?.location)

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do evento</DialogTitle>
          <DialogDescription>
            Confira a agenda, o público e as informações completas do local.
          </DialogDescription>
        </DialogHeader>

        {query.isLoading && <LoadingState className="min-h-48" title="Carregando detalhes do evento..." />}
        {query.isError && (
          isForbiddenError(query.error)
            ? <ForbiddenState className="min-h-48" description="Sua conta não tem acesso aos detalhes deste evento." />
            : <ErrorState className="min-h-48" onRetry={() => void query.refetch()} />
        )}
        {event && (
          <>
            <div className="flex items-start justify-between gap-3">
              <h3 className="min-w-0 text-lg font-semibold">{event.title ?? 'Evento sem título'}</h3>
              {event.status && (
                <Badge variant={event.status === 'CANCELLED' ? 'destructive' : 'secondary'}>
                  {getEventStatusLabel(event.status)}
                </Badge>
              )}
            </div>

            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" />Início</dt>
                <dd className="mt-1 font-medium">{formatDateTime(event.beginDate)}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" />Término</dt>
                <dd className="mt-1 font-medium">{formatDateTime(event.endDate)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Tipo</dt>
                <dd className="mt-1 font-medium">{getEventTypeLabel(event.type)}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="h-4 w-4" />Público</dt>
                <dd className="mt-1 font-medium">{getEventAudienceLabel(event.requiredPermission?.code)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />Local</dt>
                <dd className="mt-1 font-medium">{event.location?.name ?? 'Não informado'}</dd>
                {event.location && (
                  <p className="mt-1 text-muted-foreground">
                    {[event.location.street, event.location.postalCode, event.location.city, event.location.state, formatCountryName(event.location.countryCode)]
                      .filter(Boolean)
                      .join(' · ') || 'Endereço não informado'}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Descrição</dt>
                <dd className="mt-1 whitespace-pre-wrap font-medium">{event.description || 'Não informada'}</dd>
              </div>
              {event.cancellationReason && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Motivo do cancelamento</dt>
                  <dd className="mt-1 whitespace-pre-wrap font-medium">{event.cancellationReason}</dd>
                </div>
              )}
              {event.location?.latitude !== undefined && event.location?.longitude !== undefined && (
                <div className="sm:col-span-2">
                  <dt className="flex items-center gap-2 text-muted-foreground"><Navigation className="h-4 w-4" />Coordenadas</dt>
                  <dd className="mt-1 font-medium">{event.location.latitude}, {event.location.longitude}</dd>
                </div>
              )}
            </dl>
          </>
        )}

        <DialogFooter>
          <Button onClick={onClose} type="button" variant="outline">Fechar</Button>
          {mapUrl && (
            <Button asChild type="button">
              <a href={mapUrl} rel="noopener noreferrer" target="_blank">Ver local no mapa</a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
