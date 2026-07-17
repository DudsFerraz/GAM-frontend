import { KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react'

import { EmptyState, LoadingState } from '@/components/AsyncState'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'

import { getMainRoleLabel } from '../getMainRoleLabel'
import { useAccountInfo } from '../hooks/useAccountInfo'

function getInitials(displayName: string) {
  return displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?'
}

export function AccountProfilePage() {
  const { account, isLoading } = useAccountInfo()

  if (isLoading) {
    return <LoadingState title="Carregando seu perfil..." />
  }

  if (!account) {
    return <EmptyState title="Perfil indisponível." description="Não foi possível carregar os dados da conta autenticada." />
  }

  const permissions = [...account.permissions].sort((first, second) => first.localeCompare(second))

  return (
    <div className="space-y-6 py-2 sm:py-4">
      <section className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
        <Avatar className="h-16 w-16 border-2 border-primary/20 sm:h-20 sm:w-20">
          <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary sm:text-xl">
            {getInitials(account.displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">Minha conta</p>
          <h1 className="truncate font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {account.displayName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{getMainRoleLabel(account.roles)}</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" />
              Dados da conta
            </CardTitle>
            <CardDescription>Informações fornecidas pelo contexto da sessão atual.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 text-sm">
              <div>
                <dt className="text-muted-foreground">Nome de exibição</dt>
                <dd className="mt-1 font-medium">{account.displayName}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  E-mail
                </dt>
                <dd className="mt-1 break-all font-medium">{account.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Identificador</dt>
                <dd className="mt-1 break-all font-mono text-xs font-medium">{account.id}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Papéis ativos
            </CardTitle>
            <CardDescription>Papéis associados à sua conta neste momento.</CardDescription>
          </CardHeader>
          <CardContent>
            {account.roles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum papel ativo.</p>
            ) : (
              <ul className="space-y-3">
                {account.roles.map((role) => (
                  <li className="rounded-lg border p-4" key={role.id}>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{role.name}</p>
                      {role.systemManaged && <Badge variant="secondary">Papel do sistema</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{role.description || 'Sem descrição.'}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Permissões efetivas
          </CardTitle>
          <CardDescription>Capacidades atualmente liberadas pelo backend para esta conta.</CardDescription>
        </CardHeader>
        <CardContent>
          {permissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma permissão efetiva.</p>
          ) : (
            <ul className="flex flex-wrap gap-2" aria-label="Permissões efetivas">
              {permissions.map((permission) => (
                <li key={permission}>
                  <Badge variant="outline">{permission}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
