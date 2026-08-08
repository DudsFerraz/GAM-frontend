import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useUpdateMemberCoordinator } from './useUpdateMemberCoordinator'

const apiMocks = vi.hoisted(() => ({
  updateMemberCoordinator: vi.fn(),
}))

vi.mock('../api/updateMemberCoordinator', () => apiMocks)

beforeEach(() => {
  apiMocks.updateMemberCoordinator.mockReset()
  apiMocks.updateMemberCoordinator.mockResolvedValue(undefined)
})

describe('useUpdateMemberCoordinator', () => {
  it('invalida consultas de membros depois da transição', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    })
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
    const { result } = renderHook(() => useUpdateMemberCoordinator(), {
      wrapper,
    })

    await act(async () => {
      await result.current.mutateAsync({
        action: 'grant',
        accountId: 'account-id',
        memberId: 'member-id',
        reason: 'Necessidade do grupo',
      })
    })

    expect(apiMocks.updateMemberCoordinator).toHaveBeenCalledWith(
      'member-id',
      'grant',
      { reason: 'Necessidade do grupo' },
    )
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['members'],
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['account-administration', 'account-id', 'roles'],
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['account-administration', 'search'],
    })
  })

  it('reconcilia todos os caches mesmo quando o consumidor desmonta durante a mutação', async () => {
    let resolveMutation: (() => void) | undefined
    apiMocks.updateMemberCoordinator.mockImplementationOnce(
      () => new Promise<void>((resolve) => {
        resolveMutation = resolve
      }),
    )
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    })
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
    const { result, unmount } = renderHook(
      () => useUpdateMemberCoordinator(),
      { wrapper },
    )
    let mutationPromise: Promise<void> | undefined

    act(() => {
      mutationPromise = result.current.mutateAsync({
        accountId: 'account-id',
        action: 'grant',
        memberId: 'member-id',
        reason: 'Necessidade do grupo',
      })
    })
    await waitFor(() => expect(resolveMutation).toBeDefined())
    unmount()

    await act(async () => {
      resolveMutation?.()
      await mutationPromise
    })

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['members'],
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['account-administration', 'account-id', 'roles'],
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['account-administration', 'search'],
    })
  })
})
