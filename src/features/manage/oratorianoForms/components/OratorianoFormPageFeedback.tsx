import type { ReactNode } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'

export function OratorianoFormPageState({
  backLink,
  children,
}: {
  backLink: ReactNode
  children: ReactNode
}) {
  return <div className="space-y-6">{backLink}{children}</div>
}

export type OratorianoFormExitBlocker = {
  proceed?: () => void
  reset?: () => void
  status: string
}

export function OratorianoFormExitDialog({
  blocker,
  hasDirtyChanges,
  hasSnapshots,
  onConfirmExit,
}: {
  blocker: OratorianoFormExitBlocker
  hasDirtyChanges: boolean
  hasSnapshots: boolean
  onConfirmExit: () => void
}) {
  const hasBoth = hasDirtyChanges && hasSnapshots
  const title = hasBoth
    ? 'Há alterações e documentos temporários nesta ficha.'
    : hasDirtyChanges
      ? 'Existem alterações não salvas.'
      : 'Há um documento temporário nesta ficha.'
  const description = hasBoth
    ? 'Se sair agora, as mudanças não salvas serão descartadas e esta página não poderá reencontrar o documento gerado.'
    : hasDirtyChanges
      ? 'Se sair agora, as mudanças feitas desde o último salvamento serão descartadas.'
      : 'Se sair agora, esta página não poderá reencontrar o documento gerado. Será necessário gerar outro PDF.'

  return (
    <AlertDialog
      onOpenChange={(open) => {
        if (!open && blocker.status === 'blocked') blocker.reset?.()
      }}
      open={blocker.status === 'blocked'}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Permanecer e revisar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              onConfirmExit()
            }}
          >
            Descartar e sair
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
