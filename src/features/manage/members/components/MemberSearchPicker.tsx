import { useDeferredValue, useMemo, useState } from "react";
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
  onSelect: (member: MemberListItem) => void;
  selectedMemberId?: string;
};

export function MemberSearchPicker({
  disabled = false,
  includeInactive = false,
  onSelect,
  selectedMemberId,
}: MemberSearchPickerProps) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const filters = useMemo<SpecificationFilter[]>(() => {
    if (deferredSearch.length < 2) {
      return [];
    }

    return [
      {
        field: deferredSearch.includes("@") ? "email" : "name",
        value: deferredSearch,
        comparationMethod: "LIKE",
      },
    ];
  }, [deferredSearch]);
  const query = useSearchMembers({
    enabled: !disabled && filters.length > 0,
    filters,
    pageParams: {
      page: 0,
      size: 8,
      sort: ["firstName,asc", "surname,asc"],
    },
    showInactive: includeInactive,
  });
  const members = filters.length > 0 ? (query.data?.items ?? []) : [];

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="presence-member-search">Buscar membro</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            disabled={disabled}
            id="presence-member-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Digite o nome ou e-mail"
            value={search}
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Digite ao menos dois caracteres e selecione a pessoa correta.
        </p>
      </div>

      {query.isLoading && (
        <p className="text-sm text-muted-foreground">Buscando membros...</p>
      )}
      {query.isError && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível buscar membros.</AlertTitle>
          <AlertDescription>{getErrorMessage(query.error)}</AlertDescription>
        </Alert>
      )}
      {!query.isLoading &&
        !query.isError &&
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
                  <UserRound className="h-4 w-4 shrink-0" />
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
                    <Check className="h-4 w-4 shrink-0 text-primary" />
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
