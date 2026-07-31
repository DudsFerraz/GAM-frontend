import { CheckCircle2, X } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

import {
  getOratorianoProfileNoticePresentation,
  type OratorianoProfileNotice,
} from '../profileNotices'

export function OratorianoProfileNotice({
  notice,
  onDismiss,
}: {
  notice: OratorianoProfileNotice
  onDismiss: () => void
}) {
  const presentation = getOratorianoProfileNoticePresentation(notice)

  return (
    <Alert aria-live="polite" role="status">
      <CheckCircle2 aria-hidden="true" />
      <AlertTitle>{presentation.title}</AlertTitle>
      <AlertDescription className="flex w-full flex-row items-start justify-between gap-3">
        <span>{presentation.description}</span>
        <Button
          aria-label="Dispensar confirmação"
          onClick={onDismiss}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <X aria-hidden="true" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}
