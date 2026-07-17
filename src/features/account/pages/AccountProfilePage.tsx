import { Mail, ShieldCheck, UserRound } from 'lucide-react'

import { EmptyState, LoadingState } from '@/components/AsyncState'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'

import { getMainRoleLabel } from '../getMainRoleLabel'
import { useAccountInfo } from '../hooks/useAccountInfo'
import { getRolePresentation } from '../presentation'

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
            <CardDescription>Informações básicas da sua conta.</CardDescription>
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
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Tipos de acesso
            </CardTitle>
            <CardDescription>Como sua participação está configurada na plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            {account.roles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum tipo de acesso disponível.</p>
            ) : (
              <ul className="space-y-3">
                {account.roles.map((role) => {
                  const presentation = getRolePresentation(role)

                  return (
                    <li className="rounded-lg border p-4" key={role.id}>
                      <p className="font-medium">{presentation.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{presentation.description}</p>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
