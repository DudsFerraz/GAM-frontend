export type FilterInputType = 'text' | 'date' | 'select';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FieldConfig {
  key: string;            
  label: string;          
  inputType: FilterInputType;
  options?: FilterOption[]; 
  allowedOperators?: string[];
  filterable?: boolean;   
  sortable?: boolean;  
}

export type SortDirection = 'ASC' | 'DESC';

export type SortCriteria = {
  field: string;
  direction: SortDirection;
};
