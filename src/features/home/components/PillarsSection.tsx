import type { Pillar } from "../pages/HomePage";

export function PillarsSection({ pillars }: { pillars: Pillar[] }) {
  return (
    <section className="bg-[#17324d] px-5 py-20 text-white sm:px-8 sm:py-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#f4c95d]">
            O que nos move
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-5xl">
            Presença que vira caminho.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className=" rounded-2xl border border-white/10 bg-white/[.07] p-6 
              sm:p-8 transition-all duration-300 ease-out hover:-translate-y-1 
              hover:scale-[1.02] hover:bg-white/10 hover:shadow-lg "
            >
              <Icon className="h-7 w-7 text-[#f4c95d]" aria-hidden="true" />
              <h3 className="mt-7 text-xl font-bold">{title}</h3>
              <p className="mt-3 leading-7 text-white/70">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
