import { X } from 'lucide-react'

import { Button } from '@/components/ui/Button'

type SearchClearButtonProps = {
  disabled?: boolean
  onClear: () => void
}

export function SearchClearButton({
  disabled = false,
  onClear,
}: SearchClearButtonProps) {
  return (
    <Button
      aria-label="Limpar busca"
      className="absolute right-2 top-1/2 -translate-y-1/2"
      disabled={disabled}
      onClick={onClear}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      <X aria-hidden="true" className="h-4 w-4" />
    </Button>
  )
}
