import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarDays, ChevronRight, MapPin } from 'lucide-react'

import { EmptyState, ErrorState, LoadingState } from '@/components/AsyncState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatDateTime } from '@/lib/format'

import { getEventTypeLabel, type Event } from '@/features/manage/events'

type UpcomingEventsProps = {
  events: Event[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export function UpcomingEvents({ events, isLoading, isError, onRetry }: UpcomingEventsProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b px-5 py-5 sm:px-6">
        <div>
          <p className="text-sm font-medium text-primary">Fique por dentro</p>
          <CardTitle className="mt-1 text-xl">Próximos eventos</CardTitle>
        </div>
        <Button asChild className="shrink-0" size="sm" variant="ghost">
          <Link to="/manage/events">
            Ver todos
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading && <LoadingState className="min-h-64 rounded-none border-0" title="Carregando programação..." />}
        {isError && (
          <ErrorState
            className="min-h-64 rounded-none border-0"
            description="A programação não pôde ser atualizada agora."
            onRetry={onRetry}
            retryLabel="Atualizar programação"
          />
        )}
        {!isLoading && !isError && events.length === 0 && (
          <EmptyState
            className="min-h-64 rounded-none border-0"
            description="Quando houver novas atividades, elas aparecerão aqui."
            title="Nenhum próximo evento encontrado."
          />
        )}
        {!isLoading && !isError && events.length > 0 && (
          <div className="divide-y divide-border">
            {events.map((event, index) => {
              const content = (
                <>
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-primary/10 p-2.5 text-primary">
                      <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{event.title || 'Evento sem título'}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(event.beginDate)}</p>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {event.location?.name || 'Local não informado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 self-center">
                    <Badge className="hidden sm:inline-flex" variant="secondary">{getEventTypeLabel(event.type)}</Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                </>
              )

              return event.id ? (
                <Link
                  className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none sm:px-6"
                  key={event.id}
                  search={{ eventId: event.id }}
                  to="/manage/events"
                >
                  {content}
                </Link>
              ) : (
                <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6" key={index}>
                  {content}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

    </Card>
  )
}
