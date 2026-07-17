import { Mail, Search, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { EmptyState, ErrorState, ForbiddenState, LoadingState } from '@/components/AsyncState'
import { Pagination } from '@/components/Pagination'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { getRoleLabel, useAccountInfo, useAccountPermissions } from '@/features/account'
import { isForbiddenError } from '@/lib/http'

import type { Account } from '../api/accounts'
import { AccountAdministrationPanel } from '../components/AccountAdministrationPanel'
import { useSearchAccounts } from '../hooks/useAccountAdministration'

export function ManageAccountsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [field, setField] = useState<'displayName' | 'email'>('displayName')
  const [page, setPage] = useState(0)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const { account } = useAccountInfo()
  const { permissions } = useAccountPermissions(account)
  const query = useSearchAccounts(searchTerm, field, page)
  const items = query.data?.items ?? []
  const canManageRoles = permissions.includes('ACCOUNT_ROLE_MANAGE')

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    setPage(0)
    setSearchTerm(searchInput)
  }

  return (
    <div className="space-y-6 py-2 sm:py-4">
      <div><p className="text-sm font-medium text-primary">Administração</p><h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">Contas e tipos de acesso</h1><p className="mt-1 text-sm text-muted-foreground">Localize contas e consulte os tipos de acesso associados a cada pessoa.</p></div>

      <form className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[180px_1fr_auto] sm:items-end" onSubmit={handleSearch}>
        <div><Label htmlFor="account-search-field">Buscar por</Label><Select id="account-search-field" value={field} onChange={(event) => setField(event.target.value as 'displayName' | 'email')}><option value="displayName">Nome de exibição</option><option value="email">E-mail</option></Select></div>
        <div><Label htmlFor="account-search">Termo</Label><Input id="account-search" onChange={(event) => setSearchInput(event.target.value)} placeholder="Deixe vazio para listar todas" value={searchInput} /></div>
        <Button type="submit"><Search className="h-4 w-4" />Buscar</Button>
      </form>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
        <section className="space-y-4" aria-label="Resultados de contas">
          {query.isLoading && <LoadingState title="Carregando contas..." />}
          {query.isError && (isForbiddenError(query.error) ? <ForbiddenState description="Sua conta não tem acesso à busca de contas." /> : <ErrorState onRetry={() => void query.refetch()} />)}
          {!query.isLoading && !query.isError && items.length === 0 && <EmptyState title="Nenhuma conta encontrada." />}
          {items.map((item, index) => (
            <Card className={selectedAccount?.id === item.id ? 'gap-3 border-primary py-4' : 'gap-3 py-4'} key={item.id ?? index}>
              <CardHeader className="flex grid-cols-none flex-row items-start gap-3 px-5"><div className="rounded-full bg-primary/10 p-2 text-primary"><UserRound className="h-5 w-5" /></div><div className="min-w-0"><CardTitle className="truncate">{item.displayName ?? 'Conta sem nome'}</CardTitle><p className="mt-1 flex items-center gap-1 truncate text-sm text-muted-foreground"><Mail className="h-3.5 w-3.5" />{item.email}</p></div></CardHeader>
              <CardContent className="flex flex-wrap gap-1 px-5">{item.roles.map((role, roleIndex) => <Badge key={role.id ?? roleIndex} variant="outline">{getRoleLabel(role)}</Badge>)}</CardContent>
              <CardFooter className="px-5"><Button className="w-full" disabled={!item.id} onClick={() => setSelectedAccount(item)} size="sm" variant={selectedAccount?.id === item.id ? 'default' : 'outline'}>Administrar conta</Button></CardFooter>
            </Card>
          ))}
          {query.data && <Pagination disabled={query.isFetching} itemLabel="contas" onPageChange={setPage} page={query.data.page ?? page} totalElements={query.data.totalElements ?? items.length} totalPages={query.data.totalPages ?? 0} />}
        </section>
        <aside aria-label="Administração da conta selecionada">
          {selectedAccount ? <AccountAdministrationPanel account={selectedAccount} canManageRoles={canManageRoles} /> : <EmptyState className="sticky top-0" title="Selecione uma conta." description="Os tipos de acesso da conta serão exibidos aqui." />}
        </aside>
      </div>
    </div>
  )
}
