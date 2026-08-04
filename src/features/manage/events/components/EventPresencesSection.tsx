import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Pencil,
  Trash2,
  UserPlus,
  UserRound,
} from "lucide-react";
import { useState } from "react";

import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from "@/components/AsyncState";
import { Pagination } from "@/components/Pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardActionArea, CardContent } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/format";
import { isForbiddenError } from "@/lib/http";

import type { Event, Presence } from "../api/events";
import { useEventPresences } from "../hooks/useEvents";
import {
  canChangePresence,
  getPresenceRegistrationAvailability,
} from "../presenceManagement";
import { EditPresenceDialog } from "./EditPresenceDialog";
import { RegisterPresenceDialog } from "./RegisterPresenceDialog";
import { RemovePresenceDialog } from "./RemovePresenceDialog";

type EventPresencesSectionProps = {
  canEditPresences: boolean;
  canRegisterPresences: boolean;
  canRemovePresences: boolean;
  canSearchMembers: boolean;
  canViewInactiveMembers: boolean;
  canViewPresences: boolean;
  event: Event;
  eventId: string;
};

type PresenceDialogState = {
  action: "edit" | "remove";
  presence: Presence;
} | null;

export function EventPresencesSection({
  canEditPresences,
  canRegisterPresences,
  canRemovePresences,
  canSearchMembers,
  canViewInactiveMembers,
  canViewPresences,
  event,
  eventId,
}: EventPresencesSectionProps) {
  const [page, setPage] = useState(0);
  const [isRegisterPresenceOpen, setIsRegisterPresenceOpen] = useState(false);
  const [presenceDialog, setPresenceDialog] =
    useState<PresenceDialogState>(null);
  const [presenceFeedback, setPresenceFeedback] = useState<string | null>(null);
  const presencesQuery = useEventPresences(eventId, page, canViewPresences);
  const registrationAvailability = getPresenceRegistrationAvailability(event);
  const presenceChangesAvailable = canChangePresence(event);
  const presenceItems = canViewPresences
    ? (presencesQuery.data?.items ?? [])
    : [];

  return (
    <>
      <section
        aria-labelledby="event-presences-title"
        className="space-y-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              className="font-heading text-xl font-bold"
              id="event-presences-title"
            >
              Presenças
            </h2>
            <p className="text-sm text-muted-foreground">
              Pessoas com presença registrada neste evento.
            </p>
          </div>
          {canRegisterPresences && (
            <Button
              disabled={registrationAvailability.state !== "available"}
              onClick={() => {
                setPresenceFeedback(null);
                setIsRegisterPresenceOpen(true);
              }}
              type="button"
            >
              <UserPlus aria-hidden="true" className="h-4 w-4" />
              Registrar presença
            </Button>
          )}
        </div>
        {canRegisterPresences &&
          registrationAvailability.state !== "available" && (
            <p className="text-sm text-muted-foreground">
              {registrationAvailability.message}
            </p>
          )}
        {presenceFeedback && (
          <Alert>
            <AlertTitle>Presenças atualizadas</AlertTitle>
            <AlertDescription>{presenceFeedback}</AlertDescription>
          </Alert>
        )}
        {!canViewPresences && (
          <ForbiddenState description="Sua conta não tem acesso à lista de presenças deste evento." />
        )}
        {!canViewPresences && (canEditPresences || canRemovePresences) && (
          <Alert>
            <AlertTitle>A seleção de presenças não está disponível.</AlertTitle>
            <AlertDescription>
              Esta conta possui uma ação de correção, mas não pode consultar a
              lista necessária para selecionar um registro com segurança. Nenhum
              identificador técnico será solicitado.
            </AlertDescription>
          </Alert>
        )}
        {canViewPresences && presencesQuery.isLoading && (
          <LoadingState title="Carregando presenças…" />
        )}
        {canViewPresences &&
          presencesQuery.isError &&
          (isForbiddenError(presencesQuery.error) ? (
            <ForbiddenState />
          ) : (
            <ErrorState onRetry={() => void presencesQuery.refetch()} />
          ))}
        {canViewPresences &&
          !presencesQuery.isLoading &&
          !presencesQuery.isError &&
          presenceItems.length === 0 && (
            <EmptyState title="Nenhuma presença registrada." />
          )}
        {canViewPresences && presenceItems.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {presenceItems.map((presence) => (
              <Card
                className="gap-3 py-4"
                interactive
                key={presence.id}
              >
                <CardActionArea asChild>
                  <Link
                    aria-label={`Ver membro ${[
                      presence.member.firstName,
                      presence.member.surname,
                    ].join(" ")}`}
                    params={{ memberId: presence.member.id }}
                    to="/manage/members/$memberId"
                  />
                </CardActionArea>
                <CardContent className="pointer-events-none relative z-[1] space-y-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <UserRound
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-primary"
                    />
                    <h3 className="truncate font-semibold">
                      {[
                        presence.member.firstName,
                        presence.member.surname,
                      ].join(" ")}
                    </h3>
                    <ChevronRight
                      aria-hidden="true"
                      className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Presença registrada em{" "}
                    {formatDateTime(presence.registeredAt)}
                  </p>
                  {presence.observations && (
                    <p className="whitespace-pre-wrap text-sm">
                      {presence.observations}
                    </p>
                  )}
                  {presenceChangesAvailable &&
                    (canEditPresences || canRemovePresences) && (
                      <div className="pointer-events-auto relative z-10 flex flex-wrap gap-2">
                        {canEditPresences && (
                          <Button
                            aria-label={`Editar observações da presença de ${presence.member.firstName}`}
                            onClick={() => {
                              setPresenceFeedback(null);
                              setPresenceDialog({ action: "edit", presence });
                            }}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <Pencil aria-hidden="true" className="h-4 w-4" />
                            Editar observações
                          </Button>
                        )}
                        {canRemovePresences && (
                          <Button
                            aria-label={`Remover presença de ${presence.member.firstName}`}
                            onClick={() => {
                              setPresenceFeedback(null);
                              setPresenceDialog({ action: "remove", presence });
                            }}
                            size="sm"
                            type="button"
                            variant="destructive"
                          >
                            <Trash2 aria-hidden="true" className="h-4 w-4" />
                            Remover
                          </Button>
                        )}
                      </div>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {canViewPresences && presencesQuery.data && (
          <Pagination
            disabled={presencesQuery.isFetching}
            itemLabel="presenças"
            onPageChange={setPage}
            page={presencesQuery.data.page ?? page}
            totalElements={
              presencesQuery.data.totalElements ?? presenceItems.length
            }
            totalPages={presencesQuery.data.totalPages ?? 0}
          />
        )}
      </section>

      {canRegisterPresences && isRegisterPresenceOpen && (
        <RegisterPresenceDialog
          canSearchMembers={canSearchMembers}
          canViewInactiveMembers={canViewInactiveMembers}
          eventId={eventId}
          onOpenChange={setIsRegisterPresenceOpen}
          onRegistered={() => {
            setPresenceFeedback("A presença foi registrada com sucesso.");
          }}
          open
        />
      )}
      {canViewPresences &&
        canEditPresences &&
        presenceDialog?.action === "edit" && (
          <EditPresenceDialog
            eventId={eventId}
            onOpenChange={(open) => {
              if (!open) setPresenceDialog(null);
            }}
            onUpdated={() => {
              setPresenceFeedback(
                "As observações da presença foram atualizadas.",
              );
            }}
            open
            presence={presenceDialog.presence}
          />
        )}
      {canViewPresences &&
        canRemovePresences &&
        presenceDialog?.action === "remove" && (
          <RemovePresenceDialog
            eventId={eventId}
            onOpenChange={(open) => {
              if (!open) setPresenceDialog(null);
            }}
            onRemoved={() => {
              setPresenceFeedback("A presença foi removida do evento.");
            }}
            open
            presence={presenceDialog.presence}
          />
        )}
    </>
  );
}
