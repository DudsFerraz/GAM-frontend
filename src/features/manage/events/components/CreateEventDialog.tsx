import { zodResolver } from "@hookform/resolvers/zod";
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
import { useLocationOptions } from "@/features/manage/locations";
import { getErrorMessage } from "@/lib/http";

import { useCreateEvent } from "../hooks/useEvents";
import { eventSchema, type EventFormValues } from "../schemas/eventSchema";
import { mapEventFormToCreateEvent } from "../eventMappings";
import { getEventAudienceLabel } from "../presentation";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (eventId: string) => void;
  audiencePermissions: PermissionResponse[];
  audiencePermissionsError: boolean;
  audiencePermissionsLoading: boolean;
};

export function CreateEventDialog({
  open,
  onOpenChange,
  onCreated,
  audiencePermissions,
  audiencePermissionsError,
  audiencePermissionsLoading,
}: Props) {
  const mutation = useCreateEvent();
  const locationsQuery = useLocationOptions();
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      locationId: "",
      requiredPermissionId: "",
      beginDate: "",
      endDate: "",
    },
  });
  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo evento</DialogTitle>
          <DialogDescription>
            Defina a agenda, o local e o público do evento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) =>
              mutation.mutate(mapEventFormToCreateEvent(values), {
                onSuccess: (created) =>
                  created.id ? onCreated(created.id) : changeOpen(false),
              }),
            )}
          >
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
                        {locationsQuery.data?.items?.map((location) => (
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
                name="requiredPermissionId"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Público do evento</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="">Público geral</option>
                        {audiencePermissionsLoading && (
                          <option disabled>
                            Carregando públicos restritos...
                          </option>
                        )}
                        {audiencePermissions.map((permission) => (
                          <option key={permission.id} value={permission.id}>
                            {getEventAudienceLabel(permission.code)}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Eventos públicos não exigem uma capacidade de acesso
                      específica.
                    </FormDescription>
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
                  Você ainda pode criar este evento para o público geral.
                </AlertDescription>
              </Alert>
            )}
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>Não foi possível criar o evento.</AlertTitle>
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
                {mutation.isPending ? "Criando..." : "Criar evento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
