import { ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import type {
  OratorioPlanning,
  OratorioScheduleItem,
  OratorioTeam,
  OratorioTeamType,
} from '../api/oratorios'
import { getOratorioSchedulePresentation } from '../presentation'
import {
  OratorioPlanningForm,
  type OratorioPlanningFieldName,
} from './OratorioPlanningForm'
import { OratorioTeamAssignment } from './OratorioTeamAssignment'

const TEAM_TYPES = {
  lanche: 'LANCHE',
  gincana: 'GINCANA',
  boaTardeCriancas: 'BOA_TARDE_CRIANCAS',
  boaTardeJovens: 'BOA_TARDE_JOVENS',
} as const satisfies Record<string, OratorioTeamType>

type OratorioScheduleProps = {
  canEditPlanning: boolean
  canManageTeams: boolean
  canReadRoster: boolean
  oratorioId: string
  planning?: OratorioPlanning | null
  schedule?: OratorioScheduleItem[] | null
  teams?: OratorioTeam[] | null
}

export function OratorioSchedule({
  canEditPlanning,
  canManageTeams,
  canReadRoster,
  oratorioId,
  planning,
  schedule,
  teams,
}: OratorioScheduleProps) {
  const presentedSchedule = getOratorioSchedulePresentation(schedule)
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const getTeam = (teamType: OratorioTeamType) =>
    teams?.find((team) => team.type === teamType)

  const toggleItem = (startTime: string) => {
    setOpenItems((current) => ({
      ...current,
      [startTime]: !current[startTime],
    }))
  }

  return (
    <OratorioPlanningForm
      canEdit={canEditPlanning}
      oratorioId={oratorioId}
      planning={planning}
    >
      {({ renderField }) => (
        <>
          {!presentedSchedule ? (
            <div className="space-y-4">
              <p
                className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground"
                role="status"
              >
                A programação desta ocorrência não pôde ser identificada.
                Atualize a página e, se o problema continuar, procure a
                coordenação.
              </p>
              <div className="grid gap-4 lg:grid-cols-2">
                {renderField('lancheDescription')}
                {renderField('gincanaDescription')}
                {renderField('boaTardeCriancasPlan')}
                {renderField('boaTardeJovensPlan')}
              </div>
            </div>
          ) : (
            <ol className="overflow-hidden rounded-xl border">
              {presentedSchedule.map((item) => {
                const isOpen = Boolean(openItems[item.startTime])
                const triggerId = `oratorio-schedule-trigger-${item.startTime.replace(':', '-')}`
                const panelId = `oratorio-schedule-panel-${item.startTime.replace(':', '-')}`

                return (
                  <li className="border-b last:border-b-0" key={item.startTime}>
                    <button
                      aria-controls={panelId}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none sm:px-5"
                      id={triggerId}
                      onClick={() => toggleItem(item.startTime)}
                      type="button"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-primary">
                          {item.startTime}
                          {item.endTime ? `–${item.endTime}` : ''}
                        </span>
                        <span className="mt-1 block font-medium">
                          {item.activity}
                        </span>
                      </span>
                      <ChevronDown
                        aria-hidden="true"
                        className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isOpen && (
                      <div
                        aria-labelledby={triggerId}
                        className="border-t bg-muted/10 px-4 pb-4 pt-4 sm:px-5"
                        id={panelId}
                        role="region"
                      >
                        {renderScheduleContent(
                          item.startTime,
                          renderField,
                          canManageTeams,
                          canReadRoster,
                          getTeam,
                          oratorioId,
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
          )}
        </>
      )}
    </OratorioPlanningForm>
  )
}

function renderScheduleContent(
  startTime: string,
  renderField: (name: OratorioPlanningFieldName) => ReactNode,
  canManageTeams: boolean,
  canReadRoster: boolean,
  getTeam: (teamType: OratorioTeamType) => OratorioTeam | undefined,
  oratorioId: string,
) {
  if (startTime === '14:00') {
    return (
      <p className="text-sm text-muted-foreground">
        Esta etapa não possui planejamento ou equipe específica.
      </p>
    )
  }

  if (startTime === '15:30') {
    return (
      <div className="space-y-4">
        {renderField('gincanaDescription')}
        <OratorioTeamAssignment
          canManage={canManageTeams}
          canReadRoster={canReadRoster}
          oratorioId={oratorioId}
          team={getTeam(TEAM_TYPES.gincana)}
          teamType={TEAM_TYPES.gincana}
        />
      </div>
    )
  }

  if (startTime === '16:30') {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          {renderField('boaTardeCriancasPlan')}
          <OratorioTeamAssignment
            canManage={canManageTeams}
            canReadRoster={canReadRoster}
            oratorioId={oratorioId}
            team={getTeam(TEAM_TYPES.boaTardeCriancas)}
            teamType={TEAM_TYPES.boaTardeCriancas}
          />
        </div>
        <div className="space-y-4">
          {renderField('boaTardeJovensPlan')}
          <OratorioTeamAssignment
            canManage={canManageTeams}
            canReadRoster={canReadRoster}
            oratorioId={oratorioId}
            team={getTeam(TEAM_TYPES.boaTardeJovens)}
            teamType={TEAM_TYPES.boaTardeJovens}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {renderField('lancheDescription')}
      <OratorioTeamAssignment
        canManage={canManageTeams}
        canReadRoster={canReadRoster}
        oratorioId={oratorioId}
        team={getTeam(TEAM_TYPES.lanche)}
        teamType={TEAM_TYPES.lanche}
      />
    </div>
  )
}
