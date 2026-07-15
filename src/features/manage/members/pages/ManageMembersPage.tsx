import { useState } from 'react';
import { SearchAndFilter } from '../components/SearchAndFilter';
import type { SortCriteria } from '../components/SearchAndFilter/types';
import { useSearchMembers } from '../hooks/useSearchMembers';
import type {
  MemberResponse,
  PageParams,
  SearchDTO,
  SpecificationFilter,
} from '../types';
import { MEMBERS_FILTER_CONFIG } from '../memberSearchConfig';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { MemberCard } from '../components/MemberCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/AsyncState';

//deve ser componente proprio futuramente
const EditMemberPlaceholder = ({ member, onClose }: { member: MemberResponse | null, onClose: () => void }) => {
  return (
    <Dialog open={!!member} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Membro</DialogTitle>
          <DialogDescription>
            Funcionalidade de edição para {member?.name} será implementada aqui.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>ID: {member?.id}</p>
          <p>Email: {member?.account.email}</p>
        </div>
        <Button onClick={onClose}>Fechar</Button>
      </DialogContent>
    </Dialog>
  );
};

export const ManageMembersPage = () => {
  const [searchParams, setSearchParams] = useState<SearchDTO>({ filters: [] });
  const [pageParams, setPageParams] = useState<PageParams>({
    page: 0,
    size: 10,
    sort: []
  });
  const [selectedMember, setSelectedMember] = useState<MemberResponse | null>(null);

  const { data, isLoading, isError, refetch } = useSearchMembers({
    filters: searchParams,
    pageParams: pageParams
  });

  const handleSearch = (filters: SpecificationFilter[], sorts: SortCriteria[]) => {
    const apiSorts = sorts.map(s => `${s.field},${s.direction.toLowerCase()}`);
    setSearchParams({ filters });
    setPageParams(prev => ({ ...prev, page: 0, sort: apiSorts }));
  };

  const handleCardClick = (member: MemberResponse) => {
    setSelectedMember(member);
  };

  const handleCloseEdit = () => {
    setSelectedMember(null);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-0 py-2 sm:space-y-6 sm:px-2 sm:py-4 lg:px-4">
      
      {/* Header and Search Section */}
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">Gerenciar Membros</h1>
        <p className="text-sm text-muted-foreground sm:text-base">Visualize e gerencie os membros do grupo.</p>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
        <SearchAndFilter 
          config={MEMBERS_FILTER_CONFIG}
          mainFilterField="account.displayName" 
          onSearch={handleSearch}
        />
      </div>

      {/* Member Display Section */}
      <div className="space-y-4">
        {isLoading && <LoadingState />}

        {isError && <ErrorState onRetry={() => void refetch()} description="Não foi possível carregar os membros. Verifique sua conexão." />}

        {!isLoading && !isError && data?.content && (
          <>
            {data.content.length === 0 ? (
               <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.content.map((member) => (
                  <MemberCard 
                    key={member.id} 
                    member={member} 
                    onClick={handleCardClick}
                  />
                ))}
              </div>
            )}
            
            {/* Controles de paginação podem ser adicionados */}
          </>
        )}
      </div>

      {/* Manage Member */}
      {selectedMember && (
        <EditMemberPlaceholder 
          member={selectedMember} 
          onClose={handleCloseEdit} 
        />
      )}
    </div>
  );
};
