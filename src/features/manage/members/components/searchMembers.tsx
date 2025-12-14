import { useState } from 'react';
import { SearchAndFilter, type SortCriteria } from '@/components/searchAndFilter';
import { useSearchMembers } from '../hooks/useSearchMembers';
import type { SearchDTO, PageParams, SpecificationFilter } from '@/types/api';
import { Loader2 } from 'lucide-react';

const MEMBER_FIELDS = [
  'name',
  'email',
  'phone',
  'role',
  'status',
  'city'
];

export const SearchMembers = () => {
  const [searchParams, setSearchParams] = useState<SearchDTO>({
    filters: []
  });

  const [pageParams, setPageParams] = useState<PageParams>({
    page: 0,
    size: 10,
    sort: []
  });

  const { data, isLoading, isError } = useSearchMembers({
    filters: searchParams,
    pageParams: pageParams
  });

  const handleSearch = (filters: SpecificationFilter[], sorts: SortCriteria[]) => {
    const newPage = 0;
    const apiSorts = sorts.map(s => `${s.field},${s.direction.toLowerCase()}`);
    setSearchParams({ filters });
    setPageParams(prev => ({
      ...prev,
      page: newPage,
      sort: apiSorts
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Gerenciar Membros</h1>
        <p className="text-muted-foreground">Visualize e gerencie os membros do grupo.</p>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
        <SearchAndFilter 
          fields={MEMBER_FIELDS}
          mainFilterField="name"
          onSearch={handleSearch}
        />
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm">
            Erro ao carregar membros. Tente novamente.
          </div>
        )}

        {!isLoading && !isError && data?.content && (
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium">
                <tr>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Função</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.content.length === 0 ? (
                   <tr>
                     <td colSpan={4} className="p-8 text-center text-muted-foreground">
                       Nenhum membro encontrado com os filtros atuais.
                     </td>
                   </tr>
                ) : (
                  data.content.map((member) => (
                    <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">{member.name}</td>
                      <td className="p-4 text-muted-foreground">{member.account.email}</td>
                      <td className="p-4">{member.account.roles.name}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {member.status || 'Ativo'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {!isLoading && data && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>Página {data.number + 1} de {data.totalPages}</div>
            <div className="flex gap-2">
              <button 
                disabled={data.first}
                onClick={() => setPageParams(prev => ({ ...prev, page: prev.page! - 1 }))}
                className="px-3 py-1 border border-border rounded disabled:opacity-50 hover:bg-secondary"
              >
                Anterior
              </button>
              <button 
                disabled={data.last}
                onClick={() => setPageParams(prev => ({ ...prev, page: prev.page! + 1 }))}
                className="px-3 py-1 border border-border rounded disabled:opacity-50 hover:bg-secondary"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};