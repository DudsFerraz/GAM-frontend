import { ChevronRight, Mail, UserRound } from "lucide-react";
import { useState } from "react";

import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from "@/components/AsyncState";
import { Pagination } from "@/components/Pagination";
import {
  SearchAndFilter,
  type SearchFilter,
  type SortCriteria,
} from "@/components/SearchAndFilter";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { getRoleLabel } from "@/features/account";
import { isForbiddenError } from "@/lib/http";

import type { Account } from "../api/accounts";
import { ACCOUNT_SEARCH_CONFIG, toAccountSearch } from "../accountSearchConfig";
import { AccountDetailsDialog } from "../components/AccountDetailsDialog";
import { useSearchAccounts } from "../hooks/useAccountAdministration";

export function ManageAccountsPage() {
  const [search, setSearch] = useState(() => toAccountSearch([], []));
  const [page, setPage] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const query = useSearchAccounts(search, page);
  const items = query.data?.items ?? [];

  const handleSearch = (filters: SearchFilter[], sorts: SortCriteria[]) => {
    setPage(0);
    setSearch(toAccountSearch(filters, sorts));
  };

  return (
    <div className="space-y-6 py-2 sm:py-4">
      <div>
        <p className="text-sm font-medium text-primary">Administração</p>
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Contas e tipos de acesso
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Localize contas e consulte os tipos de acesso associados a cada
          pessoa.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <SearchAndFilter
          config={ACCOUNT_SEARCH_CONFIG}
          mainFilterField="displayName"
          onSearch={handleSearch}
        />
      </div>

      <section className="space-y-4" aria-label="Resultados de contas">
        {query.isLoading && <LoadingState title="Carregando contas..." />}
        {query.isError &&
          (isForbiddenError(query.error) ? (
            <ForbiddenState description="Sua conta não tem acesso à busca de contas." />
          ) : (
            <ErrorState onRetry={() => void query.refetch()} />
          ))}
        {!query.isLoading && !query.isError && items.length === 0 && (
          <EmptyState title="Nenhuma conta encontrada." />
        )}
        {items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item, index) => (
              <Card
                className={selectedAccount?.id === item.id ? "gap-3 border-primary py-4" : "gap-3 py-4"}
                interactive={Boolean(item.id)}
                key={item.id ?? index}
              >
                {item.id && (
                  <CardActionArea
                    aria-label={`Ver detalhes de ${item.displayName ?? "conta"}`}
                    onClick={() => {
                      setSelectedAccount(item);
                    }}
                  />
                )}
                <CardHeader className="pointer-events-none relative z-[1] flex grid-cols-none flex-row items-start gap-3 px-5">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <UserRound aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="truncate">
                      {item.displayName ?? "Conta sem nome"}
                    </CardTitle>
                    <p className="mt-1 flex items-center gap-1 truncate text-sm text-muted-foreground">
                      <Mail aria-hidden="true" className="h-3.5 w-3.5" />
                      {item.email ?? "E-mail não informado"}
                    </p>
                  </div>
                  {item.id && (
                    <ChevronRight
                      aria-hidden="true"
                      className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                    />
                  )}
                </CardHeader>
                <CardContent className="pointer-events-none relative z-[1] flex flex-wrap gap-1 px-5">
                  {item.roles.map((role, roleIndex) => (
                    <Badge key={role.id ?? roleIndex} variant="outline">
                      {getRoleLabel(role)}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {query.data && (
          <Pagination
            disabled={query.isFetching}
            itemLabel="contas"
            onPageChange={setPage}
            page={query.data.page ?? page}
            totalElements={query.data.totalElements ?? items.length}
            totalPages={query.data.totalPages ?? 0}
          />
        )}
      </section>

      <AccountDetailsDialog
        account={selectedAccount}
        onClose={() => setSelectedAccount(null)}
      />
    </div>
  );
}
