import {
  useDeferredValue,
  useId,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { Check, Search, UserRound } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { getErrorMessage } from "@/lib/http";

import { useSearchMembers } from "../hooks/useSearchMembers";
import {
  getMemberStatusBadgeClassName,
  getMemberStatusLabel,
} from "../presentation";
import type { MemberListItem, SpecificationFilter } from "../types";

type MemberSearchPickerProps = {
  disabled?: boolean;
  includeInactive?: boolean;
  onSelectionClear: () => void;
  onSelect: (member: MemberListItem) => void;
  required?: boolean;
  selectedMemberId?: string;
};

export function MemberSearchPicker({
  disabled = false,
  includeInactive = false,
  onSelectionClear,
  onSelect,
  required = false,
  selectedMemberId,
}: MemberSearchPickerProps) {
  const [search, setSearch] = useState("");
  const searchInputId = useId();
  const normalizedSearch = search.trim();
  const deferredSearch = useDeferredValue(search.trim());
  const isSearchDeferred = normalizedSearch !== deferredSearch;
  const filters = useMemo<SpecificationFilter[]>(() => {
    if (deferredSearch.length < 2) {
      return [];
    }

    return [
      {
        field: deferredSearch.includes("@") ? "email" : "name",
        value: deferredSearch,
        comparisonMethod: "LIKE",
      },
    ];
  }, [deferredSearch]);
  const query = useSearchMembers({
    enabled: !disabled && filters.length > 0,
    filters,
    pageParams: {
      page: 0,
      size: 8,
    },
    showInactive: includeInactive,
  });
  const isLoadingCurrentSearch =
    normalizedSearch.length >= 2 &&
    (isSearchDeferred || query.isLoading || query.isPlaceholderData);
  const isRefreshingCurrentSearch =
    normalizedSearch.length >= 2 &&
    !isSearchDeferred &&
    !query.isLoading &&
    !query.isPlaceholderData &&
    query.isFetching;
  const canShowCurrentResults =
    normalizedSearch.length >= 2 &&
    !isSearchDeferred &&
    !query.isLoading &&
    !query.isPlaceholderData &&
    !query.isError;
  const members = canShowCurrentResults ? (query.data?.items ?? []) : [];

  const changeSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const nextSearch = event.target.value;

    if (nextSearch !== search && selectedMemberId) {
      onSelectionClear();
    }

    setSearch(nextSearch);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={searchInputId} required={required}>Buscar membro</Label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            autoComplete="off"
            disabled={disabled}
            id={searchInputId}
            name="memberSearch"
            onChange={changeSearch}
            placeholder="Digite o nome ou e-mail"
            aria-required={required || undefined}
            required={required || undefined}
            spellCheck={false}
            type="search"
            value={search}
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Digite ao menos dois caracteres e selecione a pessoa correta.
        </p>
      </div>

      {isLoadingCurrentSearch && (
        <p
          aria-live="polite"
          className="text-sm text-muted-foreground"
          role="status"
        >
          Buscando membros…
        </p>
      )}
      {isRefreshingCurrentSearch && (
        <p
          aria-live="polite"
          className="text-sm text-muted-foreground"
          role="status"
        >
          Atualizando resultados…
        </p>
      )}
      {!isSearchDeferred && query.isError && filters.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível buscar membros.</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{getErrorMessage(query.error)}</p>
            <Button
              disabled={query.isFetching}
              onClick={() => void query.refetch()}
              size="sm"
              type="button"
              variant="outline"
            >
              {query.isFetching ? 'Tentando novamente…' : 'Tentar novamente'}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {canShowCurrentResults &&
        filters.length > 0 &&
        members.length === 0 && (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Nenhum membro foi encontrado com essa busca.
          </p>
        )}
      {members.length > 0 && (
        <div
          aria-label="Resultados da busca de membros"
          className="max-h-72 space-y-2 overflow-y-auto"
          role="list"
        >
          {members.map((member) => {
            const selected = selectedMemberId === member.id;
            const fullName = [member.firstName, member.surname]
              .filter(Boolean)
              .join(" ");

            return (
              <div key={member.id} role="listitem">
                <Button
                  aria-pressed={selected}
                  className="h-auto w-full justify-start whitespace-normal p-3 text-left"
                  onClick={() => onSelect(member)}
                  type="button"
                  variant={selected ? "secondary" : "outline"}
                >
                  <UserRound
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">
                      {fullName || "Membro sem nome"}
                    </span>
                    {member.email && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {member.email}
                      </span>
                    )}
                  </span>
                  {member.status && (
                    <Badge
                      className={getMemberStatusBadgeClassName(member.status)}
                      variant="outline"
                    >
                      {getMemberStatusLabel(member.status)}
                    </Badge>
                  )}
                  {selected && (
                    <Check
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-primary"
                    />
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
