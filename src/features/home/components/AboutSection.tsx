import oratorioImage from '@/assets/images/criancas_oratorio.jpeg'
import dbJovensImage from '@/assets/images/db_jovens.jpg'

export function AboutSection() {
  return (
    <section id="sobre" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20">
        <div className="relative pl-5 sm:pl-10">
          <div className="absolute left-0 top-6 h-48 w-1 rounded-full bg-[#e8b94e] sm:h-60" />
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#c28b1c]">Nossa identidade</p>
          <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">Uma juventude que escolhe permanecer.</h2>
          <p className="mt-6 text-base leading-8 text-[#526579]">Nascido entre ex-alunos e lideranças pastorais dos colégios Dom Bosco, o GAM é um jeito de continuar a caminhada salesiana para além da escola — com responsabilidade, amizade, fé e missão.</p>
          <p className="mt-4 text-base leading-8 text-[#526579]">Desde 2004, o grupo se faz presente em Piracicaba e em outras comunidades, sempre próximo de quem precisa de cuidado, esperança e companhia.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <img src={oratorioImage} alt="Crianças durante uma atividade do oratório" className="h-56 w-full rounded-4xl object-cover shadow-lg sm:h-72" />
          <img src={dbJovensImage} alt="Jovens reunidos em atividade salesiana" className="mt-10 h-56 w-full rounded-4xl object-cover shadow-lg sm:h-72" />
        </div>
      </div>
    </section>
  )
}
