import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from "@/components/AsyncState";
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

import { EventManagementActions } from "../components/EventManagementActions";
import { EventPresencesSection } from "../components/EventPresencesSection";
import { useEvent } from "../hooks/useEvents";
import {
  getEventAudienceLabel,
  getEventStatusLabel,
  getEventTypeLabel,
} from "../presentation";

export function EventDetailPage({ eventId }: { eventId: string }) {
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

  if (eventQuery.isLoading)
    return <LoadingState title="Carregando evento…" />;
  if (eventQuery.isError)
    return isForbiddenError(eventQuery.error) ? (
      <ForbiddenState description="Este evento exige uma permissão de público que sua conta não possui." />
    ) : (
      <ErrorState onRetry={() => void eventQuery.refetch()} />
    );
  if (!eventQuery.data) return <EmptyState title="Evento não encontrado." />;
  const event = eventQuery.data;
  const audiencePermissions = permissionRecords.filter(
    (permission) =>
      permission.code === "EVENT_GET_MEMBER" ||
      permission.code === "EVENT_GET_COORD",
  );

  return (
    <div className="space-y-6 py-2 sm:py-4">
      <Button asChild size="sm" variant="ghost">
        <Link to="/manage/events">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
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
                <CalendarDays aria-hidden="true" className="h-4 w-4" />
                Início
              </dt>
              <dd className="mt-1 font-medium">
                {formatDateTime(event.beginDate)}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays aria-hidden="true" className="h-4 w-4" />
                Término
              </dt>
              <dd className="mt-1 font-medium">
                {formatDateTime(event.endDate)}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-muted-foreground">
                <MapPin aria-hidden="true" className="h-4 w-4" />
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
                <ShieldCheck aria-hidden="true" className="h-4 w-4" />
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
      <EventPresencesSection
        canEditPresences={canEditPresences}
        canRegisterPresences={canRegisterPresences}
        canRemovePresences={canRemovePresences}
        canSearchMembers={canSearchMembers}
        canViewInactiveMembers={canViewInactiveMembers}
        canViewPresences={canViewPresences}
        event={event}
        eventId={eventId}
      />
    </div>
  );
}
