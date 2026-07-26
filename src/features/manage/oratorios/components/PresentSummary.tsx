import { ListChecks, RefreshCw, UserRound } from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { cn } from '@/lib/utils'

import type {
  Attendance,
  PresentSummary as PresentSummaryData,
} from '../api/oratorios'
import {
  getAttendancePersonName,
  getAttendancePersonRestrictionLabel,
} from '../presentation'

type PresentSummaryProps = {
  isError: boolean
  isLoading: boolean
  onRetry: () => void
  summary?: PresentSummaryData
}

export function PresentSummary({
  isError,
  isLoading,
  onRetry,
  summary,
}: PresentSummaryProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const isUnavailable = isError || (!isLoading && !summary)
  const isReady = !isLoading && !isUnavailable
  const members = isReady ? summary?.members ?? [] : []
  const oratorianos = isReady ? summary?.oratorianos ?? [] : []
  const total = members.length + oratorianos.length

  const content = (
    <PresentSummaryContent
      isError={isUnavailable}
      isLoading={isLoading}
      members={members}
      onRetry={onRetry}
      oratorianos={oratorianos}
    />
  )

  return (
    <>
      <Card className="hidden xl:sticky xl:top-0 xl:flex xl:max-h-[calc(100vh-4rem)] xl:overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Presentes</CardTitle>
            <Badge variant="secondary">
              {isLoading ? 'Carregando...' : isUnavailable ? '—' : total}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Resumo completo, independente da busca e da página atual.
          </p>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>

      <div className="fixed inset-x-3 bottom-3 z-30 xl:hidden">
        <Button
          aria-label={
            isLoading
              ? 'Abrir resumo de presentes em carregamento'
              : isUnavailable
              ? 'Abrir resumo de presentes indisponível'
              : `Abrir resumo com ${total} pessoas presentes`
          }
          className="h-auto w-full justify-between rounded-xl px-4 py-3 shadow-lg"
          onClick={() => setIsMobileOpen(true)}
          type="button"
        >
          <span className="flex items-center gap-2">
            <ListChecks aria-hidden="true" className="h-5 w-5" />
            <span className="text-left">
              <span className="block">
                Presentes:{' '}
                {isLoading
                  ? 'carregando...'
                  : isUnavailable ? 'indisponível' : total}
              </span>
              <span className="block text-xs font-normal opacity-90">
                {isLoading
                  ? 'Aguarde o resumo completo'
                  : isUnavailable
                  ? 'Toque para tentar novamente'
                  : `${members.length} membros · ${oratorianos.length} Oratorianos`}
              </span>
            </span>
          </span>
          <span className="text-xs">Ver resumo</span>
        </Button>
      </div>

      <Dialog onOpenChange={setIsMobileOpen} open={isMobileOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Presentes neste Oratório</DialogTitle>
            <DialogDescription>
              {isLoading
                ? 'O resumo completo está sendo carregado.'
                : isUnavailable
                ? 'Não foi possível carregar o resumo completo.'
                : `${total} ${total === 1 ? 'pessoa marcada' : 'pessoas marcadas'} no total.`}
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    </>
  )
}

function PresentSummaryContent({
  isError,
  isLoading,
  members,
  onRetry,
  oratorianos,
}: {
  isError: boolean
  isLoading: boolean
  members: Attendance[]
  onRetry: () => void
  oratorianos: Attendance[]
}) {
  if (isLoading) {
    return (
      <p
        aria-live="polite"
        className="text-sm text-muted-foreground"
      >
        Carregando resumo...
      </p>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Resumo indisponível.</AlertTitle>
        <AlertDescription>
          <Button
            className="mt-2"
            onClick={onRetry}
            size="sm"
            type="button"
            variant="outline"
          >
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (members.length === 0 && oratorianos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        Ninguém foi marcado como presente ainda.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      <SummaryGroup items={members} label="Membros" />
      <SummaryGroup items={oratorianos} label="Oratorianos" />
    </div>
  )
}

function SummaryGroup({
  items,
  label,
}: {
  items: Attendance[]
  label: string
}) {
  return (
    <section aria-label={`${label} presentes`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum.</p>
      ) : (
        <ul className="space-y-1.5">
          {[...items]
            .sort((left, right) =>
              getAttendancePersonName(left.person).localeCompare(
                getAttendancePersonName(right.person),
                'pt-BR',
              ),
            )
            .map((attendance, index) => {
              const restrictionLabel =
                getAttendancePersonRestrictionLabel(attendance.person)

              return (
                <li
                  className={cn(
                    'flex items-center gap-2 rounded-md bg-muted/40 px-2.5 py-2 text-sm',
                    restrictionLabel && 'opacity-75',
                  )}
                  key={attendance.id ?? attendance.person?.id ?? index}
                >
                  <UserRound
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 text-primary"
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {getAttendancePersonName(attendance.person)}
                  </span>
                  {restrictionLabel && (
                    <Badge className="shrink-0" variant="outline">
                      {restrictionLabel}
                    </Badge>
                  )}
                </li>
              )
            })}
        </ul>
      )}
    </section>
  )
}
