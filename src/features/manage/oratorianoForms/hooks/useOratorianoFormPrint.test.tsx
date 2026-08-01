import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { oratorianoFormQueryKeys } from '../queryKeys'
import { downloadBlob } from '../download'
import {
  useCreateOratorianoFormPrintSnapshot,
  useDownloadOratorianoFormPdf,
  useOratorianoFormSnapshots,
} from './useOratorianoForms'

const apiMocks = vi.hoisted(() => ({
  createOratorianoFormPrintSnapshot: vi.fn(),
  downloadOratorianoFormPdf: vi.fn(),
}))

vi.mock('../api/oratorianoForms', () => apiMocks)
vi.mock('../download', async (importOriginal) => {
  const original = await importOriginal<typeof import('../download')>()
  return { ...original, downloadBlob: vi.fn() }
})

function createHarness() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

const snapshot = {
  draftRevision: 7,
  generatedAt: '2026-08-01T12:30:00Z',
  id: 'snapshot-id',
  mode: 'PREFILLED',
}

beforeEach(() => {
  apiMocks.createOratorianoFormPrintSnapshot.mockReset()
  apiMocks.downloadOratorianoFormPdf.mockReset()
  vi.mocked(downloadBlob).mockReset()
})

describe('hooks do documento de impressão', () => {
  it('lê somente o cache de memória na chave exata, sem query function', () => {
    const { queryClient, wrapper } = createHarness()
    const key = oratorianoFormQueryKeys.snapshots('oratoriano-id', 'form-id')
    queryClient.setQueryData(key, [snapshot])

    const { result } = renderHook(
      () => useOratorianoFormSnapshots('oratoriano-id', 'form-id'),
      { wrapper },
    )

    expect(result.current).toEqual([snapshot])
    expect(queryClient.getQueryCache().find({ exact: true, queryKey: key }))
      .toBeDefined()
  })

  it('semeia o snapshot criado na memória e não cria uma lista remota', async () => {
    apiMocks.createOratorianoFormPrintSnapshot.mockResolvedValueOnce(snapshot)
    const { queryClient, wrapper } = createHarness()
    const { result } = renderHook(
      () => useCreateOratorianoFormPrintSnapshot('oratoriano-id', 'form-id'),
      { wrapper },
    )

    act(() => result.current.mutate())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(queryClient.getQueryData(
      oratorianoFormQueryKeys.snapshots('oratoriano-id', 'form-id'),
    )).toEqual([snapshot])
  })

  it('baixa o blob sem colocar o arquivo no cache', async () => {
    const blob = new Blob(['pdf'], { type: 'application/pdf' })
    apiMocks.downloadOratorianoFormPdf.mockResolvedValueOnce(blob)
    const { queryClient, wrapper } = createHarness()
    const { result } = renderHook(
      () => useDownloadOratorianoFormPdf('oratoriano-id', 'form-id'),
      { wrapper },
    )

    act(() => result.current.mutate({
      filename: 'Marina-ficha-revisao-7.pdf',
      printSnapshotId: 'snapshot-id',
    }))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiMocks.downloadOratorianoFormPdf).toHaveBeenCalledWith(
      'oratoriano-id',
      'form-id',
      'snapshot-id',
    )
    expect(vi.mocked(downloadBlob)).toHaveBeenCalledWith(
      blob,
      'Marina-ficha-revisao-7.pdf',
    )
    expect(queryClient.getQueryCache().findAll()).toHaveLength(0)
  })
})
