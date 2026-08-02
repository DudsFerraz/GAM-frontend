import { Card, CardContent } from '@/components/ui/Card'

import type {
  OratorioTeam,
  OratorioTeamType,
} from '../api/oratorios'
import { ORATORIO_TEAM_LABELS } from '../presentation'
import { OratorioTeamAssignment } from './OratorioTeamAssignment'

const TEAM_TYPES = Object.keys(
  ORATORIO_TEAM_LABELS,
) as OratorioTeamType[]

type OratorioTeamsSectionProps = {
  canManage: boolean
  canReadRoster: boolean
  oratorioId: string
  teams?: OratorioTeam[] | null
}

export function OratorioTeamsSection({
  canManage,
  canReadRoster,
  oratorioId,
  teams,
}: OratorioTeamsSectionProps) {
  return (
    <section aria-labelledby="oratorio-teams-title" className="space-y-4">
      <div>
        <h2
          className="font-heading text-xl font-bold"
          id="oratorio-teams-title"
        >
          Equipes
        </h2>
        <p className="text-sm text-muted-foreground">
          As quatro equipes são fixas; atribua os membros responsáveis por
          esta data.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {TEAM_TYPES.map((teamType) => (
          <Card className="gap-4" key={teamType}>
            <CardContent>
              <OratorioTeamAssignment
                canManage={canManage}
                canReadRoster={canReadRoster}
                oratorioId={oratorioId}
                team={teams?.find((item) => item.type === teamType)}
                teamType={teamType}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
