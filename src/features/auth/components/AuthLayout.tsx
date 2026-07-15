import { useState, useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import criancasImage from '@/assets/images/criancas_oratorio.jpeg'
import gamImage from '@/assets/images/gam.jpg'
import dbJovens from '@/assets/images/db_jovens.jpg'
import dbJovensMaria from '@/assets/images/db_jovens_maria.jpg'
import { PublicNavbar } from '@/components/PublicNavbar'

interface AuthLayoutProps {
  children: ReactNode;
}

const slides = [
  {
    image: gamImage,
    headline: "“Leva-me aonde os homens necessitem a Tua palavra”",
    subheadline: ""
  },
  {
    image: criancasImage,
    headline: "“Basta que sejam jovens para que eu os ame”",
    subheadline: ""
  },
  {
    image: dbJovens,
    headline: "“Deus nos colocou no mundo para os outros”",
    subheadline: ""
  },
  {
    image: dbJovensMaria,
    headline: "“Não é com pancadas, mas com a mansidão e a caridade que deverás ganhar esses teus amigos.”",
    subheadline: ""
  }
];

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
      <div className="min-h-screen w-full flex font-serif bg-background text-foreground relative">  

      <PublicNavbar variant="surface" />

        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-900">
          
          {slides.map((slide, index) => (
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
            
            <div className="flex items-center gap-2">
              <span className="text-4xl font-heading font-bold tracking-tight">Grupo de Animação Missionária</span>
            </div>

            <div className="mb-12">
              <div key={currentSlide} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h1 className="font-heading text-4xl font-bold tracking-tight mb-4 leading-tight">
                  {slides[currentSlide].headline}
                  </h1>
                  <p className="text-xl opacity-90">
                  {slides[currentSlide].subheadline}
                  </p>
              </div>

              <div className="flex items-center justify-between mt-8">
                  
                  <div className="flex gap-2">
                      {slides.map((_, index) => (
                      <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          currentSlide === index ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                          )}
                          aria-label={`Ir para slide ${index + 1}`}
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
