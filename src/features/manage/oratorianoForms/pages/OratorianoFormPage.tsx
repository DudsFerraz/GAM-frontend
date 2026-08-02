import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/AsyncState'
import { Button } from '@/components/ui/Button'
import {
  useAccountInfo,
  useAccountPermissions,
} from '@/features/account'
import {
  getOratorianoFullName,
  useOratoriano,
} from '@/features/manage/oratorianos'
import { isForbiddenError, isNotFoundError } from '@/lib/http'

import { OratorianoFormEditor } from '../components/OratorianoFormEditor'
import {
  OratorianoFormExitDialog,
  OratorianoFormPageState,
} from '../components/OratorianoFormPageFeedback'
import { OratorianoFormReadOnly } from '../components/OratorianoFormReadOnly'
import {
  useOratorianoFormDetail,
} from '../hooks/useOratorianoForms'
import { useOratorianoFormWorkspace } from '../hooks/useOratorianoFormWorkspace'
import { InvalidOratorianoFormDataError } from '../parseFormDetail'

type OratorianoFormPageProps = {
  formId: string
  openedExplicitly?: boolean
  oratorianoId: string
}

export function OratorianoFormPage({
  formId,
  openedExplicitly = true,
  oratorianoId,
}: OratorianoFormPageProps) {
  const { account } = useAccountInfo()
  const { permissions } = useAccountPermissions(account)
  const canView = permissions.includes('ORATORIANO_FORM_GET')
  const canManage = canView && permissions.includes('ORATORIANO_FORM_MANAGE')
  const canGeneratePdf = canView
    && permissions.includes('ORATORIANO_FORM_PDF_GENERATE')
  const canViewProfile = permissions.includes('ORATORIANO_GET')
  const workspace = useOratorianoFormWorkspace({
    canView,
    formId,
    openedExplicitly,
    oratorianoId,
  })
  const detailQuery = useOratorianoFormDetail(
    oratorianoId,
    formId,
    canView,
    openedExplicitly,
    workspace.detailDisabled,
  )
  const profileQuery = useOratoriano(oratorianoId, canViewProfile)
  const [editorWasOpened, setEditorWasOpened] = useState(false)

  useEffect(() => {
    if (canManage && detailQuery.data?.status === 'DRAFT') {
      // Preserve the editor after a conflict response changes the authoritative status.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditorWasOpened(true)
    }
  }, [canManage, detailQuery.data?.status])

  const backLink = (
    <Button asChild size="sm" variant="ghost">
      <Link
        params={{ oratorianoId }}
        to="/manage/oratorios/oratorianos/$oratorianoId"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Voltar ao perfil do Oratoriano
      </Link>
    </Button>
  )
  const exitGuard = (
    <OratorianoFormExitDialog
      blocker={workspace.blocker}
      hasDirtyChanges={workspace.isDirty}
      hasSnapshots={workspace.snapshots.length > 0}
      onConfirmExit={workspace.confirmExit}
    />
  )

  if (!canView || !openedExplicitly) {
    return (
      <>
        {exitGuard}
        <OratorianoFormPageState backLink={backLink}>
          <ForbiddenState description="Sua conta não pode consultar esta ficha adicional." />
        </OratorianoFormPageState>
      </>
    )
  }

  if (detailQuery.isLoading) {
    return (
      <>
        {exitGuard}
        <OratorianoFormPageState backLink={backLink}>
          <LoadingState
            description="O conteúdo protegido será exibido somente nesta página."
            title="Carregando ficha adicional…"
          />
        </OratorianoFormPageState>
      </>
    )
  }

  if (detailQuery.isError) {
    if (isForbiddenError(detailQuery.error)) {
      return (
        <>
          {exitGuard}
          <OratorianoFormPageState backLink={backLink}>
            <ForbiddenState description="Sua conta não pode consultar esta ficha adicional." />
          </OratorianoFormPageState>
        </>
      )
    }

    if (isNotFoundError(detailQuery.error)) {
      return (
        <>
          {exitGuard}
          <OratorianoFormPageState backLink={backLink}>
            <EmptyState
              description="Volte ao perfil para consultar as fichas disponíveis."
              title="Ficha adicional não encontrada."
            />
          </OratorianoFormPageState>
        </>
      )
    }

    const invalidData = detailQuery.error instanceof InvalidOratorianoFormDataError
    return (
      <>
        {exitGuard}
        <OratorianoFormPageState backLink={backLink}>
          <ErrorState
            description={invalidData
              ? 'O conteúdo recebido não pôde ser apresentado com segurança. Tente novamente.'
              : 'Não foi possível carregar esta ficha adicional. Tente novamente.'}
            onRetry={() => void detailQuery.refetch()}
            title={invalidData
              ? 'Não foi possível validar o conteúdo da ficha.'
              : 'Não foi possível consultar a ficha.'}
          />
        </OratorianoFormPageState>
      </>
    )
  }

  if (!detailQuery.data) {
    return (
      <>
        {exitGuard}
        <OratorianoFormPageState backLink={backLink}>
          <EmptyState title="Ficha adicional não encontrada." />
        </OratorianoFormPageState>
      </>
    )
  }

  const form = detailQuery.data
  const formName = getOratorianoFullName(form.data)
  const profileName = profileQuery.data
    ? getOratorianoFullName(profileQuery.data)
    : formName

  if (canManage && (form.status === 'DRAFT' || editorWasOpened)) {
    return (
      <div className="space-y-6">
        {exitGuard}
        {backLink}
        <OratorianoFormEditor
          canGeneratePdf={canGeneratePdf}
          detail={form}
          formId={formId}
          name={profileName}
          onDeleted={workspace.handleDeleted}
          onDirtyChange={workspace.setIsDirty}
          onExitBypassChange={workspace.setIsExitBypass}
          oratorianoId={oratorianoId}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {exitGuard}
      {backLink}
      <OratorianoFormReadOnly
        canGeneratePdf={canGeneratePdf}
        form={form}
        formId={formId}
        name={profileName}
        oratorianoId={oratorianoId}
      />
    </div>
  )
}
