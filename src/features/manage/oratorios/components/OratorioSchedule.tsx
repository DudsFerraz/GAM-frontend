import { Clock3, Sparkles } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

import type { OratorioScheduleItem } from '../api/oratorios'
import { getOratorioSchedulePresentation } from '../presentation'

export function OratorioSchedule({
  schedule,
}: {
  schedule?: OratorioScheduleItem[] | null
}) {
  const presentedSchedule = getOratorioSchedulePresentation(schedule)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Programação fixa</CardTitle>
        <p className="text-sm text-muted-foreground">
          A sequência é igual em todas as ocorrências e não precisa ser
          editada.
        </p>
      </CardHeader>
      <CardContent>
        {!presentedSchedule ? (
          <p
            className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground"
            role="status"
          >
            A programação desta ocorrência não pôde ser identificada.
            Atualize a página e, se o problema continuar, procure a
            coordenação.
          </p>
        ) : (
          <ol className="relative space-y-0 before:absolute before:bottom-4 before:left-[1.15rem] before:top-4 before:w-px before:bg-border">
            {presentedSchedule.map((item, index) => (
              <li
                className="relative grid grid-cols-[2.4rem_1fr] gap-3 pb-6 last:pb-0"
                key={item.startTime}
              >
                <span className="relative z-[1] flex h-9 w-9 items-center justify-center rounded-full border bg-background text-primary shadow-sm">
                  {index === presentedSchedule.length - 1 ? (
                    <Sparkles aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <Clock3 aria-hidden="true" className="h-4 w-4" />
                  )}
                </span>
                <div className="rounded-lg border bg-muted/20 px-4 py-3">
                  <p className="text-sm font-semibold text-primary">
                    {item.startTime}
                    {item.endTime ? `–${item.endTime}` : ''}
                  </p>
                  <p className="mt-1 font-medium">{item.activity}</p>
                  {item.startTime === '16:30' && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Atividades realizadas em paralelo.
                    </p>
                  )}
                  {item.startTime === '17:00' && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Encerramento, sem intervalo próprio na agenda.
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
