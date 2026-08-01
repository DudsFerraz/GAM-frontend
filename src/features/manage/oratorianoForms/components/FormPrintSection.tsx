import {
  Download,
  FileOutput,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react'
import { useId, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getErrorMessage } from '@/lib/http'
import { cn } from '@/lib/utils'

import { buildOratorianoFormPdfFilename } from '../download'
import {
  useCreateOratorianoFormPrintSnapshot,
  useDownloadOratorianoFormPdf,
  useOratorianoFormSnapshots,
} from '../hooks/useOratorianoForms'
import {
  getOratorianoFormOriginLabel,
  getOratorianoFormPrintGeneratedAtLabel,
  getOratorianoFormPrintModeLabel,
  getOratorianoFormPrintRevisionLabel,
  isOratorianoFormPrintSnapshotCurrent,
} from '../presentation'

type FormPrintSectionProps = {
  canGenerate: boolean
  currentRevision?: number | null
  formId: string
  isDirty: boolean
  name: string
  oratorianoId: string
  origin?: string | null
}

export function FormPrintSection({
  canGenerate,
  currentRevision,
  formId,
  isDirty,
  name,
  oratorianoId,
  origin,
}: FormPrintSectionProps) {
  const headingId = useId()
  const snapshots = useOratorianoFormSnapshots(oratorianoId, formId)
  const createMutation = useCreateOratorianoFormPrintSnapshot(
    oratorianoId,
    formId,
  )
  const downloadMutation = useDownloadOratorianoFormPdf(oratorianoId, formId)
  const [downloadedSnapshotId, setDownloadedSnapshotId] = useState<string>()
  const [missingSnapshotId, setMissingSnapshotId] = useState(false)
  const selectedSnapshot = snapshots[snapshots.length - 1]
  const isCurrent = selectedSnapshot
    ? isOratorianoFormPrintSnapshotCurrent({
      currentRevision,
      origin,
      snapshotRevision: selectedSnapshot.draftRevision,
    })
    : true
  const requiresSavedRevision = origin === 'DIRECT_SYSTEM_ENTRY'
  const blockedByUnsavedChanges = requiresSavedRevision && isDirty
  const canStartGeneration = canGenerate
    && !blockedByUnsavedChanges
    && !createMutation.isPending
    && !downloadMutation.isPending

  const downloadSnapshot = (snapshot: typeof selectedSnapshot) => {
    if (!snapshot?.id) return

    downloadMutation.reset()
    setDownloadedSnapshotId(undefined)
    downloadMutation.mutate({
      filename: buildOratorianoFormPdfFilename({
        draftRevision: snapshot.draftRevision,
        generatedAt: snapshot.generatedAt,
        name,
      }),
      printSnapshotId: snapshot.id,
    }, {
      onSuccess: () => setDownloadedSnapshotId(snapshot.id),
    })
  }

  const handleGenerate = () => {
    if (!canStartGeneration) return

    createMutation.reset()
    downloadMutation.reset()
    setDownloadedSnapshotId(undefined)
    setMissingSnapshotId(false)
    createMutation.mutate(undefined, {
      onSuccess: (snapshot) => {
        if (!snapshot.id) {
          setMissingSnapshotId(true)
          return
        }
        downloadSnapshot(snapshot)
      },
    })
  }

  const isGenerating = createMutation.isPending
  const isDownloading = downloadMutation.isPending
  const hasDownloadError = downloadMutation.isError
  const hasCreationError = createMutation.isError

  return (
    <section aria-labelledby={headingId} className="rounded-xl border bg-muted/10 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileOutput aria-hidden="true" className="h-5 w-5 text-primary" />
            <h3 className="font-heading text-lg font-semibold" id={headingId}>
              Impressão da ficha
            </h3>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Gere uma cópia imutável da ficha e baixe o PDF imediatamente.
          </p>
        </div>

        {canGenerate && (
          <Button
            className="shrink-0"
            disabled={!canStartGeneration}
            onClick={handleGenerate}
            type="button"
          >
            {isGenerating || isDownloading
              ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
              : <Download aria-hidden="true" className="h-4 w-4" />}
            {isGenerating
              ? 'Gerar e baixar PDF — gerando…'
              : isDownloading
                ? 'Gerar e baixar PDF — baixando…'
                : 'Gerar e baixar PDF'}
          </Button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {!canGenerate && (
          <p className="rounded-lg border border-dashed bg-background p-3 text-sm text-muted-foreground">
            A geração de PDF não está disponível para esta conta.
          </p>
        )}

        {blockedByUnsavedChanges && (
          <Alert>
            <AlertTitle>Salve o rascunho antes de gerar.</AlertTitle>
            <AlertDescription>
              O documento precisa representar a revisão que está salva no sistema.
            </AlertDescription>
          </Alert>
        )}

        {hasCreationError && (
          <Alert variant="destructive">
            <AlertTitle>Não foi possível gerar o documento.</AlertTitle>
            <AlertDescription>{getErrorMessage(createMutation.error)}</AlertDescription>
          </Alert>
        )}

        {missingSnapshotId && (
          <Alert variant="destructive">
            <AlertTitle>Não foi possível disponibilizar o download.</AlertTitle>
            <AlertDescription>
              O documento foi gerado, mas não recebemos uma referência válida para baixá-lo. Tente gerar novamente.
            </AlertDescription>
          </Alert>
        )}

        {selectedSnapshot && (
          <div className="rounded-lg border bg-background p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Documento de impressão disponível</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Criado nesta sessão para a ficha de {getOratorianoFormOriginLabel(origin).toLowerCase()}.
                </p>
              </div>
              <Badge
                className={cn(
                  isCurrent
                    ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-200'
                    : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200',
                )}
                variant="outline"
              >
                {isCurrent ? 'Revisão atual' : 'Revisão desatualizada'}
              </Badge>
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <PrintMetadata
                label="Modelo"
                value={getOratorianoFormPrintModeLabel(selectedSnapshot.mode)}
              />
              <PrintMetadata
                label="Revisão"
                value={getOratorianoFormPrintRevisionLabel(selectedSnapshot.draftRevision)}
              />
              <PrintMetadata
                label="Gerado em"
                value={getOratorianoFormPrintGeneratedAtLabel(selectedSnapshot.generatedAt)}
              />
            </dl>

            {!isCurrent && (
              <p className="mt-4 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
                O PDF continua disponível, mas não representa a revisão mais recente. Gere outro depois de salvar a ficha.
              </p>
            )}

            {hasDownloadError && (
              <Alert className="mt-4" variant="destructive">
                <AlertTitle>O documento foi gerado, mas o download falhou.</AlertTitle>
                <AlertDescription>
                  {getErrorMessage(downloadMutation.error)}
                </AlertDescription>
              </Alert>
            )}

            {selectedSnapshot.id
              && downloadedSnapshotId === selectedSnapshot.id
              && !hasDownloadError && (
              <p
                aria-live="polite"
                className="mt-4 text-sm font-medium text-green-700 dark:text-green-300"
                role="status"
              >
                PDF baixado com sucesso.
              </p>
            )}

            {selectedSnapshot.id && (
              <Button
                className="mt-4"
                disabled={isDownloading}
                onClick={() => downloadSnapshot(selectedSnapshot)}
                type="button"
                variant="outline"
              >
                {isDownloading
                  ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                  : hasDownloadError
                    ? <RefreshCw aria-hidden="true" className="h-4 w-4" />
                    : <Download aria-hidden="true" className="h-4 w-4" />}
                {isDownloading ? 'Baixando PDF…' : hasDownloadError ? 'Tentar download novamente' : 'Baixar PDF novamente'}
              </Button>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Este documento e seus dados de geração ficam disponíveis somente enquanto esta página permanecer aberta. Depois de recarregar, será necessário gerar outro PDF.
        </p>
      </div>
    </section>
  )
}

function PrintMetadata({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words font-medium">{value}</dd>
    </div>
  )
}
