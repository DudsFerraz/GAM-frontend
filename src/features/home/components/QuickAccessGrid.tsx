import { Link } from '@tanstack/react-router'
import { ArrowUpRight, CalendarDays, FileClock, MapPin, ShieldCheck, UserRound, Users, type LucideIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

type QuickAccessGridProps = {
  canSeeEvents: boolean
  canManageMembers: boolean
  canManageAccounts: boolean
}

type QuickAccessItem = {
  title: string
  description: string
  to: '/manage/solicitations' | '/manage/events' | '/manage/members' | '/manage/locations' | '/manage/accounts' | '/profile'
  icon: LucideIcon
  tone: string
}

export function QuickAccessGrid({ canSeeEvents, canManageMembers, canManageAccounts }: QuickAccessGridProps) {
  const items: QuickAccessItem[] = [
    {
      title: 'Solicitações',
      description: 'Acompanhe seu histórico e novas solicitações.',
      to: '/manage/solicitations',
      icon: FileClock,
      tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
    },
    ...(canSeeEvents
      ? [{
          title: 'Eventos',
          description: 'Consulte a programação e os detalhes das atividades.',
          to: '/manage/events' as const,
          icon: CalendarDays,
          tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
        }]
      : []),
    ...(canManageMembers
      ? [{
          title: 'Membros',
          description: 'Encontre pessoas e acompanhe os cadastros do grupo.',
          to: '/manage/members' as const,
          icon: Users,
          tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
        }]
      : []),
    ...(canManageAccounts
      ? [{
          title: 'Contas e acessos',
          description: 'Consulte contas e acompanhe os acessos da plataforma.',
          to: '/manage/accounts' as const,
          icon: ShieldCheck,
          tone: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300',
        }]
      : []),
    {
      title: 'Locais',
      description: 'Veja os espaços usados na programação do GAM.',
      to: '/manage/locations',
      icon: MapPin,
      tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-300',
    },
    {
      title: 'Meu perfil',
      description: 'Confira seus dados e tipos de acesso.',
      to: '/profile',
      icon: UserRound,
      tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
    },
  ]

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Continue de onde parou</p>
          <h2 className="mt-1 font-heading text-xl font-bold tracking-tight">Acesso rápido</h2>
        </div>
        <ShieldCheck className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map(({ title, description, to, icon: Icon, tone }) => (
          <Link
            className="group rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            key={title}
            to={to}
          >
            <Card className="gap-0 border-0 bg-transparent p-0 shadow-none">
              <CardHeader className="flex flex-row items-start justify-between gap-3 p-0">
                <div className={`rounded-xl p-2.5 ${tone}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <CardTitle className="text-base">{title}</CardTitle>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
