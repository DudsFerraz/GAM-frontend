import { useState } from 'react';
import { SearchAndFilter } from '@/components/searchAndFilter';
import type { SortCriteria } from "@/types/searchAndFilter";
import { useSearchMembers } from '../hooks/useSearchMembers';
import type { SearchDTO, PageParams, SpecificationFilter } from '@/types/api';
import type { MemberResponse } from '@/types/api';
import { Loader2 } from 'lucide-react';
import { MEMBERS_FILTER_CONFIG } from '../constants';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MemberCard } from './memberCard';

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

export const SearchMembers = () => {
  const [searchParams, setSearchParams] = useState<SearchDTO>({ filters: [] });
  const [pageParams, setPageParams] = useState<PageParams>({
    page: 0,
    size: 10,
    sort: []
  });
  const [selectedMember, setSelectedMember] = useState<MemberResponse | null>(null);

  const { data, isLoading, isError } = useSearchMembers({
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
    <div className="container mx-auto p-6 space-y-6">
      
      {/* Header and Search Section */}
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Gerenciar Membros</h1>
        <p className="text-muted-foreground">Visualize e gerencie os membros do grupo.</p>
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
        {isLoading && (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm">
            Erro ao carregar membros. Verifique sua conexão.
          </div>
        )}

        {!isLoading && !isError && data?.content && (
          <>
            {data.content.length === 0 ? (
               <div className="p-8 text-center text-muted-foreground bg-card border border-border rounded-xl">
                 Nenhum resultado encontrado.
               </div>
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