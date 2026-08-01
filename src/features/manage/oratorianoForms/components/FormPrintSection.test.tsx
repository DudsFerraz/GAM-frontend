import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SafeHttpError } from '@/lib/http'

import { FormPrintSection } from './FormPrintSection'

const hookMocks = vi.hoisted(() => ({
  create: vi.fn(),
  download: vi.fn(),
  snapshots: vi.fn(),
}))

vi.mock('../hooks/useOratorianoForms', () => ({
  useCreateOratorianoFormPrintSnapshot: hookMocks.create,
  useDownloadOratorianoFormPdf: hookMocks.download,
  useOratorianoFormSnapshots: hookMocks.snapshots,
}))

const snapshot = {
  draftRevision: 7,
  generatedAt: '2026-08-01T12:30:00Z',
  id: 'snapshot-id',
  mode: 'PREFILLED',
}

function renderSection(overrides: Partial<ComponentProps<typeof FormPrintSection>> = {}) {
  return render(
    <FormPrintSection
      canGenerate
      currentRevision={7}
      formId="form-id"
      isDirty={false}
      name="Marina Alves"
      oratorianoId="oratoriano-id"
      origin="DIRECT_SYSTEM_ENTRY"
      {...overrides}
    />,
  )
}

beforeEach(() => {
  hookMocks.create.mockReset()
  hookMocks.download.mockReset()
  hookMocks.snapshots.mockReset()
  hookMocks.snapshots.mockReturnValue([])
  hookMocks.create.mockReturnValue({
    error: null,
    isError: false,
    isPending: false,
    mutate: vi.fn(),
    reset: vi.fn(),
  })
  hookMocks.download.mockReturnValue({
    error: null,
    isError: false,
    isPending: false,
    mutate: vi.fn(),
    reset: vi.fn(),
  })
})

describe('FormPrintSection', () => {
  it('bloqueia a geração de preenchimento no sistema quando há alterações locais', () => {
    renderSection({ isDirty: true })

    expect(screen.getByText('Salve o rascunho antes de gerar.'))
      .toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gerar e baixar PDF' }))
      .toBeDisabled()
  })

  it('permite a transcrição de papel mesmo com edição local', async () => {
    const user = userEvent.setup()
    const mutate = vi.fn()
    hookMocks.create.mockReturnValue({
      error: null,
      isError: false,
      isPending: false,
      mutate,
      reset: vi.fn(),
    })

    renderSection({ isDirty: true, origin: 'PAPER_TRANSCRIPTION' })
    await user.click(screen.getByRole('button', { name: 'Gerar e baixar PDF' }))

    expect(mutate).toHaveBeenCalledOnce()
  })

  it('dispara o download imediatamente após criar o documento', async () => {
    const user = userEvent.setup()
    const createMutate = vi.fn((_variables, options) => {
      options.onSuccess(snapshot)
    })
    const downloadMutate = vi.fn()
    hookMocks.create.mockReturnValue({
      error: null,
      isError: false,
      isPending: false,
      mutate: createMutate,
      reset: vi.fn(),
    })
    hookMocks.download.mockReturnValue({
      error: null,
      isError: false,
      isPending: false,
      mutate: downloadMutate,
      reset: vi.fn(),
    })

    renderSection()
    await user.click(screen.getByRole('button', { name: 'Gerar e baixar PDF' }))

    expect(createMutate).toHaveBeenCalledOnce()
    expect(downloadMutate).toHaveBeenCalledWith({
      filename: 'Marina Alves-ficha-revisao-7.pdf',
      printSnapshotId: 'snapshot-id',
    }, expect.any(Object))
  })

  it('preserva o documento e oferece retry somente do download', async () => {
    const user = userEvent.setup()
    const createMutate = vi.fn()
    const downloadMutate = vi.fn()
    hookMocks.snapshots.mockReturnValue([snapshot])
    hookMocks.create.mockReturnValue({
      error: null,
      isError: false,
      isPending: false,
      mutate: createMutate,
      reset: vi.fn(),
    })
    hookMocks.download.mockReturnValue({
      error: new SafeHttpError(503),
      isError: true,
      isPending: false,
      mutate: downloadMutate,
      reset: vi.fn(),
    })

    renderSection()

    expect(screen.getByText('Documento de impressão disponível'))
      .toBeInTheDocument()
    expect(screen.getByText('O documento foi gerado, mas o download falhou.'))
      .toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar download novamente' }))

    expect(createMutate).not.toHaveBeenCalled()
    expect(downloadMutate).toHaveBeenCalledWith({
      filename: 'Marina Alves-ficha-revisao-7.pdf',
      printSnapshotId: 'snapshot-id',
    }, expect.any(Object))
  })
})
