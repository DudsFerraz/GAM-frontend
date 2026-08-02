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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { getErrorMessage } from '@/lib/http'

type QuickOratorianoConfirmationDialogProps = {
  canConfirm: boolean
  error: unknown
  fullName: string
  isOpen: boolean
  isPending: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

export function QuickOratorianoConfirmationDialog({
  canConfirm,
  error,
  fullName,
  isOpen,
  isPending,
  onConfirm,
  onOpenChange,
}: QuickOratorianoConfirmationDialogProps) {
  return (
    <AlertDialog
      onOpenChange={onOpenChange}
      open={isOpen && canConfirm}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cadastrar e marcar como presente?</AlertDialogTitle>
          <AlertDialogDescription>
            Será criado um cadastro para {fullName} e a presença será
            registrada nesta mesma operação.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error !== undefined && error !== null && (
          <Alert variant="destructive">
            <AlertTitle>Não foi possível concluir.</AlertTitle>
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            Voltar e conferir
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!canConfirm || isPending}
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
          >
            {isPending ? 'Cadastrando...' : 'Confirmar cadastro e presença'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
