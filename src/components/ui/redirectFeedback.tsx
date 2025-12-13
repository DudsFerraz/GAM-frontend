// components/common/RedirectFeedback.tsx
import React from 'react';
import { Button } from "@/components/ui/button"; 
import { CheckCircle } from "lucide-react";
import { useRedirectFeedback } from '@/hooks/useRedirectFeedback';

interface RedirectFeedbackProps {
  isVisible: boolean;
  title: string;
  description: string;
  buttonText: string;
  redirectUrl: string;
  onAction?: () => void;
}

export const RedirectFeedback: React.FC<RedirectFeedbackProps> = ({
  isVisible,
  title,
  description,
  buttonText,
  redirectUrl,
  onAction
}) => {
  const { triggerRedirect } = useRedirectFeedback();

  if (!isVisible) return null;

  const handleClick = () => {
    if (onAction) onAction();
    triggerRedirect(redirectUrl);
  };

  return (
    // OVERLAY: Mantivemos o blur aqui para focar a atenção, mas escurecemos mais (bg-black/60)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300">
      
      {/* CARD: Fundo SÓLIDO (bg-white/bg-zinc-950) para garantir leitura perfeita */}
      <div className="relative mx-4 w-full max-w-[400px] flex flex-col items-center justify-center space-y-6 overflow-hidden rounded-xl border bg-white dark:bg-zinc-950 p-8 text-center shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Barra de acento superior */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-green-500 to-emerald-600" />

        {/* Ícone */}
        <div className="flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100/50 ring-8 ring-green-50 dark:bg-green-900/20 dark:ring-green-900/10">
             <CheckCircle 
               className="h-10 w-10 text-green-600 dark:text-green-500" 
               strokeWidth={2.5} 
             />
          </div>
        </div>

        {/* Textos com alto contraste */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
          
          <p className="text-[15px] text-zinc-600 dark:text-zinc-400 leading-relaxed px-2">
            {description}
          </p>
        </div>

        {/* Botão */}
        <div className="w-full pt-2">
          <Button 
            onClick={handleClick} 
            className="w-full font-semibold shadow-sm" 
            size="lg"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};