import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

import { useAuth } from '../hooks/useAuth'

export function UnconfirmedLogoutWarning() {
  const { dismissUnconfirmedLogout, hasUnconfirmedLogout } = useAuth()

  if (!hasUnconfirmedLogout) return null

  return (
    <Alert className="mb-6">
      <AlertTitle>Não foi possível confirmar a saída.</AlertTitle>
      <AlertDescription>
        <p>
          Encerramos o acesso neste dispositivo.
        </p>
        <Button onClick={dismissUnconfirmedLogout} size="sm" type="button" variant="outline">
          Entendi
        </Button>
      </AlertDescription>
    </Alert>
  )
}
