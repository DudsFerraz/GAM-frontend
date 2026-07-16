import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { EmptyState, ErrorState, LoadingState } from '@/components/AsyncState'
import { Button } from '@/components/ui/Button'
import { useAccountInfo, useAccountPermissions } from '@/features/account'

import { MemberCard } from '../components/MemberCard'
import { MemberDetailsDialog } from '../components/MemberDetailsDialog'
import { SearchAndFilter } from '../components/SearchAndFilter'
import type { SortCriteria } from '../components/SearchAndFilter/types'
import { useSearchMembers } from '../hooks/useSearchMembers'
import { MEMBERS_FILTER_CONFIG } from '../memberSearchConfig'
import type {
  MemberListItem,
  PageParams,
  SpecificationFilter,
} from '../types'

export function ManageMembersPage() {
  const [filters, setFilters] = useState<SpecificationFilter[]>([])
  const [pageParams, setPageParams] = useState<PageParams>({
    page: 0,
    size: 12,
    sort: [],
  })
  const [selectedMember, setSelectedMember] = useState<MemberListItem | null>(null)

  const { account } = useAccountInfo()
  const { permissions } = useAccountPermissions(account)
  const canChangeStatus = permissions.includes('MEMBER_ACTIVATION')

  const { data, isLoading, isError, refetch } = useSearchMembers({
    filters,
    pageParams,
  })

  const handleSearch = (filters: SpecificationFilter[], sorts: SortCriteria[]) => {
    const apiSorts = sorts.map((sort) => `${sort.field},${sort.direction.toLowerCase()}`)
    setFilters(filters)
    setPageParams((previous) => ({ ...previous, page: 0, sort: apiSorts }))
  }

  const handlePageChange = (page: number) => {
    setPageParams((previous) => ({ ...previous, page }))
  }

  const pageNumber = data ? data.page + 1 : 1
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-0 py-2 sm:space-y-6 sm:px-2 sm:py-4 lg:px-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">Gerenciar Membros</h1>
        <p className="text-sm text-muted-foreground sm:text-base">Visualize e gerencie os membros do grupo.</p>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
        <SearchAndFilter
          config={MEMBERS_FILTER_CONFIG}
          mainFilterField="name"
          onSearch={handleSearch}
        />
      </div>

      <div className="space-y-4">
        {isLoading && <LoadingState />}

        {isError && (
          <ErrorState
            description="Não foi possível carregar os membros. Verifique sua conexão."
            onRetry={() => void refetch()}
          />
        )}

        {!isLoading && !isError && data && (
          <>
            {data.items.length === 0 ? (
               <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.items.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member} 
                    onClick={setSelectedMember}
                  />
                ))}
              </div>
            )}

            {data.totalPages > 1 && (
              <nav aria-label="Paginação de membros" className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {pageNumber} de {totalPages} · {data.totalElements} membros
                </p>
                <div className="flex gap-2">
                  <Button
                    disabled={data.first}
                    onClick={() => handlePageChange(data.page - 1)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    disabled={data.last}
                    onClick={() => handlePageChange(data.page + 1)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Próxima
                    <ChevronRight aria-hidden="true" className="h-4 w-4" />
                  </Button>
                </div>
              </nav>
            )}
          </>
        )}
      </div>

      <MemberDetailsDialog
        canChangeStatus={canChangeStatus}
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  )
}
