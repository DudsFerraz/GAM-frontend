import { ArrowRight } from 'lucide-react'

import gamImage from '@/assets/images/gam.jpg'

export function HeroSection() {
  return (
    <section id="inicio" className="relative isolate flex min-h-[690px] items-end overflow-hidden bg-[#17324d] sm:min-h-[760px]">
      <img src={gamImage} alt="Jovens do GAM reunidos" className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_35%]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(12,39,61,.94)_0%,rgba(12,39,61,.7)_46%,rgba(12,39,61,.18)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(12,39,61,.8)_0%,transparent_55%)]" />

      <div className="mx-auto w-full max-w-7xl px-5 pb-20 pt-36 sm:px-8 sm:pb-28 lg:px-10">
        <div className="max-w-2xl text-white">
          <p className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-[#f4c95d]">
            <span className="h-px w-8 bg-[#f4c95d]" /> Grupo de Animação Missionária
          </p>
          <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            Jovens que vivem a missão com alegria.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/80 sm:text-lg">
            O GAM Piracicaba é uma comunidade juvenil salesiana dedicada a evangelizar, educar, servir e construir vínculos.
          </p>
          <a href="#sobre" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#f4c95d] px-5 py-3 text-sm font-bold text-[#17324d] transition hover:bg-[#ffdc7d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            Conheça nossa história <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
