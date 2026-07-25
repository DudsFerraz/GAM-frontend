import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Pencil,
  ShieldCheck,
  Trash2,
  UserPlus,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from "@/components/AsyncState";
import { Pagination } from "@/components/Pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  useAccountInfo,
  useAccountPermissionRecords,
  useAccountPermissions,
} from "@/features/account";
import { formatDateTime } from "@/lib/format";
import { isForbiddenError } from "@/lib/http";

import type { Presence } from "../api/events";
import { EditPresenceDialog } from "../components/EditPresenceDialog";
import { EventManagementActions } from "../components/EventManagementActions";
import { RegisterPresenceDialog } from "../components/RegisterPresenceDialog";
import { RemovePresenceDialog } from "../components/RemovePresenceDialog";
import { useEvent, useEventPresences } from "../hooks/useEvents";
import { canChangePresence, canRegisterPresence } from "../presenceManagement";
import {
  getEventAudienceLabel,
  getEventStatusLabel,
  getEventTypeLabel,
} from "../presentation";

type PresenceDialogState = {
  action: "edit" | "remove";
  presence: Presence;
} | null;

export function EventDetailPage({ eventId }: { eventId: string }) {
  const [page, setPage] = useState(0);
  const [isRegisterPresenceOpen, setIsRegisterPresenceOpen] = useState(false);
  const [presenceDialog, setPresenceDialog] =
    useState<PresenceDialogState>(null);
  const [presenceFeedback, setPresenceFeedback] = useState<string | null>(null);
  const [presenceEvaluationInstant, setPresenceEvaluationInstant] = useState(
    () => new Date(),
  );
  const navigate = useNavigate();
  const { account } = useAccountInfo();
  const { permissions } = useAccountPermissions(account);
  const canViewPresences = permissions.includes("EVENT_GET_PRESENCES");
  const canManage = permissions.includes("EVENT_MANAGE");
  const canSearchMembers = permissions.includes("MEMBER_SEARCH");
  const canViewInactiveMembers = permissions.includes("MEMBER_GET_NON_ACTIVE");
  const canRegisterPresences = permissions.includes("PRESENCE_REGISTER");
  const canEditPresences = permissions.includes("PRESENCE_EDIT");
  const canRemovePresences = permissions.includes("PRESENCE_REMOVE");
  const {
    isError: audiencePermissionsError,
    isLoading: audiencePermissionsLoading,
    permissionRecords,
  } = useAccountPermissionRecords(account, canManage);
  const eventQuery = useEvent(eventId);
  const presencesQuery = useEventPresences(eventId, page, canViewPresences);

  useEffect(() => {
    if (!canRegisterPresences || eventQuery.data?.status !== "SCHEDULED") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setPresenceEvaluationInstant(new Date());
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, [canRegisterPresences, eventQuery.data?.status]);

  if (eventQuery.isLoading)
    return <LoadingState title="Carregando evento..." />;
  if (eventQuery.isError)
    return isForbiddenError(eventQuery.error) ? (
      <ForbiddenState description="Este evento exige uma permissão de público que sua conta não possui." />
    ) : (
      <ErrorState onRetry={() => void eventQuery.refetch()} />
    );
  if (!eventQuery.data) return <EmptyState title="Evento não encontrado." />;
  const event = eventQuery.data;
  const presenceItems = presencesQuery.data?.items ?? [];
  const registrationAvailable = canRegisterPresence(
    event,
    presenceEvaluationInstant,
  );
  const presenceChangesAvailable = canChangePresence(event);
  const audiencePermissions = permissionRecords.filter(
    (permission) =>
      permission.code === "EVENT_GET_MEMBER" ||
      permission.code === "EVENT_GET_COORD",
  );

  return (
    <div className="space-y-6 py-2 sm:py-4">
      <Button asChild size="sm" variant="ghost">
        <Link to="/manage/events">
          <ArrowLeft className="h-4 w-4" />
          Voltar para eventos
        </Link>
      </Button>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Evento</p>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {event.title ?? "Evento sem título"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {event.description || "Sem descrição."}
          </p>
        </div>
        {event.status && (
          <Badge
            variant={event.status === "CANCELLED" ? "destructive" : "secondary"}
          >
            {getEventStatusLabel(event.status)}
          </Badge>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Início
              </dt>
              <dd className="mt-1 font-medium">
                {formatDateTime(event.beginDate)}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Término
              </dt>
              <dd className="mt-1 font-medium">
                {formatDateTime(event.endDate)}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Local
              </dt>
              <dd className="mt-1 font-medium">
                {event.gamLocation?.name ?? "Não informado"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tipo</dt>
              <dd className="mt-1 font-medium">
                {getEventTypeLabel(event.type)}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                Público
              </dt>
              <dd className="mt-1 font-medium">
                {getEventAudienceLabel(event.requiredPermission?.code)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      {canManage && event.type === "GENERIC" && (
        <EventManagementActions
          audiencePermissions={audiencePermissions}
          audiencePermissionsError={audiencePermissionsError}
          audiencePermissionsLoading={audiencePermissionsLoading}
          event={event}
          eventId={eventId}
          onRemoved={() => {
            void navigate({ to: "/manage/events" });
          }}
        />
      )}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold">Presenças</h2>
            <p className="text-sm text-muted-foreground">
              Pessoas com presença registrada neste evento.
            </p>
          </div>
          {canRegisterPresences && (
            <Button
              disabled={!registrationAvailable}
              onClick={() => {
                setPresenceFeedback(null);
                setIsRegisterPresenceOpen(true);
              }}
            >
              <UserPlus className="h-4 w-4" />
              Registrar presença
            </Button>
          )}
        </div>
        {canRegisterPresences && !registrationAvailable && (
          <p className="text-sm text-muted-foreground">
            O registro ficará disponível quando a janela de presença deste
            evento estiver aberta.
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
        {presencesQuery.isLoading && (
          <LoadingState title="Carregando presenças..." />
        )}
        {presencesQuery.isError &&
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
        {presenceItems.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {presenceItems.map((presence) => (
              <Card className="gap-3 py-4" key={presence.id}>
                <CardContent className="space-y-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <UserRound className="h-4 w-4 shrink-0 text-primary" />
                    <h3 className="truncate font-semibold">
                      {[
                        presence.member.firstName,
                        presence.member.surname,
                      ].join(" ")}
                    </h3>
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
                  <Button asChild size="sm" variant="link">
                    <Link
                      params={{ memberId: presence.member.id }}
                      to="/manage/members/$memberId"
                    >
                      Ver membro
                    </Link>
                  </Button>
                  {presenceChangesAvailable &&
                    (canEditPresences || canRemovePresences) && (
                      <div className="flex flex-wrap gap-2">
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
                            <Pencil className="h-4 w-4" />
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
                            <Trash2 className="h-4 w-4" />
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
        {presencesQuery.data && (
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

      {isRegisterPresenceOpen && (
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
      {presenceDialog?.action === "edit" && (
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
      {presenceDialog?.action === "remove" && (
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
    </div>
  );
}
