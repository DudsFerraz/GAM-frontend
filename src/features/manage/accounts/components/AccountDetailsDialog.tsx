import { Mail, Pencil, Shield, UserRound } from 'lucide-react'

import { EmptyState, ErrorState, LoadingState } from '@/components/AsyncState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { getRolePresentation } from '@/features/account'

import type { Account } from '../api/accounts'
import { useAccountRoles } from '../hooks/useAccountAdministration'

type AccountDetailsDialogProps = {
  account: Account | null
  canManageRoles: boolean
  onClose: () => void
  onEdit: (account: Account) => void
}

export function AccountDetailsDialog({
  account,
  canManageRoles,
  onClose,
  onEdit,
}: AccountDetailsDialogProps) {
  const rolesQuery = useAccountRoles(account?.id ?? null)
  const roles = rolesQuery.data?.roles ?? []

  if (!account) {
    return null
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Administrar conta</DialogTitle>
          <DialogDescription>
            Consulte os dados e os tipos de acesso associados a esta conta.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <UserRound aria-hidden="true" className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-semibold">
                {account.displayName ?? 'Conta sem nome'}
              </h3>
              <p className="mt-1 flex items-center gap-1 truncate text-sm text-muted-foreground">
                <Mail aria-hidden="true" className="h-3.5 w-3.5" />
                {account.email ?? 'E-mail não informado'}
              </p>
            </div>
          </div>
        </div>

        <section className="space-y-3" aria-labelledby="account-details-roles-title">
          <h3
            id="account-details-roles-title"
            className="flex items-center gap-2 font-semibold"
          >
            <Shield aria-hidden="true" className="h-4 w-4" />
            Tipos de acesso
          </h3>

          {rolesQuery.isLoading && <LoadingState className="min-h-32" />}
          {rolesQuery.isError && (
            <ErrorState
              className="min-h-32"
              onRetry={() => void rolesQuery.refetch()}
            />
          )}
          {!rolesQuery.isLoading && !rolesQuery.isError && roles.length === 0 && (
            <EmptyState
              className="min-h-32"
              title="Nenhum tipo de acesso disponível."
            />
          )}
          {!rolesQuery.isLoading && !rolesQuery.isError && roles.length > 0 && (
            <div className="space-y-2">
              {roles.map((role) => {
                const presentation = getRolePresentation(role)

                return (
                  <div
                    className="rounded-lg border bg-background p-3"
                    key={role.id}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{presentation.label}</p>
                      <Badge variant="outline">Associado</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {presentation.description}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <DialogFooter>
          <Button onClick={onClose} type="button" variant="outline">
            Fechar
          </Button>
          {canManageRoles && (
            <Button onClick={() => onEdit(account)} type="button">
              <Pencil aria-hidden="true" className="h-4 w-4" />
              Editar acessos
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
