import { Link } from "@tanstack/react-router";

import gamLogo from "@/assets/logos/gam_logo.png";
import { ColorModeToggle } from "@/components/ColorModeToggle";
import { cn } from "@/lib/utils";

type PublicNavbarProps = {
  variant?: "hero" | "surface";
};

export function PublicNavbar({ variant = "hero" }: PublicNavbarProps) {
  const isHero = variant === "hero";

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-3"
          aria-label="GAM Piracicaba - início"
        >
          <img
            src={gamLogo}
            alt="GAM"
            className="h-11 w-20 object-contain object-center"
          />
          <span
            className={cn(
              "hidden text-sm font-semibold tracking-[0.18em] sm:block text-white",
            
            )}
          >
            GAM PIRACICABA
          </span>
        </Link>

        <nav
          className="flex items-center gap-2 text-sm font-semibold sm:gap-3"
          aria-label="Navegação pública"
        >
          {isHero && (
            <a
              className="hidden px-2 text-white/85 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:block"
              href="#sobre"
            >
              Sobre o GAM
            </a>
          )}
          {!isHero && (
            <Link
              to="/"
              className="hidden px-2 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:block"
            >
              Início
            </Link>
          )}
          <Link
            to="/auth/login"
            className={cn(
              "rounded-full border px-4 py-2 transition focus-visible:outline-none focus-visible:ring-2",
              isHero
                ? "border-white/40 text-white hover:bg-white/10 focus-visible:ring-white"
                : "border-border text-foreground hover:bg-accent focus-visible:ring-ring",
            )}
          >
            Entrar
          </Link>
          <Link
            to="/auth/register"
            className={cn(
              "hidden rounded-full px-4 py-2 transition focus-visible:outline-none focus-visible:ring-2 sm:block",
              isHero
                ? "bg-[#f4c95d] text-[#17324d] hover:bg-[#ffdc7d] focus-visible:ring-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring",
            )}
          >
            Registrar
          </Link>
          <ColorModeToggle
            className={
              isHero
                ? "border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                : undefined
            }
          />
        </nav>
      </div>
    </header>
  );
}
