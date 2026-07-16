import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'

type PaginationProps = {
  page: number
  totalPages: number
  totalElements: number
  itemLabel: string
  disabled?: boolean
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  totalPages,
  totalElements,
  itemLabel,
  disabled = false,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav
      aria-label={`Paginação de ${itemLabel}`}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-muted-foreground">
        Página {page + 1} de {totalPages} · {totalElements} {itemLabel}
      </p>
      <div className="flex gap-2">
        <Button
          disabled={disabled || page <= 0}
          onClick={() => onPageChange(page - 1)}
          size="sm"
          type="button"
          variant="outline"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          Anterior
        </Button>
        <Button
          disabled={disabled || page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          size="sm"
          type="button"
          variant="outline"
        >
          Próxima
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  )
}
