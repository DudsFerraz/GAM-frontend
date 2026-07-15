import { Link } from '@tanstack/react-router'

import gamLogo from '@/assets/logos/gam_logo.png'

export function HomeHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <a href="#inicio" className="flex items-center gap-3" aria-label="GAM Piracicaba - início">
          <img src={gamLogo} alt="GAM" className="h-11 w-20 object-cover object-center" />
          <span className="hidden text-sm font-semibold tracking-[0.18em] text-white sm:block">
            GAM PIRACICABA
          </span>
        </a>
        <nav className="flex items-center gap-3 text-sm font-semibold" aria-label="Navegação principal">
          <a className="hidden text-white/85 transition hover:text-white sm:block" href="#sobre">
            Sobre o GAM
          </a>
          <Link
            to="/auth/login"
            className="rounded-full border border-white/40 px-4 py-2 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  )
}
