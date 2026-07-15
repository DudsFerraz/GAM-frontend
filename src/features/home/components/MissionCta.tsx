import { Link } from '@tanstack/react-router'
import { ArrowRight, HeartHandshake } from 'lucide-react'

export function MissionCta() {
  return (
    <section className="px-5 py-20 text-center sm:px-8 sm:py-28">
      <HeartHandshake className="mx-auto h-9 w-9 text-[#c28b1c]" aria-hidden="true" />
      <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">O software existe para cuidar melhor da missão.</h2>
      <p className="mx-auto mt-5 max-w-xl leading-8 text-[#526579]">Organizar informações e responsabilidades ajuda os voluntários a dedicarem mais tempo às pessoas e comunidades.</p>
      <Link to="/auth/register" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#17324d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#244b6b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17324d]">Fazer parte <ArrowRight className="h-4 w-4" /></Link>
    </section>
  )
}
