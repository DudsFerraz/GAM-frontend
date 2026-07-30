import { useState, useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { missionSlides } from '@/components/missionSlides'
import { PublicNavbar } from '@/components/PublicNavbar'

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === missionSlides.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
      <div className="relative flex min-h-screen w-full bg-background font-sans text-foreground">

      <PublicNavbar variant="surface" />

        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-900">
          
          {missionSlides.map((slide, index) => (
            <img
              key={index}
              src={slide.image}
              alt="Imagem de fundo"
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out",
                currentSlide === index ? "opacity-60" : "opacity-0"
              )}
            />
          ))}

          <div className="relative z-10 p-12 h-full flex flex-col justify-between text-white w-full">
            
            <div className="flex items-center gap-2 pt-6">
              <span className="text-4xl font-heading font-bold tracking-tight">Grupo de Animação Missionária</span>
            </div>

            <div className="mb-12">
              <div key={currentSlide} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h1 className="font-heading text-4xl font-bold tracking-tight mb-4 leading-tight">
                  {missionSlides[currentSlide].quotation}
                  </h1>
              </div>

              <div className="flex items-center justify-between mt-8">
                  
                  <div className="flex gap-2">
                      {missionSlides.map((_, index) => (
                      <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          currentSlide === index ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                          )}
                          aria-label={`Ir para imagem ${index + 1}`}
                      />
                      ))}
                  </div>
              </div>

            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 pb-8 pt-24 sm:p-8 sm:pt-28 md:p-12 md:pt-32">
          <div className="w-full max-w-md bg-card text-card-foreground shadow-md rounded-2xl border border-border p-8">
            {children}
          </div>
        </div>
      </div>
  );
};
