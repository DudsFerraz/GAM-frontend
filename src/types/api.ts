export interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export type PageParams = {
    page?: number;
    size?: number;
    sort?: string[];
}

export type SpecificationFilter = {
    field: string;
    value: string;
    comparationMethod: string; // EQUALS | LIKE | GREATER_THAN_OR_EQUAL | LESS_THAN_OR_EQUAL | IN
}

export type SearchDTO = {
  filters: Array<SpecificationFilter>;
}