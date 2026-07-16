import { Link } from '@tanstack/react-router'
import { ArrowLeft, CalendarDays, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { useState } from 'react'

import { EmptyState, ErrorState, ForbiddenState, LoadingState } from '@/components/AsyncState'
import { Pagination } from '@/components/Pagination'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatDate, formatDateTime } from '@/lib/format'
import { isForbiddenError } from '@/lib/http'

import { useMember } from '../hooks/useMember'
import { useMemberPresences } from '../hooks/useMemberPresences'

type MemberDetailPageProps = {
  memberId: string
}

export function MemberDetailPage({ memberId }: MemberDetailPageProps) {
  const [presencePage, setPresencePage] = useState(0)
  const memberQuery = useMember(memberId)
  const presencesQuery = useMemberPresences(memberId, presencePage)

  if (memberQuery.isLoading) {
    return <LoadingState title="Carregando membro..." />
  }

  if (memberQuery.isError) {
    return isForbiddenError(memberQuery.error) ? (
      <ForbiddenState description="Você não tem permissão para consultar este membro." />
    ) : (
      <ErrorState onRetry={() => void memberQuery.refetch()} />
    )
  }

  const member = memberQuery.data
  if (!member) {
    return <EmptyState title="Membro não encontrado." />
  }

  const fullName = [member.firstName, member.surname].filter(Boolean).join(' ')
  const presenceItems = presencesQuery.data?.items ?? []

  return (
    <div className="space-y-6 py-2 sm:py-4">
      <Button asChild size="sm" variant="ghost">
        <Link to="/manage/members">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Voltar para membros
        </Link>
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Perfil do membro</p>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {fullName || 'Membro sem nome'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{member.account?.displayName}</p>
        </div>
        <Badge variant={member.status === 'INACTIVE' ? 'destructive' : 'secondary'}>
          {member.status === 'ACTIVE' ? 'Ativo' : member.status === 'INACTIVE' ? 'Inativo' : 'Sem status'}
        </Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>Dados cadastrais</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div><dt className="flex items-center gap-2 text-muted-foreground"><UserRound className="h-4 w-4" />Conta</dt><dd className="mt-1 break-all font-medium">{member.account?.id ?? 'Não informada'}</dd></div>
            <div><dt className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />E-mail</dt><dd className="mt-1 font-medium">{member.account?.email ?? 'Não informado'}</dd></div>
            <div><dt className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />Telefone</dt><dd className="mt-1 font-medium">{member.phoneNumber ?? 'Não informado'}</dd></div>
            <div><dt className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" />Nascimento</dt><dd className="mt-1 font-medium">{formatDate(member.birthDate)}</dd></div>
            <div className="sm:col-span-2"><dt className="text-muted-foreground">Identificador do membro</dt><dd className="mt-1 break-all font-medium">{member.id}</dd></div>
          </dl>
        </CardContent>
      </Card>

      <section aria-labelledby="presence-history-title" className="space-y-4">
        <div>
          <h2 id="presence-history-title" className="font-heading text-xl font-bold">Histórico de presenças</h2>
          <p className="text-sm text-muted-foreground">Eventos nos quais a presença deste membro foi registrada.</p>
        </div>

        {presencesQuery.isLoading && <LoadingState title="Carregando presenças..." />}
        {presencesQuery.isError && (
          isForbiddenError(presencesQuery.error) ? (
            <ForbiddenState description="Você não tem permissão para consultar este histórico." />
          ) : (
            <ErrorState onRetry={() => void presencesQuery.refetch()} />
          )
        )}
        {!presencesQuery.isLoading && !presencesQuery.isError && presenceItems.length === 0 && (
          <EmptyState title="Nenhuma presença registrada." description="O histórico aparecerá após o registro de presenças em eventos." />
        )}
        {presenceItems.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {presenceItems.map((presence, index) => (
              <Card key={presence.id ?? `${presence.event?.id}-${index}`} className="gap-3 py-4">
                <CardContent className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{presence.event?.title ?? 'Evento não informado'}</h3>
                    {presence.event?.type && <Badge variant="outline">{presence.event.type}</Badge>}
                  </div>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4" />{formatDateTime(presence.event?.beginDate)}</p>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{presence.event?.location?.name ?? 'Local não informado'}</p>
                  {presence.observations && <p className="text-sm">{presence.observations}</p>}
                  {presence.event?.id && (
                    <Button asChild size="sm" variant="link">
                      <Link to="/manage/events/$eventId" params={{ eventId: presence.event.id }}>Ver evento</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {presencesQuery.data && (
          <Pagination
            disabled={presencesQuery.isFetching}
            itemLabel="presenças"
            onPageChange={setPresencePage}
            page={presencesQuery.data.page ?? presencePage}
            totalElements={presencesQuery.data.totalElements ?? presenceItems.length}
            totalPages={presencesQuery.data.totalPages ?? 0}
          />
        )}
      </section>
    </div>
  )
}
