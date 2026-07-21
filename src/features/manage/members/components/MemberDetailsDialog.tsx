import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/http";

import {
  getMemberStatusBadgeClassName,
  getMemberStatusLabel,
} from "../presentation";
import { useUpdateMemberStatus } from "../hooks/useUpdateMemberStatus";
import type { MemberListItem } from "../types";

const memberStatusSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Informe o motivo da alteração.")
    .max(2000, "O motivo deve ter no máximo 2.000 caracteres."),
});

type MemberStatusFormValues = z.infer<typeof memberStatusSchema>;

type MemberDetailsDialogProps = {
  member: MemberListItem | null;
  canManageMemberTransitions: boolean;
  onClose: () => void;
};

export function MemberDetailsDialog({
  member,
  canManageMemberTransitions,
  onClose,
}: MemberDetailsDialogProps) {
  const [isStatusFormOpen, setIsStatusFormOpen] = useState(false);
  const statusForm = useForm<MemberStatusFormValues>({
    resolver: zodResolver(memberStatusSchema),
    defaultValues: { reason: "" },
  });
  const updateStatus = useUpdateMemberStatus();

  if (!member) {
    return null;
  }

  const nextStatus = member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  const actionLabel = nextStatus === "ACTIVE" ? "Reativar" : "Desativar";

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsStatusFormOpen(false);
      statusForm.reset();
      updateStatus.reset();
      onClose();
    }
  };

  const handleSubmit = (values: MemberStatusFormValues) => {
    updateStatus.mutate(
      { memberId: member.id, status: nextStatus, reason: values.reason },
      {
        onSuccess: () => {
          statusForm.reset();
          setIsStatusFormOpen(false);
          onClose();
        },
      },
    );
  };

  const fullName = [member.firstName, member.surname].filter(Boolean).join(" ");

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{fullName}</DialogTitle>
          <DialogDescription>
            Informações do membro e ações de ciclo de vida disponíveis.
          </DialogDescription>
        </DialogHeader>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Nome de exibição</dt>
            <dd className="font-medium">{member.displayName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Situação</dt>
            <dd className="mt-1">
              <Badge
                className={getMemberStatusBadgeClassName(member.status)}
                variant={
                  member.status === "INACTIVE" ? "destructive" : "secondary"
                }
              >
                {getMemberStatusLabel(member.status)}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">E-mail</dt>
            <dd className="font-medium">{member.email ?? "Não informado"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Telefone</dt>
            <dd className="font-medium">
              {member.phoneNumber ?? "Não informado"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Nascimento</dt>
            <dd className="font-medium">{formatDate(member.birthDate)}</dd>
          </div>
        </dl>

        {canManageMemberTransitions && member.status && (
          <section
            className="space-y-4 border-t pt-4"
            aria-labelledby="member-status-transition-title"
          >
            <div>
              <h3 id="member-status-transition-title" className="font-semibold">
                Situação do membro
              </h3>
              <p className="text-sm text-muted-foreground">
                Atualize a situação do membro com uma justificativa.
              </p>
            </div>

            {!isStatusFormOpen && (
              <Button
                onClick={() => {
                  statusForm.reset();
                  updateStatus.reset();
                  setIsStatusFormOpen(true);
                }}
                type="button"
                variant={nextStatus === "INACTIVE" ? "destructive" : "default"}
              >
                {actionLabel}
              </Button>
            )}

            {isStatusFormOpen && (
              <Form {...statusForm}>
                <form
                  className="space-y-4"
                  onSubmit={statusForm.handleSubmit(handleSubmit)}
                >
                  <FormField
                    control={statusForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Motivo para {actionLabel.toLowerCase()}
                        </FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="off"
                            placeholder="Descreva o motivo da alteração"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {updateStatus.isError && (
                    <Alert variant="destructive">
                      <AlertTitle>
                        Não foi possível alterar a situação.
                      </AlertTitle>
                      <AlertDescription>
                        {getErrorMessage(updateStatus.error)}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        statusForm.reset();
                        updateStatus.reset();
                        setIsStatusFormOpen(false);
                      }}
                      type="button"
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                    <Button disabled={updateStatus.isPending} type="submit">
                      {updateStatus.isPending
                        ? "Salvando..."
                        : nextStatus === "INACTIVE"
                          ? "Confirmar desativação"
                          : "Confirmar reativação"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </section>
        )}

        {(!canManageMemberTransitions ||
          !member.status ||
          !isStatusFormOpen) && (
          <DialogFooter>
            <Button onClick={() => handleOpenChange(false)} type="button">
              Fechar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
