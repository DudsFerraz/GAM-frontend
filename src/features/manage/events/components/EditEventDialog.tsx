import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { PermissionResponse } from "@/features/account";
import { useLocationOptions, type Location } from "@/features/manage/locations";
import { getErrorMessage } from "@/lib/http";

import type { Event } from "../api/events";
import {
  mapEventEditFormToReplacement,
  mapEventToEditForm,
} from "../eventMappings";
import { useReplaceEvent } from "../hooks/useEvents";
import { getEventAudienceLabel } from "../presentation";
import {
  createEventEditSchema,
  type EventEditFormValues,
} from "../schemas/eventSchema";

type EditEventDialogProps = {
  audiencePermissions: PermissionResponse[];
  audiencePermissionsError: boolean;
  audiencePermissionsLoading: boolean;
  event: Event;
  eventId: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function EditEventDialog({
  audiencePermissions,
  audiencePermissionsError,
  audiencePermissionsLoading,
  event,
  eventId,
  onOpenChange,
  open,
}: EditEventDialogProps) {
  const currentAudienceId = event.requiredPermission?.id ?? "";
  const schema = useMemo(
    () => createEventEditSchema(currentAudienceId),
    [currentAudienceId],
  );
  const form = useForm<EventEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: mapEventToEditForm(event),
  });
  const locationsQuery = useLocationOptions();
  const mutation = useReplaceEvent();

  const locationOptions = useMemo(() => {
    const locations = locationsQuery.data?.items ?? [];
    const currentLocation = event.gamLocation;

    if (
      currentLocation &&
      !locations.some((location) => location.id === currentLocation.id)
    ) {
      return [currentLocation, ...locations];
    }

    return locations;
  }, [event.gamLocation, locationsQuery.data?.items]);

  const audienceOptions = useMemo(() => {
    const options: Array<Pick<PermissionResponse, "id" | "code">> =
      audiencePermissions.map(({ id, code }) => ({ id, code }));
    const currentAudience = event.requiredPermission;

    if (
      currentAudience?.id &&
      !options.some((permission) => permission.id === currentAudience.id)
    ) {
      options.unshift({
        id: currentAudience.id,
        code: currentAudience.code ?? "",
      });
    }

    return options;
  }, [audiencePermissions, event.requiredPermission]);

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen) {
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const submit = (values: EventEditFormValues) => {
    mutation.mutate(
      {
        eventId,
        payload: mapEventEditFormToReplacement(values),
      },
      { onSuccess: () => changeOpen(false) },
    );
  };

  return (
    <Dialog onOpenChange={changeOpen} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar evento</DialogTitle>
          <DialogDescription>
            Substitua os dados do evento genérico e confirme as alterações.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input maxLength={255} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea maxLength={10000} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl>
                      <Select disabled={locationsQuery.isLoading} {...field}>
                        <option value="">Selecione</option>
                        {locationOptions.map((location: Location) => (
                          <option key={location.id} value={location.id}>
                            {location.name} — {location.city}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requiredPermissionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Público do evento</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="">Público geral</option>
                        {audiencePermissionsLoading && (
                          <option disabled>
                            Carregando públicos restritos...
                          </option>
                        )}
                        {audienceOptions.map((permission) => (
                          <option key={permission.id} value={permission.id}>
                            {getEventAudienceLabel(permission.code)}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Alterar o público exige um motivo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="beginDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Término</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Motivo da alteração</FormLabel>
                    <FormControl>
                      <Textarea
                        maxLength={2000}
                        placeholder="Obrigatório quando o público for alterado"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {locationsQuery.isError && (
              <Alert variant="destructive">
                <AlertTitle>Não foi possível carregar os locais.</AlertTitle>
                <AlertDescription>
                  {getErrorMessage(locationsQuery.error)}
                </AlertDescription>
              </Alert>
            )}
            {audiencePermissionsError && (
              <Alert>
                <AlertTitle>
                  Os públicos restritos não estão disponíveis.
                </AlertTitle>
                <AlertDescription>
                  O público atual e a opção de público geral continuam
                  disponíveis.
                </AlertDescription>
              </Alert>
            )}
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>Não foi possível editar o evento.</AlertTitle>
                <AlertDescription>
                  {getErrorMessage(mutation.error)}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                onClick={() => changeOpen(false)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button disabled={mutation.isPending} type="submit">
                {mutation.isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
