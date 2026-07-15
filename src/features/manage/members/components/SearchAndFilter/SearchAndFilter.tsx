import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Filter, ArrowUpDown, X, Plus, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ComparationMethod, SpecificationFilter } from '../../types';
import type { FieldConfig, SortCriteria } from './types';

const ALL_OPERATORS: Record<string, string> = {
  EQUALS: 'Igual a',
  LIKE: 'Contém',
  GREATER_THAN_OR_EQUAL: 'Maior ou igual a',
  LESS_THAN_OR_EQUAL: 'Menor ou igual a',
  IN: 'Inclui',
};

interface SearchAndFilterProps {
  config: FieldConfig[];
  mainFilterField: string;
  onSearch: (filters: SpecificationFilter[], sorts: SortCriteria[]) => void;
  className?: string;
}

export const SearchAndFilter = ({
  config,
  mainFilterField,
  onSearch,
  className
}: SearchAndFilterProps) => {
  const [mainSearchValue, setMainSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<SpecificationFilter[]>([]);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeSorts, setActiveSorts] = useState<SortCriteria[]>([]);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filterableFields = useMemo(() => config.filter(c => c.filterable !== false), [config]);
  const [selectedFieldKey, setSelectedFieldKey] = useState(filterableFields[0]?.key || '');
  
  const [selectedOperator, setSelectedOperator] = useState<ComparationMethod>('EQUALS');
  const [filterValue, setFilterValue] = useState('');

  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  const currentFieldConfig = useMemo(
    () => config.find(c => c.key === selectedFieldKey), 
    [selectedFieldKey, config]
  );


  useEffect(() => {
    const filters: SpecificationFilter[] = [...activeFilters];
    
    if (mainSearchValue.trim()) {
      filters.push({
        field: mainFilterField,
        value: mainSearchValue,
        comparationMethod: 'LIKE'
      });
    }

    const timer = setTimeout(() => {
      onSearchRef.current(filters, activeSorts);
    }, 500);

    return () => clearTimeout(timer);
  }, [mainSearchValue, activeFilters, activeSorts, mainFilterField]);

  const handleFieldChange = (newFieldKey: string) => {
    setSelectedFieldKey(newFieldKey);
    
    const newConfig = config.find(c => c.key === newFieldKey);
    if (newConfig) {
      const defaultOp = (newConfig.allowedOperators?.[0] as ComparationMethod) 
        || (newConfig.inputType === 'text' ? 'LIKE' : 'EQUALS');
      
      setSelectedOperator(defaultOp);
      setFilterValue('');
    }
  };

  const handleAddFilter = () => {
    if (!filterValue.trim()) return;

    const newFilter: SpecificationFilter = {
      field: selectedFieldKey,
      value: filterValue,
      comparationMethod: selectedOperator,
    };

    setActiveFilters((prev) => [...prev, newFilter]);
    setFilterValue('');
  };

  const handleRemoveFilter = (index: number) => {
    setActiveFilters((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleSort = (fieldKey: string) => {
    setActiveSorts((prev) => {
      const existing = prev.find((s) => s.field === fieldKey);
      if (existing) return prev.filter((s) => s.field !== fieldKey);
      return [...prev, { field: fieldKey, direction: 'ASC' }];
    });
  };

  const handleChangeSortDirection = (fieldKey: string) => {
    setActiveSorts((prev) => 
      prev.map((s) => s.field === fieldKey 
        ? { ...s, direction: s.direction === 'ASC' ? 'DESC' : 'ASC' } 
        : s
      )
    );
  };

  const renderValueInput = () => {
    if (!currentFieldConfig) return null;

    if (currentFieldConfig.inputType === 'select') {
      return (
        <select
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
        >
          <option value="" disabled>Selecione...</option>
          {currentFieldConfig.options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    if (currentFieldConfig.inputType === 'date') {
        return (
          <Input 
            type="date"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="bg-background text-foreground"
          />
        );
    }

    return (
      <Input 
        type="text"
        placeholder="Digite o valor..."
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAddFilter()}
        className="bg-background text-foreground placeholder:text-muted-foreground"
      />
    );
  };

  const availableOperators = useMemo(() => {
    if (!currentFieldConfig) return [];
    
    if (currentFieldConfig.allowedOperators) {
      return currentFieldConfig.allowedOperators.map(op => ({ key: op, label: ALL_OPERATORS[op] }));
    }
    
    if (currentFieldConfig.inputType === 'date') {
       return [
         { key: 'EQUALS', label: 'Igual a' },
         { key: 'GREATER_THAN_OR_EQUAL', label: 'Maior ou igual a' },
         { key: 'LESS_THAN_OR_EQUAL', label: 'Menor ou igual a' }
       ];
    }
    
    if (currentFieldConfig.inputType === 'select') {
        return [{ key: 'EQUALS', label: 'Igual a' }];
    }

    return Object.entries(ALL_OPERATORS).map(([key, label]) => ({ key, label }));

  }, [currentFieldConfig]);

  const getFieldLabel = (key: string) => config.find(c => c.key === key)?.label || key;

  const getDisplayValue = (filter: SpecificationFilter) => {
    const conf = config.find(c => c.key === filter.field);
    if (conf?.inputType === 'select' && conf.options) {
      return conf.options.find(o => o.value === filter.value)?.label || filter.value;
    }
    if (conf?.inputType === 'date') {
        try {
            const [y, m, d] = filter.value.split('-');
            return `${d}/${m}/${y}`;
        } catch { return filter.value; }
    }
    return filter.value;
  }

  const mainFilterLabel = useMemo(() => {
    const field = config.find(c => c.key === mainFilterField);
    return field ? field.label : mainFilterField;
  }, [config, mainFilterField]);

  return (
    <div className={cn("w-full space-y-4", className)}>
      
      {/* BARRA SUPERIOR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={`Pesquisa rápida por ${mainFilterLabel}...`} 
            value={mainSearchValue}
            onChange={(e) => setMainSearchValue(e.target.value)}
            className="pl-9 w-full bg-card border-border text-foreground placeholder:text-muted-foreground" 
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

      {/* PAINEL DE FILTROS */}
      {isFilterOpen && (
        <div className="p-4 rounded-lg border border-border bg-card shadow-sm animate-in slide-in-from-top-2 duration-200">
          <h4 className="font-medium text-sm mb-3 text-foreground">Novo Filtro</h4>
          
          <div className="flex flex-col sm:flex-row gap-2 mb-4 items-end">
            
            {/* 1. Seleção do Campo */}
            <div className="w-full sm:w-1/3">
              <label className="text-xs text-muted-foreground mb-1 block">Campo</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={selectedFieldKey}
                onChange={(e) => handleFieldChange(e.target.value)} 
              >
                {filterableFields.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
            </div>
            
            {/* 2. Seleção do Operador */}
            <div className="w-full sm:w-1/4">
              <label className="text-xs text-muted-foreground mb-1 block">Condição</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value as ComparationMethod)}
              >
                {availableOperators.map(op => (
                  <option key={op.key} value={op.key}>{op.label}</option>
                ))}
              </select>
            </div>

            {/* 3. Input de Valor */}
            <div className="w-full sm:flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Valor</label>
              {renderValueInput()}
            </div>

            <Button onClick={handleAddFilter} size="icon" className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Lista de filtros ativos */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
            {activeFilters.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Nenhum filtro aplicado.</p>
            )}
            {activeFilters.map((filter, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-secondary/50 text-secondary-foreground px-3 py-1 rounded-md text-sm border border-border animate-in fade-in zoom-in-95 duration-200">
                <span className="font-medium text-foreground">{getFieldLabel(filter.field)}</span>
                <span className="text-muted-foreground text-xs lowercase">{ALL_OPERATORS[filter.comparationMethod]}</span>
                <span className="font-bold">{getDisplayValue(filter)}</span>
                <button onClick={() => handleRemoveFilter(idx)} className="text-muted-foreground hover:text-destructive transition-colors ml-1">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAINEL DE ORDENAÇÃO */}
      {isSortOpen && (
        <div className="p-4 rounded-lg border border-border bg-card shadow-sm animate-in slide-in-from-top-2 duration-200">
          <h4 className="font-medium text-sm mb-3 text-foreground">Ordenar resultados</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {config.filter(c => c.sortable !== false).map((field) => {
              const activeSort = activeSorts.find(s => s.field === field.key);
              const isSelected = !!activeSort;
              const index = activeSorts.findIndex(s => s.field === field.key) + 1;

              return (
                <div 
                  key={field.key} 
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md border transition-all cursor-pointer",
                    isSelected 
                      ? "border-primary/50 bg-primary/5 shadow-sm" 
                      : "border-transparent hover:bg-secondary/50"
                  )}
                  onClick={() => handleToggleSort(field.key)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                        isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input"
                      )}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span className={cn("text-sm", isSelected && "font-medium")}>{field.label}</span>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                       <button 
                        onClick={() => handleChangeSortDirection(field.key)}
                        className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground bg-background border border-border px-1.5 py-0.5 rounded uppercase"
                      >
                         {activeSort?.direction === 'ASC' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                         {activeSort?.direction === 'ASC' ? 'Cresc' : 'Decresc'}
                      </button>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground border border-border">
                        {index}
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
