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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300">
      
      <div className="relative mx-4 w-full max-w-[400px] flex flex-col items-center justify-center space-y-6 overflow-hidden rounded-xl border border-border bg-card p-8 text-center shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

        <div className="flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
             <CheckCircle 
               className="h-10 w-10 text-primary" 
               strokeWidth={2.5} 
             />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-card-foreground">
            {title}
          </h2>
          
          <p className="text-[15px] text-muted-foreground leading-relaxed px-2">
            {description}
          </p>
        </div>

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