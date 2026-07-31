import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { oratorianoFormQueryKeys } from '../queryKeys'
import {
  clearDisabledOratorianoFormDetail,
  disableOratorianoFormDetail,
  isOratorianoFormDetailDisabled,
} from '../detailState'
import {
  useCreateOratorianoForm,
  useDeleteOratorianoFormDraft,
  useOratorianoFormDetail,
  useOratorianoFormHistory,
  useReplaceOratorianoFormDraft,
} from './useOratorianoForms'

const apiMocks = vi.hoisted(() => ({
  createOratorianoForm: vi.fn(),
  deleteOratorianoFormDraft: vi.fn(),
  getOratorianoFormDetail: vi.fn(),
  getOratorianoFormHistory: vi.fn(),
  replaceOratorianoFormDraft: vi.fn(),
}))

vi.mock('../api/oratorianoForms', () => apiMocks)

function createHarness() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  return { queryClient, wrapper }
}

beforeEach(() => {
  clearDisabledOratorianoFormDetail('oratoriano-id', 'form-id')
  apiMocks.createOratorianoForm.mockReset()
  apiMocks.deleteOratorianoFormDraft.mockReset()
  apiMocks.getOratorianoFormDetail.mockReset()
  apiMocks.getOratorianoFormHistory.mockReset()
  apiMocks.replaceOratorianoFormDraft.mockReset()
})

describe('useOratorianoFormHistory', () => {
  it('usa a chave estável e consulta a página autorizada', async () => {
    apiMocks.getOratorianoFormHistory.mockResolvedValueOnce({ items: [] })
    const { queryClient, wrapper } = createHarness()

    const { result } = renderHook(
      () => useOratorianoFormHistory('oratoriano-id', 2, true),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiMocks.getOratorianoFormHistory)
      .toHaveBeenCalledWith('oratoriano-id', 2, 10)
    expect(queryClient.getQueryState(
      oratorianoFormQueryKeys.history('oratoriano-id', 2),
    )).toBeDefined()
  })

  it('não consulta sem a permissão de histórico', () => {
    const { wrapper } = createHarness()

    renderHook(
      () => useOratorianoFormHistory('oratoriano-id', 0, false),
      { wrapper },
    )

    expect(apiMocks.getOratorianoFormHistory).not.toHaveBeenCalled()
  })

  it('preserva a página anterior durante a atualização', async () => {
    let resolveSecondPage: ((value: { items: { version: number }[] }) => void)
      | undefined
    apiMocks.getOratorianoFormHistory
      .mockResolvedValueOnce({ items: [{ version: 1 }], page: 0 })
      .mockImplementationOnce(() => new Promise((resolve) => {
        resolveSecondPage = resolve
      }))
    const { wrapper } = createHarness()
    const { result, rerender } = renderHook(
      ({ page }) => useOratorianoFormHistory(
        'oratoriano-id',
        page,
        true,
      ),
      { initialProps: { page: 0 }, wrapper },
    )

    await waitFor(() => expect(result.current.data?.page).toBe(0))
    rerender({ page: 1 })

    await waitFor(() => expect(result.current.isPlaceholderData).toBe(true))
    expect(result.current.data?.items?.[0]?.version).toBe(1)

    await act(async () => {
      resolveSecondPage?.({ items: [{ version: 2 }] })
    })
    await waitFor(() => {
      expect(result.current.data?.items?.[0]?.version).toBe(2)
    })
  })
})

describe('useOratorianoFormDetail', () => {
  it('não consulta um detalhe marcado como excluído', () => {
    disableOratorianoFormDetail('oratoriano-id', 'form-id')
    const { wrapper } = createHarness()

    renderHook(
      () => useOratorianoFormDetail(
        'oratoriano-id',
        'form-id',
        true,
        true,
      ),
      { wrapper },
    )

    expect(apiMocks.getOratorianoFormDetail).not.toHaveBeenCalled()
  })

  it('usa a chave sensível exata e consulta somente após abertura explícita', async () => {
    apiMocks.getOratorianoFormDetail.mockResolvedValueOnce({ data: {} })
    const { queryClient, wrapper } = createHarness()

    const { result } = renderHook(
      () => useOratorianoFormDetail(
        'oratoriano-id',
        'form-id',
        true,
        true,
      ),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiMocks.getOratorianoFormDetail)
      .toHaveBeenCalledWith('oratoriano-id', 'form-id')
    expect(queryClient.getQueryState(
      oratorianoFormQueryKeys.detail('oratoriano-id', 'form-id'),
    )).toBeDefined()
  })

  it.each([
    ['', 'form-id', true, true],
    ['oratoriano-id', '', true, true],
    ['oratoriano-id', 'form-id', false, true],
    ['oratoriano-id', 'form-id', true, false],
  ])(
    'não consulta sem IDs, permissão ou navegação explícita %#',
    (oratorianoId, formId, canView, openedExplicitly) => {
      const { wrapper } = createHarness()

      renderHook(
        () => useOratorianoFormDetail(
          oratorianoId,
          formId,
          canView,
          openedExplicitly,
        ),
        { wrapper },
      )

      expect(apiMocks.getOratorianoFormDetail).not.toHaveBeenCalled()
    },
  )

  it('desabilita refetch ao recuperar foco ou conexão', async () => {
    apiMocks.getOratorianoFormDetail.mockResolvedValueOnce({ data: {} })
    const { wrapper } = createHarness()

    const { result } = renderHook(
      () => useOratorianoFormDetail(
        'oratoriano-id',
        'form-id',
        true,
        true,
      ),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    apiMocks.getOratorianoFormDetail.mockClear()

    act(() => {
      focusManager.setFocused(false)
      focusManager.setFocused(true)
      onlineManager.setOnline(false)
      onlineManager.setOnline(true)
    })

    expect(apiMocks.getOratorianoFormDetail).not.toHaveBeenCalled()
  })

  it('usa retry explícito sem repetir automaticamente a leitura', async () => {
    apiMocks.getOratorianoFormDetail.mockRejectedValueOnce(
      new Error('falha sintética'),
    )
    const { wrapper } = createHarness()

    const { result } = renderHook(
      () => useOratorianoFormDetail(
        'oratoriano-id',
        'form-id',
        true,
        true,
      ),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(apiMocks.getOratorianoFormDetail).toHaveBeenCalledOnce()
  })

  it('trata parsing inválido como erro sem nova chamada automática', async () => {
    apiMocks.getOratorianoFormDetail.mockResolvedValueOnce({
      data: { responsible: { relationship: 'FUTURE' } },
    })
    const { wrapper } = createHarness()

    const { result } = renderHook(
      () => useOratorianoFormDetail(
        'oratoriano-id',
        'form-id',
        true,
        true,
      ),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(apiMocks.getOratorianoFormDetail).toHaveBeenCalledOnce()
    expect(result.current.data).toBeUndefined()
  })
})

describe('mutações do rascunho', () => {
  it('refaz a leitura autoritativa após conflito ao excluir', async () => {
    const conflict = Object.assign(new AxiosError(), {
      response: { status: 409 },
    })
    apiMocks.getOratorianoFormDetail
      .mockResolvedValueOnce({ data: {}, id: 'form-id', status: 'DRAFT' })
      .mockResolvedValueOnce({
        data: {},
        id: 'form-id',
        status: 'COMPLETED',
      })
    apiMocks.deleteOratorianoFormDraft.mockRejectedValueOnce(conflict)
    const { wrapper } = createHarness()
    const { result } = renderHook(() => ({
      detail: useOratorianoFormDetail(
        'oratoriano-id', 'form-id', true, true,
      ),
      mutation: useDeleteOratorianoFormDraft(
        'oratoriano-id', 'form-id',
      ),
    }), { wrapper })

    await waitFor(() => expect(result.current.detail.isSuccess).toBe(true))
    act(() => result.current.mutation.mutate({ reason: 'Motivo de conflito.' }))

    await waitFor(() => expect(result.current.mutation.isError).toBe(true))
    await waitFor(() => {
      expect(apiMocks.getOratorianoFormDetail).toHaveBeenCalledTimes(2)
    })
    expect(result.current.detail.data?.status).toBe('COMPLETED')
    expect(isOratorianoFormDetailDisabled('oratoriano-id', 'form-id'))
      .toBe(false)
  })

  it('cria, valida, semeia o detalhe e invalida o histórico', async () => {
    apiMocks.createOratorianoForm.mockResolvedValueOnce({
      data: {},
      id: 'form-id',
      origin: 'DIRECT_SYSTEM_ENTRY',
      status: 'DRAFT',
    })
    const { queryClient, wrapper } = createHarness()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(
      () => useCreateOratorianoForm('oratoriano-id'),
      { wrapper },
    )

    act(() => result.current.mutate('DIRECT_SYSTEM_ENTRY'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(
      oratorianoFormQueryKeys.detail('oratoriano-id', 'form-id'),
    )).toMatchObject({ status: 'DRAFT' })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: oratorianoFormQueryKeys.histories(),
    })
  })

  it('substitui o detalhe somente com a resposta autoritativa', async () => {
    const response = {
      data: { firstName: 'Marina' },
      draftRevision: 9,
      id: 'form-id',
      status: 'DRAFT',
    }
    apiMocks.replaceOratorianoFormDraft.mockResolvedValueOnce(response)
    const { queryClient, wrapper } = createHarness()
    const { result } = renderHook(
      () => useReplaceOratorianoFormDraft('oratoriano-id', 'form-id'),
      { wrapper },
    )

    act(() => result.current.mutate({ firstName: 'Marina' }))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(
      oratorianoFormQueryKeys.detail('oratoriano-id', 'form-id'),
    )).toEqual(response)
  })

  it('refaz a leitura autoritativa após conflito', async () => {
    const conflict = Object.assign(new AxiosError(), {
      response: { status: 409 },
    })
    apiMocks.getOratorianoFormDetail
      .mockResolvedValueOnce({ data: {}, id: 'form-id', status: 'DRAFT' })
      .mockResolvedValueOnce({
        data: { firstName: 'Atualizado' },
        id: 'form-id',
        status: 'DRAFT',
      })
    apiMocks.replaceOratorianoFormDraft.mockRejectedValueOnce(conflict)
    const { wrapper } = createHarness()
    const { result } = renderHook(() => ({
      detail: useOratorianoFormDetail(
        'oratoriano-id', 'form-id', true, true,
      ),
      mutation: useReplaceOratorianoFormDraft(
        'oratoriano-id', 'form-id',
      ),
    }), { wrapper })
    await waitFor(() => expect(result.current.detail.isSuccess).toBe(true))

    act(() => result.current.mutation.mutate({ firstName: 'Local' }))

    await waitFor(() => expect(result.current.mutation.isError).toBe(true))
    await waitFor(() => {
      expect(apiMocks.getOratorianoFormDetail).toHaveBeenCalledTimes(2)
    })
    expect(result.current.detail.data?.data.firstName).toBe('Atualizado')
  })

  it('exclui sem optimistic update, desabilita o detalhe e navega só depois do histórico', async () => {
    const detailKey = oratorianoFormQueryKeys.detail(
      'oratoriano-id',
      'form-id',
    )
    const cachedDetail = { id: 'form-id', status: 'DRAFT' }
    const onDeleted = vi.fn()
    apiMocks.deleteOratorianoFormDraft.mockResolvedValueOnce(undefined)
    const { queryClient, wrapper } = createHarness()
    queryClient.setQueryData(detailKey, cachedDetail)
    const cancelQueries = vi.spyOn(queryClient, 'cancelQueries')
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(
      () => useDeleteOratorianoFormDraft(
        'oratoriano-id',
        'form-id',
        { onDeleted },
      ),
      { wrapper },
    )

    act(() => result.current.mutate({ reason: 'Motivo normalizado.' }))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiMocks.deleteOratorianoFormDraft).toHaveBeenCalledWith(
      'oratoriano-id',
      'form-id',
      { reason: 'Motivo normalizado.' },
    )
    expect(queryClient.getQueryData(detailKey)).toBe(cachedDetail)
    expect(isOratorianoFormDetailDisabled('oratoriano-id', 'form-id'))
      .toBe(true)
    expect(cancelQueries).toHaveBeenCalledWith({
      exact: true,
      queryKey: detailKey,
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: oratorianoFormQueryKeys.histories(),
    })
    expect(onDeleted).toHaveBeenCalledOnce()
    expect(invalidateQueries.mock.invocationCallOrder[0])
      .toBeLessThan(onDeleted.mock.invocationCallOrder[0])
  })

  it('impede duas submissões enquanto o DELETE está pendente', async () => {
    let resolveDelete: (() => void) | undefined
    apiMocks.deleteOratorianoFormDraft.mockImplementationOnce(
      () => new Promise<void>((resolve) => {
        resolveDelete = resolve
      }),
    )
    const { wrapper } = createHarness()
    const { result } = renderHook(
      () => useDeleteOratorianoFormDraft('oratoriano-id', 'form-id'),
      { wrapper },
    )

    act(() => {
      result.current.mutate({ reason: 'Primeiro motivo.' })
      result.current.mutate({ reason: 'Segundo motivo.' })
    })

    await waitFor(() => {
      expect(apiMocks.deleteOratorianoFormDraft).toHaveBeenCalledOnce()
    })
    resolveDelete?.()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('mantém detalhe e callback intactos quando a exclusão falha', async () => {
    const detailKey = oratorianoFormQueryKeys.detail(
      'oratoriano-id',
      'form-id',
    )
    const cachedDetail = { id: 'form-id', status: 'DRAFT' }
    const onDeleted = vi.fn()
    apiMocks.deleteOratorianoFormDraft.mockRejectedValueOnce(
      new Error('falha de rede sintética'),
    )
    const { queryClient, wrapper } = createHarness()
    queryClient.setQueryData(detailKey, cachedDetail)

    const { result } = renderHook(
      () => useDeleteOratorianoFormDraft(
        'oratoriano-id',
        'form-id',
        { onDeleted },
      ),
      { wrapper },
    )

    act(() => result.current.mutate({ reason: 'Motivo preservado.' }))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(queryClient.getQueryData(detailKey)).toBe(cachedDetail)
    expect(isOratorianoFormDetailDisabled('oratoriano-id', 'form-id'))
      .toBe(false)
    expect(onDeleted).not.toHaveBeenCalled()
  })
})
