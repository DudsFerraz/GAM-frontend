import { Link } from '@tanstack/react-router'
import { ChevronRight, FileText } from 'lucide-react'
import { useState } from 'react'

import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/AsyncState'
import { Pagination } from '@/components/Pagination'
import { Badge } from '@/components/ui/Badge'
import {
  Card,
  CardActionArea,
  CardContent,
} from '@/components/ui/Card'
import { formatDate, formatDateTime } from '@/lib/format'
import { isForbiddenError } from '@/lib/http'
import { cn } from '@/lib/utils'

import { useOratorianoFormHistory } from '../hooks/useOratorianoForms'
import {
  getOratorianoFormAttachmentLabel,
  getOratorianoFormOriginLabel,
  getOratorianoFormStatusPresentation,
} from '../presentation'
import type { OratorianoFormHistoryItem } from '../types'

type OratorianoFormsSectionProps = {
  canView: boolean
  oratorianoId: string
}

export function OratorianoFormsSection({
  canView,
  oratorianoId,
}: OratorianoFormsSectionProps) {
  const [page, setPage] = useState(0)
  const historyQuery = useOratorianoFormHistory(
    oratorianoId,
    page,
    canView,
  )

  if (!canView) {
    return (
      <section aria-labelledby="oratoriano-forms-title" className="space-y-4">
        <SectionHeading />
        <ForbiddenState description="Sua conta não pode consultar o histórico de fichas adicionais." />
      </section>
    )
  }

  const items = historyQuery.data?.items ?? []

  return (
    <section aria-labelledby="oratoriano-forms-title" className="space-y-4">
      <SectionHeading />

      {historyQuery.isLoading && (
        <LoadingState title="Carregando fichas adicionais…" />
      )}

      {historyQuery.isError && (
        isForbiddenError(historyQuery.error) ? (
          <ForbiddenState description="Sua conta não pode consultar o histórico de fichas adicionais." />
        ) : (
          <ErrorState
            description="Não foi possível carregar as fichas adicionais. Tente novamente."
            onRetry={() => void historyQuery.refetch()}
          />
        )
      )}

      {!historyQuery.isLoading
        && !historyQuery.isError
        && items.length === 0 && (
        <EmptyState
          description="As fichas cadastradas aparecerão aqui."
          title="Nenhuma ficha adicional registrada."
        />
      )}

      {!historyQuery.isError && items.length > 0 && (
        <>
          {historyQuery.isFetching && !historyQuery.isLoading && (
            <p
              aria-live="polite"
              className="text-sm text-muted-foreground"
              role="status"
            >
              Atualizando fichas adicionais…
            </p>
          )}
          <ol className="space-y-0" aria-label="Versões das fichas adicionais">
            {items.map((item, index) => (
              <HistoryItem
                isLast={index === items.length - 1}
                item={item}
                key={item.id ?? `${item.version ?? 'sem-versao'}-${index}`}
                oratorianoId={oratorianoId}
              />
            ))}
          </ol>
        </>
      )}

      {!historyQuery.isError && historyQuery.data && (
        <Pagination
          disabled={historyQuery.isFetching}
          itemLabel="fichas"
          onPageChange={setPage}
          page={historyQuery.data.page ?? page}
          totalElements={historyQuery.data.totalElements ?? items.length}
          totalPages={historyQuery.data.totalPages ?? 0}
        />
      )}
    </section>
  )
}

function SectionHeading() {
  return (
    <div>
      <h2
        className="font-heading text-xl font-bold"
        id="oratoriano-forms-title"
      >
        Fichas adicionais
      </h2>
      <p className="text-sm text-muted-foreground">
        Histórico de versões cadastradas para este Oratoriano.
      </p>
    </div>
  )
}

function HistoryItem({
  isLast,
  item,
  oratorianoId,
}: {
  isLast: boolean
  item: OratorianoFormHistoryItem
  oratorianoId: string
}) {
  const status = getOratorianoFormStatusPresentation(item.status)
  const canOpen = typeof item.id === 'string' && item.id.trim().length > 0

  return (
    <li className="grid grid-cols-[1rem_minmax(0,1fr)] gap-3">
      <div aria-hidden="true" className="flex flex-col items-center">
        <span
          className={cn(
            'mt-5 h-3 w-3 shrink-0 rounded-full ring-4',
            status.dotClassName,
          )}
        />
        {!isLast && <span className="w-px flex-1 bg-border" />}
      </div>
      <Card
        className={cn('mb-3 gap-0 py-4', status.cardClassName)}
        interactive={canOpen}
      >
        {canOpen && item.id && (
          <CardActionArea asChild>
            <Link
              aria-label={typeof item.version === 'number'
                ? `Abrir ficha adicional, versão ${item.version}`
                : 'Abrir ficha adicional'}
              params={{ formId: item.id, oratorianoId }}
              to="/manage/oratorios/oratorianos/$oratorianoId/fichas/$formId"
            />
          </CardActionArea>
        )}
        <CardContent className="pointer-events-none relative z-[1]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <FileText
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-primary"
              />
              <h3 className="font-semibold">
                {typeof item.version === 'number'
                  ? `Versão ${item.version}`
                  : 'Versão não informada'}
              </h3>
            </div>
            <Badge className={status.badgeClassName} variant="outline">
              {status.label}
            </Badge>
          </div>

          <p className="mt-3 text-sm text-foreground">
            {getOratorianoFormOriginLabel(item.origin)}
            {' · '}
            criada em {formatDateTime(item.createdAt)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {getLifecycleSummary(item)}
            {' · '}
            {getOratorianoFormAttachmentLabel(
              item.attachmentExists,
              item.attachmentPageCount,
            )}
          </p>
          {canOpen && (
            <p className="mt-3 flex items-center justify-end gap-1 text-sm font-medium text-primary">
              Abrir ficha
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </p>
          )}
        </CardContent>
      </Card>
    </li>
  )
}

function getLifecycleSummary(item: OratorianoFormHistoryItem): string {
  const parts = item.signedOn
    ? [`Assinada em ${formatDate(item.signedOn)}`]
    : ['Sem assinatura informada']

  if (item.completedAt) {
    parts.push(`concluída em ${formatDateTime(item.completedAt)}`)
  }

  if (item.revokedAt) {
    parts.push(`revogada em ${formatDateTime(item.revokedAt)}`)
  }

  return parts.join(' · ')
}
