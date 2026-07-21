import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'

import type { Account } from '../api/accounts'
import { useAccountRoles } from '../hooks/useAccountAdministration'
import { AccountCurrentRolesSection } from './AccountCurrentRolesSection'
import { AccountRoleAssignmentSection } from './AccountRoleAssignmentSection'

type AccountAccessEditDialogProps = {
  account: Account | null
  canManageRoles: boolean
  onClose: () => void
}

export function AccountAccessEditDialog({
  account,
  canManageRoles,
  onClose,
}: AccountAccessEditDialogProps) {
  const rolesQuery = useAccountRoles(account?.id ?? null)

  if (!account || !canManageRoles) {
    return null
  }

  const accountId = account.id ?? ''
  const roles = rolesQuery.data?.roles ?? []

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
          <DialogTitle>Editar tipos de acesso</DialogTitle>
          <DialogDescription>
            Altere os tipos de acesso associados a {account.displayName ?? 'esta conta'}.
          </DialogDescription>
        </DialogHeader>

        <AccountRoleAssignmentSection accountId={accountId} roles={roles} />
        <AccountCurrentRolesSection
          accountId={accountId}
          isError={rolesQuery.isError}
          isLoading={rolesQuery.isLoading}
          onRetry={() => void rolesQuery.refetch()}
          roles={roles}
        />

        <DialogFooter>
          <Button onClick={onClose} type="button" variant="outline">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
