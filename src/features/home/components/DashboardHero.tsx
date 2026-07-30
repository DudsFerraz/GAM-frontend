import { ShieldCheck, Sparkles } from 'lucide-react'

import heroImage from '@/assets/images/db_jovens.jpg'

import { ResponsiveMissionCarousel } from './MissionCarousel'

type DashboardHeroProps = {
  displayName: string
  accessLabel: string
}

function getFirstName(displayName: string): string {
  return displayName.trim().split(/\s+/)[0]
}

export function DashboardHero({ accessLabel, displayName }: DashboardHeroProps) {
  return (
    <section className="relative isolate h-full min-h-[18rem] overflow-hidden rounded-[1.75rem] bg-[#123b60] text-white shadow-sm">
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-screen"
        src={heroImage}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#092c4a] via-[#123b60]/95 to-[#146b91]/70" />
      <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10 bg-white/5 blur-2xl" />

      <div className="relative h-full min-h-[18rem] p-6 sm:p-8 md:min-h-0 lg:p-10">
        <div className="md:max-w-[44%]">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Painel do GAM
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Olá, {getFirstName(displayName)}!
          </h1>
          <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-white/15 bg-[#092c4a]/35 px-4 py-3">
            <ShieldCheck className="h-5 w-5 text-cyan-100" aria-hidden="true" />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-blue-100/75">Seu acesso</p>
              <p className="mt-0.5 font-heading text-lg font-bold">{accessLabel}</p>
            </div>
          </div>
        </div>

        <ResponsiveMissionCarousel />
      </div>
    </section>
  )
}
