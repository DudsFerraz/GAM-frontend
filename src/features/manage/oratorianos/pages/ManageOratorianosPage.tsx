import { Link, useNavigate } from '@tanstack/react-router'
import {
  CalendarDays,
  ChevronRight,
  Phone,
  Plus,
  Search,
  UserRound,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'

import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/AsyncState'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  useAccountInfo,
  useAccountPermissions,
} from '@/features/account'
import { formatDate } from '@/lib/format'
import { isForbiddenError } from '@/lib/http'
import { useCapabilityBoundState } from '@/hooks/useCapabilityBoundState'

import { RegisterOratorianoDialog } from '../components/RegisterOratorianoDialog'
import { useOratorianos } from '../hooks/useOratorianos'
import { getOratorianoFullName } from '../presentation'

export function ManageOratorianosPage() {
  const [nameInput, setNameInput] = useState('')
  const [name, setName] = useState('')
  const [page, setPage] = useState(0)
  const navigate = useNavigate()
  const { account } = useAccountInfo()
  const { permissions } = useAccountPermissions(account)
  const canView = permissions.includes('ORATORIANO_GET')
  const canRegister = permissions.includes('ORATORIANO_REGISTER')
  const canOpenRegister = canView && canRegister
  const [isRegisterOpen, setIsRegisterOpen] = useCapabilityBoundState(
    canOpenRegister,
    false,
  )
  const query = useOratorianos(name, page, canView)
  const items = query.data?.items ?? []

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    setPage(0)
    setName(nameInput)
  }

  if (!canView) {
    return (
      <ForbiddenState description="Sua conta não tem acesso aos Oratorianos." />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            Operação do Oratório
          </p>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Oratorianos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulte o cadastro comum e o histórico de participação.
          </p>
        </div>
        {canRegister && (
          <Button onClick={() => setIsRegisterOpen(true)}>
            <Plus aria-hidden="true" className="h-4 w-4" />
            Novo Oratoriano
          </Button>
        )}
      </div>

      <form
        className="flex flex-col gap-2 rounded-xl border bg-card p-4 sm:flex-row sm:items-end"
        onSubmit={submitSearch}
      >
        <div className="flex-1">
          <Label htmlFor="oratoriano-name">Nome</Label>
          <Input
            id="oratoriano-name"
            onChange={(event) => setNameInput(event.target.value)}
            placeholder="Buscar pelo nome completo"
            value={nameInput}
          />
        </div>
        <Button type="submit">
          <Search aria-hidden="true" className="h-4 w-4" />
          Buscar
        </Button>
      </form>

      {query.isLoading && (
        <LoadingState title="Carregando Oratorianos..." />
      )}
      {query.isError && (
        isForbiddenError(query.error) ? (
          <ForbiddenState description="Sua conta não tem acesso à busca de Oratorianos." />
        ) : (
          <ErrorState onRetry={() => void query.refetch()} />
        )
      )}
      {!query.isLoading && !query.isError && items.length === 0 && (
        <EmptyState
          description="Tente outro nome ou cadastre uma nova pessoa."
          title="Nenhum Oratoriano encontrado."
        />
      )}
      {!query.isError && items.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((oratoriano, index) => {
            const oratorianoId = oratoriano.id
            const fullName = getOratorianoFullName(oratoriano)

            return (
              <Card
                className="gap-4 py-5"
                interactive={Boolean(oratorianoId)}
                key={oratorianoId ?? index}
              >
                {oratorianoId && (
                  <CardActionArea asChild>
                    <Link
                      aria-label={`Abrir perfil de ${fullName}`}
                      params={{ oratorianoId }}
                      to="/manage/oratorios/oratorianos/$oratorianoId"
                    />
                  </CardActionArea>
                )}
                <CardHeader className="pointer-events-none relative z-[1] flex grid-cols-none flex-row items-start justify-between gap-3 px-5">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Oratoriano
                    </p>
                    <CardTitle className="mt-2 truncate font-heading text-xl">
                      {fullName}
                    </CardTitle>
                  </div>
                  <ChevronRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                  />
                </CardHeader>
                <CardContent className="pointer-events-none relative z-[1] space-y-3 px-5 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays aria-hidden="true" className="h-4 w-4" />
                    {oratoriano.birthDate
                      ? `Nascimento: ${formatDate(oratoriano.birthDate)}`
                      : 'Nascimento não informado'}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone aria-hidden="true" className="h-4 w-4" />
                    {oratoriano.phoneNumber ?? 'Telefone não informado'}
                  </p>
                  <p className="flex items-center gap-2 font-medium text-primary">
                    <UserRound aria-hidden="true" className="h-4 w-4" />
                    Abrir perfil e frequência
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      {!query.isError && query.data && (
        <Pagination
          disabled={query.isFetching}
          itemLabel="Oratorianos"
          onPageChange={setPage}
          page={query.data.page ?? page}
          totalElements={query.data.totalElements ?? items.length}
          totalPages={query.data.totalPages ?? 0}
        />
      )}

      <RegisterOratorianoDialog
        onOpenChange={setIsRegisterOpen}
        onRegistered={(oratorianoId) => {
          setIsRegisterOpen(false)
          void navigate({
            params: { oratorianoId },
            to: '/manage/oratorios/oratorianos/$oratorianoId',
          })
        }}
        open={isRegisterOpen}
      />
    </div>
  )
}
