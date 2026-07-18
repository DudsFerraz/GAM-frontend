import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarDays, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import heroImage from '@/assets/images/db_jovens.jpg'

type DashboardHeroProps = {
  displayName: string
  canSeeEvents: boolean
}

function getFirstName(displayName: string): string {
  return displayName.trim().split(/\s+/)[0] || 'você'
}

export function DashboardHero({ displayName, canSeeEvents }: DashboardHeroProps) {
  return (
    <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#123b60] text-white shadow-sm">
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-screen"
        src={heroImage}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#092c4a] via-[#123b60]/95 to-[#146b91]/70" />
      <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10 bg-white/5 blur-2xl" />

      <div className="relative flex min-h-[18rem] flex-col justify-between gap-8 p-6 sm:p-8 lg:min-h-[20rem] lg:p-10">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Painel do GAM
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Olá, {getFirstName(displayName)}!
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50/85 sm:text-base">
            Acompanhe as atividades, encontre o que precisa e continue fazendo parte da nossa comunidade.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {canSeeEvents && (
            <Button asChild className="bg-white text-[#123b60] hover:bg-blue-50" size="lg">
              <Link to="/manage/events">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Ver programação
              </Link>
            </Button>
          )}
          <Button asChild className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white" size="lg" variant="outline">
            <Link to="/manage/solicitations">
              Minhas solicitações
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
