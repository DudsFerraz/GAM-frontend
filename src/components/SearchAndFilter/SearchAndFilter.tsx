import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Filter,
  Plus,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { SearchClearButton } from "@/components/SearchClearButton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";

import type {
  ComparisonMethod,
  FieldConfig,
  SearchAndFilterProps,
  SearchFilter,
  SearchFilterValue,
  SortCriteria,
} from "./types";

const OPERATOR_LABELS: Record<ComparisonMethod, string> = {
  EQUALS: "Igual a",
  LIKE: "Contém",
  GREATER_THAN_OR_EQUAL: "Maior ou igual a",
  LESS_THAN_OR_EQUAL: "Menor ou igual a",
  IN: "Inclui",
};

const EMPTY_OPTION_LABEL = "Valor não disponível";

function isEmptyValue(value: SearchFilterValue) {
  return Array.isArray(value) ? value.length === 0 : value.trim().length === 0;
}

function getOptionKey(value: SearchFilterValue) {
  return JSON.stringify(value);
}

function formatDateValue(value: string) {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : "Data inválida";
}

function getDefaultOperator(field: FieldConfig): ComparisonMethod {
  if (field.allowedOperators?.[0]) {
    return field.allowedOperators[0];
  }

  return field.inputType === "text" ? "LIKE" : "EQUALS";
}

export function SearchAndFilter({
  config,
  mainFilterField,
  onSearch,
  className,
}: SearchAndFilterProps) {
  const [mainSearchValue, setMainSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeSorts, setActiveSorts] = useState<SortCriteria[]>([]);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const filterableFields = useMemo(
    () => config.filter((field) => field.filterable !== false),
    [config],
  );
  const sortableFields = useMemo(
    () => config.filter((field) => field.sortable !== false),
    [config],
  );
  const [selectedFieldKey, setSelectedFieldKey] = useState(
    filterableFields[0]?.key ?? "",
  );
  const [selectedOperator, setSelectedOperator] = useState<ComparisonMethod>(
    filterableFields[0] ? getDefaultOperator(filterableFields[0]) : "LIKE",
  );
  const [filterValue, setFilterValue] = useState<SearchFilterValue>("");
  const filterPanelId = useId();
  const sortPanelId = useId();
  const onSearchRef = useRef(onSearch);
  const searchState = useMemo(
    () => ({ activeFilters, activeSorts, mainSearchValue }),
    [activeFilters, activeSorts, mainSearchValue],
  );
  const debouncedSearchState = useDebouncedValue(searchState);
  const hasMountedSearchState = useRef(false);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  const currentFieldConfig = useMemo(
    () => config.find((field) => field.key === selectedFieldKey),
    [config, selectedFieldKey],
  );

  useEffect(() => {
    if (!hasMountedSearchState.current) {
      hasMountedSearchState.current = true;
      return;
    }

    const filters = [...debouncedSearchState.activeFilters];
    const normalizedMainSearch = debouncedSearchState.mainSearchValue.trim();

    if (normalizedMainSearch) {
      filters.push({
        field: mainFilterField,
        value: normalizedMainSearch,
        comparisonMethod: "LIKE",
      });
    }

    onSearchRef.current(filters, debouncedSearchState.activeSorts);
  }, [debouncedSearchState, mainFilterField]);

  const availableOperators = useMemo(() => {
    if (!currentFieldConfig) {
      return [];
    }

    if (currentFieldConfig.allowedOperators?.length) {
      return currentFieldConfig.allowedOperators.map((operator) => ({
        key: operator,
        label: OPERATOR_LABELS[operator],
      }));
    }

    if (currentFieldConfig.inputType === "date") {
      return [
        { key: "EQUALS" as const, label: OPERATOR_LABELS.EQUALS },
        {
          key: "GREATER_THAN_OR_EQUAL" as const,
          label: OPERATOR_LABELS.GREATER_THAN_OR_EQUAL,
        },
        {
          key: "LESS_THAN_OR_EQUAL" as const,
          label: OPERATOR_LABELS.LESS_THAN_OR_EQUAL,
        },
      ];
    }

    if (currentFieldConfig.inputType === "select") {
      return [{ key: "EQUALS" as const, label: OPERATOR_LABELS.EQUALS }];
    }

    return Object.entries(OPERATOR_LABELS).map(([key, label]) => ({
      key: key as ComparisonMethod,
      label,
    }));
  }, [currentFieldConfig]);

  const mainFilterLabel = useMemo(
    () =>
      config.find((field) => field.key === mainFilterField)?.label ?? "termo",
    [config, mainFilterField],
  );

  const handleFieldChange = (fieldKey: string) => {
    const nextField = config.find((field) => field.key === fieldKey);
    setSelectedFieldKey(fieldKey);
    setSelectedOperator(nextField ? getDefaultOperator(nextField) : "LIKE");
    setFilterValue("");
  };

  const handleFilterValueChange = (value: string) => {
    const selectedOption = currentFieldConfig?.options?.find(
      (option) => getOptionKey(option.value) === value,
    );
    setFilterValue(selectedOption?.value ?? value);
  };

  const handleAddFilter = () => {
    if (!selectedFieldKey || isEmptyValue(filterValue)) {
      return;
    }

    setActiveFilters((previous) => [
      ...previous,
      {
        field: selectedFieldKey,
        value: filterValue,
        comparisonMethod: selectedOperator,
      },
    ]);
    setFilterValue("");
  };

  const handleRemoveFilter = (index: number) => {
    setActiveFilters((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const handleToggleSort = (fieldKey: string) => {
    setActiveSorts((previous) => {
      const existing = previous.find((sort) => sort.field === fieldKey);
      return existing
        ? previous.filter((sort) => sort.field !== fieldKey)
        : [...previous, { field: fieldKey, direction: "ASC" }];
    });
  };

  const handleChangeSortDirection = (fieldKey: string) => {
    setActiveSorts((previous) =>
      previous.map((sort) =>
        sort.field === fieldKey
          ? {
              ...sort,
              direction: sort.direction === "ASC" ? "DESC" : "ASC",
            }
          : sort,
      ),
    );
  };

  const getFieldLabel = (fieldKey: string) =>
    config.find((field) => field.key === fieldKey)?.label ??
    "Campo não disponível";

  const getDisplayValue = (filter: SearchFilter) => {
    const field = config.find((item) => item.key === filter.field);

    if (field?.inputType === "select" && field.options) {
      const values = Array.isArray(filter.value)
        ? filter.value
        : [filter.value];
      return values
        .map((value) => {
          const option = field.options?.find(
            (item) => getOptionKey(item.value) === getOptionKey(value),
          );
          return option?.label ?? EMPTY_OPTION_LABEL;
        })
        .join(", ");
    }

    if (field?.inputType === "date" && typeof filter.value === "string") {
      return formatDateValue(filter.value);
    }

    return Array.isArray(filter.value) ? filter.value.join(", ") : filter.value;
  };

  const renderValueInput = () => {
    if (!currentFieldConfig) {
      return null;
    }

    if (currentFieldConfig.inputType === "select") {
      return (
        <Select
          aria-label="Valor do filtro"
          onChange={(event) => handleFilterValueChange(event.target.value)}
          value={isEmptyValue(filterValue) ? "" : getOptionKey(filterValue)}
        >
          <option value="" disabled>
            Selecione...
          </option>
          {currentFieldConfig.options?.map((option) => (
            <option
              key={getOptionKey(option.value)}
              value={getOptionKey(option.value)}
            >
              {option.label}
            </option>
          ))}
        </Select>
      );
    }

    return (
      <Input
        aria-label="Valor do filtro"
        onChange={(event) => setFilterValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleAddFilter();
          }
        }}
        placeholder="Digite o valor..."
        type={currentFieldConfig.inputType}
        value={typeof filterValue === "string" ? filterValue : ""}
      />
    );
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label={`Pesquisa rápida por ${mainFilterLabel}`}
            className={cn(
              "w-full pl-9",
              mainSearchValue && "pr-10",
            )}
            onChange={(event) => setMainSearchValue(event.target.value)}
            placeholder={`Pesquisa rápida por ${mainFilterLabel}...`}
            type="search"
            value={mainSearchValue}
          />
          {mainSearchValue && (
            <SearchClearButton onClear={() => setMainSearchValue("")} />
          )}
        </div>

        {(filterableFields.length > 0 || sortableFields.length > 0) && (
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            {filterableFields.length > 0 && (
              <Button
                aria-controls={filterPanelId}
                aria-expanded={isFilterOpen}
                className={cn(
                  "w-full gap-2 sm:w-auto",
                  isFilterOpen && "bg-secondary text-secondary-foreground",
                )}
                onClick={() => {
                  setIsFilterOpen((open) => !open);
                  setIsSortOpen(false);
                }}
                type="button"
                variant="outline"
              >
                <Filter aria-hidden="true" className="h-4 w-4" />
                <span>Filtrar</span>
                {activeFilters.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                    {activeFilters.length}
                  </span>
                )}
              </Button>
            )}

            {sortableFields.length > 0 && (
              <Button
                aria-controls={sortPanelId}
                aria-expanded={isSortOpen}
                className={cn(
                  "w-full gap-2 sm:w-auto",
                  isSortOpen && "bg-secondary text-secondary-foreground",
                )}
                onClick={() => {
                  setIsSortOpen((open) => !open);
                  setIsFilterOpen(false);
                }}
                type="button"
                variant="outline"
              >
                <ArrowUpDown aria-hidden="true" className="h-4 w-4" />
                <span>Ordenar</span>
                {activeSorts.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                    {activeSorts.length}
                  </span>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {isFilterOpen && filterableFields.length > 0 && (
        <div
          className="rounded-lg border border-border bg-card p-4 shadow-sm"
          id={filterPanelId}
        >
          <h4 className="mb-3 text-sm font-medium text-foreground">
            Novo filtro
          </h4>
          <div className="mb-4 flex flex-col items-end gap-2 sm:flex-row">
            <div className="w-full sm:w-1/3">
              <label className="mb-1 block text-xs text-muted-foreground">
                Campo
              </label>
              <Select
                aria-label="Campo do filtro"
                onChange={(event) => handleFieldChange(event.target.value)}
                value={selectedFieldKey}
              >
                {filterableFields.map((field) => (
                  <option key={field.key} value={field.key}>
                    {field.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="w-full sm:w-1/4">
              <label className="mb-1 block text-xs text-muted-foreground">
                Condição
              </label>
              <Select
                aria-label="Condição do filtro"
                onChange={(event) =>
                  setSelectedOperator(event.target.value as ComparisonMethod)
                }
                value={selectedOperator}
              >
                {availableOperators.map((operator) => (
                  <option key={operator.key} value={operator.key}>
                    {operator.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="w-full flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">
                Valor
              </label>
              {renderValueInput()}
            </div>

            <Button
              aria-label="Adicionar filtro"
              className="shrink-0"
              onClick={handleAddFilter}
              size="icon"
              type="button"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
            {activeFilters.length === 0 && (
              <p className="text-sm italic text-muted-foreground">
                Nenhum filtro aplicado.
              </p>
            )}
            {activeFilters.map((filter, index) => (
              <div
                className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-1 text-sm"
                key={`${filter.field}-${index}`}
              >
                <span className="font-medium text-foreground">
                  {getFieldLabel(filter.field)}
                </span>
                <span className="text-xs lowercase text-muted-foreground">
                  {OPERATOR_LABELS[filter.comparisonMethod]}
                </span>
                <span className="font-bold">{getDisplayValue(filter)}</span>
                <Button
                  aria-label={`Remover filtro de ${getFieldLabel(filter.field)}`}
                  className="ml-1 h-auto p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveFilter(index)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X aria-hidden="true" className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isSortOpen && sortableFields.length > 0 && (
        <div
          className="rounded-lg border border-border bg-card p-4 shadow-sm"
          id={sortPanelId}
        >
          <h4 className="mb-3 text-sm font-medium text-foreground">
            Ordenar resultados
          </h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sortableFields.map((field) => {
              const activeSort = activeSorts.find(
                (sort) => sort.field === field.key,
              );
              const isSelected = Boolean(activeSort);
              const sortIndex =
                activeSorts.findIndex((sort) => sort.field === field.key) + 1;

              return (
                <div
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-md border p-2 transition-all",
                    isSelected
                      ? "border-primary/50 bg-primary/5 shadow-sm"
                      : "border-transparent hover:bg-secondary/50",
                  )}
                  key={field.key}
                  onClick={() => handleToggleSort(field.key)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleToggleSort(field.key);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-3">
                    <div
                      aria-hidden="true"
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input",
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span
                      className={cn("text-sm", isSelected && "font-medium")}
                    >
                      {field.label}
                    </span>
                  </div>

                  {isSelected && activeSort && (
                    <div
                      className="flex items-center gap-2"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Button
                        className="h-auto gap-1 px-1.5 py-0.5 text-[10px] uppercase"
                        onClick={() => handleChangeSortDirection(field.key)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        {activeSort.direction === "ASC" ? (
                          <ArrowUp aria-hidden="true" className="h-3 w-3" />
                        ) : (
                          <ArrowDown aria-hidden="true" className="h-3 w-3" />
                        )}
                        {activeSort.direction === "ASC" ? "Cresc." : "Decresc."}
                      </Button>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-secondary text-xs font-bold text-secondary-foreground">
                        {sortIndex}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
