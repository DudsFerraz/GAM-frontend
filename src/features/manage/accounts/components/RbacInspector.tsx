import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'

import { EmptyState, ErrorState, LoadingState } from '@/components/AsyncState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

import { usePermission, useRole, useRolePermissions } from '../hooks/useAccountAdministration'

type Props = { roleId: string; canInspectPermissions: boolean; onClose: () => void }

export function RbacInspector({ roleId, canInspectPermissions, onClose }: Props) {
  const [permissionId, setPermissionId] = useState<string | null>(null)
  const roleQuery = useRole(roleId)
  const permissionsQuery = useRolePermissions(roleId, canInspectPermissions)
  const permissionQuery = usePermission(permissionId, canInspectPermissions)

  return (
    <Card className="gap-4 border-primary/30 bg-primary/5 py-5">
      <CardHeader className="flex grid-cols-none flex-row items-start justify-between gap-3 px-5">
        <div><p className="text-xs font-medium uppercase tracking-wide text-primary">Referência RBAC</p><CardTitle className="mt-1">{roleQuery.data?.name ?? 'Papel'}</CardTitle></div>
        <Button onClick={onClose} size="sm" variant="ghost">Fechar</Button>
      </CardHeader>
      <CardContent className="space-y-4 px-5">
        {roleQuery.isLoading && <LoadingState className="min-h-32" />}
        {roleQuery.isError && <ErrorState className="min-h-32" onRetry={() => void roleQuery.refetch()} />}
        {roleQuery.data && <div className="space-y-2 text-sm"><p>{roleQuery.data.description ?? 'Sem descrição.'}</p><Badge variant="outline">{roleQuery.data.systemManaged ? 'Gerenciado pelo sistema' : 'Personalizado'}</Badge><p className="break-all text-xs text-muted-foreground">{roleQuery.data.id}</p></div>}

        {canInspectPermissions ? (
          <div className="space-y-3 border-t pt-4">
            <h4 className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4" />Permissões do papel</h4>
            {permissionsQuery.isLoading && <LoadingState className="min-h-32" />}
            {permissionsQuery.isError && <ErrorState className="min-h-32" onRetry={() => void permissionsQuery.refetch()} />}
            {permissionsQuery.data?.length === 0 && <EmptyState className="min-h-32" title="Nenhuma permissão vinculada." />}
            <div className="grid gap-2 sm:grid-cols-2">
              {permissionsQuery.data?.map((permission, index) => (
                <button key={permission.id ?? index} className="rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" disabled={!permission.id} onClick={() => permission.id && setPermissionId(permission.id)} type="button">
                  <span className="block font-mono text-xs font-semibold text-primary">{permission.code}</span><span className="mt-1 block text-sm">{permission.label}</span>
                </button>
              ))}
            </div>
            {permissionId && (
              <div className="rounded-lg border bg-card p-4">
                {permissionQuery.isLoading && <p className="text-sm text-muted-foreground">Carregando permissão...</p>}
                {permissionQuery.isError && <p className="text-sm text-destructive">Não foi possível consultar a permissão.</p>}
                {permissionQuery.data && <dl className="grid gap-2 text-sm"><div><dt className="text-muted-foreground">Código</dt><dd className="font-mono font-semibold">{permissionQuery.data.code}</dd></div><div><dt className="text-muted-foreground">Nome</dt><dd className="font-medium">{permissionQuery.data.label}</dd></div><div><dt className="text-muted-foreground">Descrição</dt><dd>{permissionQuery.data.description ?? 'Sem descrição.'}</dd></div><div><dt className="text-muted-foreground">Identificador</dt><dd className="break-all text-xs">{permissionQuery.data.id}</dd></div></dl>}
              </div>
            )}
          </div>
        ) : <p className="text-sm text-muted-foreground">A consulta das permissões exige acesso aos catálogos de papéis e permissões.</p>}
      </CardContent>
    </Card>
  )
}
