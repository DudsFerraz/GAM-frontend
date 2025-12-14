import { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, X, Plus, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Input } from '@/components/ui/index';
import type { SpecificationFilter } from '@/types/api';

export type SortDirection = 'ASC' | 'DESC';

export type SortCriteria = {
  field: string;
  direction: SortDirection;
};

const COMPARISON_LABELS: Record<string, string> = {
  EQUALS: 'Igual a',
  LIKE: 'Contém',
  GREATER_THAN_OR_EQUAL: 'Maior ou igual a',
  LESS_THAN_OR_EQUAL: 'Menor ou igual a',
  IN: 'Inclui',
};

const SORT_LABELS: Record<string, string> = {
  ASC: 'Crescente',
  DESC: 'Decrescente',
};

interface SearchAndFilterProps {
  fields: string[];
  mainFilterField: string;
  onSearch: (filters: SpecificationFilter[], sorts: SortCriteria[]) => void;
  className?: string;
}

export const SearchAndFilter = ({
  fields,
  mainFilterField,
  onSearch,
  className
}: SearchAndFilterProps) => {
  const [mainSearchValue, setMainSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<SpecificationFilter[]>([]);
  const [activeSorts, setActiveSorts] = useState<SortCriteria[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [newFilterField, setNewFilterField] = useState(fields[0]);
  const [newFilterMethod, setNewFilterMethod] = useState<string>('EQUALS');
  const [newFilterValue, setNewFilterValue] = useState('');

  useEffect(() => {
    const filters: SpecificationFilter[] = [...activeFilters];
    
    if (mainSearchValue.trim()) {
      filters.push({
        field: mainFilterField,
        value: mainSearchValue,
        comparationMethod: 'IN'
      });
    }

    const timer = setTimeout(() => {
      onSearch(filters, activeSorts);
    }, 500);

    return () => clearTimeout(timer);
  }, [mainSearchValue, activeFilters, activeSorts, mainFilterField]); // Remove onSearch das dependências para evitar loops se a função não for memoizada

  const handleAddFilter = () => {
    if (!newFilterValue.trim()) return;

    const newFilter: SpecificationFilter = {
      field: newFilterField,
      value: newFilterValue,
      comparationMethod: newFilterMethod,
    };

    setActiveFilters((prev) => [...prev, newFilter]);
    setNewFilterValue('');
  };

  const handleRemoveFilter = (index: number) => {
    setActiveFilters((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleSort = (field: string) => {
    setActiveSorts((prev) => {
      const existingIndex = prev.findIndex((s) => s.field === field);
      
      if (existingIndex >= 0) {
        return prev.filter((s) => s.field !== field);
      } else {
        return [...prev, { field, direction: 'ASC' }];
      }
    });
  };

  const handleChangeSortDirection = (field: string) => {
    setActiveSorts((prev) => 
      prev.map((s) => 
        s.field === field 
          ? { ...s, direction: s.direction === 'ASC' ? 'DESC' : 'ASC' } 
          : s
      )
    );
  };

  const getSortOrderIndex = (field: string) => {
    const index = activeSorts.findIndex((s) => s.field === field);
    return index >= 0 ? index + 1 : null;
  };

  const getSortDirection = (field: string) => {
    return activeSorts.find((s) => s.field === field)?.direction;
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={`Pesquisar por ${mainFilterField}...`}
            value={mainSearchValue}
            onChange={(e) => setMainSearchValue(e.target.value)}
            className="pl-9 w-full bg-card border-border" 
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => { setIsFilterOpen(!isFilterOpen); setIsSortOpen(false); }}
            className={cn("gap-2 border-border", isFilterOpen && "bg-secondary text-secondary-foreground")}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtrar</span>
            {activeFilters.length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                {activeFilters.length}
              </span>
            )}
          </Button>

          <Button 
            variant="outline" 
            onClick={() => { setIsSortOpen(!isSortOpen); setIsFilterOpen(false); }}
            className={cn("gap-2 border-border", isSortOpen && "bg-secondary text-secondary-foreground")}
          >
            <ArrowUpDown className="h-4 w-4" />
            <span className="hidden sm:inline">Ordenar</span>
            {activeSorts.length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                {activeSorts.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="p-4 rounded-lg border border-border bg-card shadow-sm animate-in slide-in-from-top-2 duration-200">
          <h4 className="font-medium text-sm mb-3 text-foreground">Filtros Avançados</h4>
          
          <div className="flex flex-col sm:flex-row gap-2 mb-4 items-end">
            <div className="w-full sm:w-1/4">
              <label className="text-xs text-muted-foreground mb-1 block">Campo</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={newFilterField}
                onChange={(e) => setNewFilterField(e.target.value)}
              >
                {fields.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            
            <div className="w-full sm:w-1/4">
              <label className="text-xs text-muted-foreground mb-1 block">Condição</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={newFilterMethod}
                onChange={(e) => setNewFilterMethod(e.target.value)}
              >
                {Object.entries(COMPARISON_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="w-full sm:flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Valor</label>
              <Input 
                value={newFilterValue}
                onChange={(e) => setNewFilterValue(e.target.value)}
                placeholder="Digite o valor..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddFilter()}
              />
            </div>

            <Button onClick={handleAddFilter} size="icon" className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeFilters.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Nenhum filtro extra aplicado.</p>
            )}
            {activeFilters.map((filter, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-secondary/50 text-secondary-foreground px-3 py-1 rounded-md text-sm border border-border">
                <span className="font-medium text-foreground">{filter.field}</span>
                <span className="text-muted-foreground text-xs">{COMPARISON_LABELS[filter.comparationMethod]}</span>
                <span className="font-bold">{filter.value}</span>
                <button onClick={() => handleRemoveFilter(idx)} className="text-muted-foreground hover:text-destructive transition-colors ml-1">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isSortOpen && (
        <div className="p-4 rounded-lg border border-border bg-card shadow-sm animate-in slide-in-from-top-2 duration-200">
          <h4 className="font-medium text-sm mb-3 text-foreground">Ordenar por</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {fields.map((field) => {
              const orderIndex = getSortOrderIndex(field);
              const direction = getSortDirection(field);
              const isSelected = orderIndex !== null;

              return (
                <div 
                  key={field} 
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md border transition-all",
                    isSelected 
                      ? "border-primary/50 bg-primary/5 shadow-sm" 
                      : "border-transparent hover:bg-secondary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleSort(field)}
                      className={cn(
                        "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                        isSelected 
                          ? "bg-primary border-primary text-primary-foreground" 
                          : "border-input bg-background hover:border-primary/50"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </button>
                    <span className={cn("text-sm", isSelected ? "font-medium text-foreground" : "text-muted-foreground")}>
                      {field}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleChangeSortDirection(field)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground bg-background border border-border px-2 py-1 rounded cursor-pointer select-none"
                      >
                         {direction === 'ASC' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                         {SORT_LABELS[direction || 'ASC']}
                      </button>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground border border-border">
                        {orderIndex}
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
};