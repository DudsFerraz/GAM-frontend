import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import { EmptyState, ErrorState, LoadingState } from '@/components/AsyncState'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/Button'
import { useAccountInfo, useAccountPermissions } from '@/features/account'

import { MemberCard } from '../components/MemberCard'
import { MemberDetailsDialog } from '../components/MemberDetailsDialog'
import { RegisterMemberDialog } from '../components/RegisterMemberDialog'
import { SearchAndFilter } from '../components/SearchAndFilter'
import type { SortCriteria } from '../components/SearchAndFilter/types'
import { useSearchMembers } from '../hooks/useSearchMembers'
import { MEMBERS_FILTER_CONFIG } from '../memberSearchConfig'
import type {
  MemberListItem,
  PageParams,
  SpecificationFilter,
} from '../types'

const SHOW_INACTIVE_STORAGE_KEY = 'gam:manage-members:show-inactive'

function readShowInactivePreference(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    return window.localStorage.getItem(SHOW_INACTIVE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function ManageMembersPage() {
  const [filters, setFilters] = useState<SpecificationFilter[]>([])
  const [showInactive, setShowInactive] = useState(readShowInactivePreference)
  const [pageParams, setPageParams] = useState<PageParams>({
    page: 0,
    size: 12,
    sort: [],
  })
  const [selectedMember, setSelectedMember] = useState<MemberListItem | null>(null)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const navigate = useNavigate()

  const { account } = useAccountInfo()
  const { permissions } = useAccountPermissions(account)
  const canChangeStatus = permissions.includes('MEMBER_ACTIVATION')
  const canCreateMember = permissions.includes('MEMBER_MANAGE') && permissions.includes('ACCOUNT_SEARCH')

  useEffect(() => {
    try {
      window.localStorage.setItem(SHOW_INACTIVE_STORAGE_KEY, String(showInactive))
    } catch {
      // A preferência local não deve impedir a busca de membros.
    }
  }, [showInactive])

  const { data, isLoading, isError, refetch } = useSearchMembers({
    filters,
    pageParams,
    showInactive,
  })

  const handleSearch = (filters: SpecificationFilter[], sorts: SortCriteria[]) => {
    const apiSorts = sorts.map((sort) => `${sort.field},${sort.direction.toLowerCase()}`)
    setFilters(filters)
    setPageParams((previous) => ({ ...previous, page: 0, sort: apiSorts }))
  }

  const handlePageChange = (page: number) => {
    setPageParams((previous) => ({ ...previous, page }))
  }

  const handleShowInactiveChange = (nextShowInactive: boolean) => {
    setShowInactive(nextShowInactive)
    setPageParams((previous) => ({ ...previous, page: 0 }))
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-0 py-2 sm:space-y-6 sm:px-2 sm:py-4 lg:px-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">Gerenciar Membros</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Visualize e gerencie os membros do grupo.</p>
        </div>
        {canCreateMember && (
          <Button onClick={() => setIsRegisterOpen(true)} type="button">
            <Plus aria-hidden="true" className="h-4 w-4" />
            Cadastrar membro
          </Button>
        )}
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
        <SearchAndFilter
          config={MEMBERS_FILTER_CONFIG}
          mainFilterField="name"
          onSearch={handleSearch}
          onShowInactiveChange={handleShowInactiveChange}
          showInactive={showInactive}
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

            <Pagination
              itemLabel="membros"
              onPageChange={handlePageChange}
              page={data.page}
              totalElements={data.totalElements}
              totalPages={data.totalPages}
            />
          </>
        )}
      </div>

      <MemberDetailsDialog
        canChangeStatus={canChangeStatus}
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
      <RegisterMemberDialog
        onCreated={(memberId) => {
          setIsRegisterOpen(false)
          void navigate({ to: '/manage/members/$memberId', params: { memberId } })
        }}
        onOpenChange={setIsRegisterOpen}
        open={isRegisterOpen}
      />
    </div>
  )
}
