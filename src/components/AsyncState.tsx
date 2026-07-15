import type { ReactNode } from "react";
import { AlertCircle, Ban, Inbox, Loader2, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type AsyncStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  children?: ReactNode;
};

const stateStyles =
  "flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 text-center";

export function LoadingState({
  title = "Carregando...",
  description = "Aguarde um momento.",
  className,
}: AsyncStateProps) {
  return (
    <div
      className={cn(stateStyles, className)}
      role="status"
      aria-live="polite"
    >
      <Loader2
        className="h-8 w-8 animate-spin text-primary"
        aria-hidden="true"
      />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function ErrorState({
  title = "Não foi possível carregar os dados.",
  description = "Verifique sua conexão e tente novamente.",
  onRetry,
  retryLabel = "Tentar novamente",
  className,
}: AsyncStateProps) {
  return (
    <div
      className={cn(
        stateStyles,
        "border-destructive/30 bg-destructive/5",
        className,
      )}
      role="alert"
    >
      <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title = "Nenhum resultado encontrado.",
  description = "Tente ajustar os filtros para encontrar o que procura.",
  className,
}: AsyncStateProps) {
  return (
    <div className={cn(stateStyles, className)}>
      <Inbox className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function ForbiddenState({
  title = "Acesso não autorizado.",
  description = "Você não tem permissão para visualizar este conteúdo.",
  className,
}: AsyncStateProps) {
  return (
    <div className={cn(stateStyles, className)} role="alert">
      <Ban className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
