import { useQueryClient } from '@tanstack/react-query'
import { useBlocker, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  ORATORIANO_PROFILE_NOTICE,
} from '@/features/manage/oratorianos'

import {
  useOratorianoFormSnapshots,
} from './useOratorianoForms'
import { oratorianoFormQueryKeys } from '../queryKeys'

const pendingDetailCleanup = new Map<
  string,
  ReturnType<typeof setTimeout>
>()

type UseOratorianoFormWorkspaceProps = {
  canView: boolean
  formId: string
  openedExplicitly: boolean
  oratorianoId: string
}

export function useOratorianoFormWorkspace({
  canView,
  formId,
  openedExplicitly,
  oratorianoId,
}: UseOratorianoFormWorkspaceProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [detailDisabled, setDetailDisabled] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isExitBypass, setIsExitBypass] = useState(false)
  const deletionNavigationStarted = useRef(false)
  const snapshots = useOratorianoFormSnapshots(oratorianoId, formId)
  const hasEphemeralWorkspace = canView
    && openedExplicitly
    && (isDirty || snapshots.length > 0)
  const blocker = useBlocker({
    disabled: !hasEphemeralWorkspace || isExitBypass,
    enableBeforeUnload: () => hasEphemeralWorkspace && !isExitBypass,
    shouldBlockFn: () => hasEphemeralWorkspace && !isExitBypass,
    withResolver: true,
  })

  const removeWorkspaceQueries = useCallback(() => {
    const workspaceKey = `${oratorianoId}:${formId}`
    const pendingCleanup = pendingDetailCleanup.get(workspaceKey)
    if (pendingCleanup) {
      clearTimeout(pendingCleanup)
      pendingDetailCleanup.delete(workspaceKey)
    }

    queryClient.removeQueries({
      exact: true,
      queryKey: oratorianoFormQueryKeys.detail(oratorianoId, formId),
    })
    queryClient.removeQueries({
      exact: true,
      queryKey: oratorianoFormQueryKeys.snapshots(oratorianoId, formId),
    })
    queryClient.removeQueries({
      exact: true,
      queryKey: oratorianoFormQueryKeys.attachments(oratorianoId, formId),
    })
  }, [formId, oratorianoId, queryClient])

  const handleDeleted = useCallback(async () => {
    setDetailDisabled(true)
    setIsDirty(false)
    setIsExitBypass(true)
    deletionNavigationStarted.current = true

    try {
      await navigate({
        params: { oratorianoId },
        replace: true,
        search: { notice: ORATORIANO_PROFILE_NOTICE.formDraftDeleted },
        to: '/manage/oratorios/oratorianos/$oratorianoId',
      })
      removeWorkspaceQueries()
    } catch (error) {
      deletionNavigationStarted.current = false
      throw error
    }
  }, [navigate, oratorianoId, removeWorkspaceQueries])

  const confirmExit = useCallback(() => {
    setIsExitBypass(true)
    queryClient.removeQueries({
      exact: true,
      queryKey: oratorianoFormQueryKeys.snapshots(oratorianoId, formId),
    })
    if (blocker.status === 'blocked') {
      blocker.proceed()
    }
  }, [blocker, formId, oratorianoId, queryClient])

  useEffect(() => {
    const workspaceKey = `${oratorianoId}:${formId}`
    const pendingCleanup = pendingDetailCleanup.get(workspaceKey)
    if (pendingCleanup) {
      clearTimeout(pendingCleanup)
      pendingDetailCleanup.delete(workspaceKey)
    }

    return () => {
      // A zero-delay cleanup lets an intentional route replacement finish first.
      const timeout = setTimeout(() => {
        if (deletionNavigationStarted.current) {
          pendingDetailCleanup.delete(workspaceKey)
          return
        }

        queryClient.removeQueries({
          exact: true,
          queryKey: oratorianoFormQueryKeys.detail(oratorianoId, formId),
        })
        queryClient.removeQueries({
          exact: true,
          queryKey: oratorianoFormQueryKeys.snapshots(oratorianoId, formId),
        })
        pendingDetailCleanup.delete(workspaceKey)
      }, 0)
      pendingDetailCleanup.set(workspaceKey, timeout)
    }
  }, [formId, oratorianoId, queryClient])

  return {
    blocker,
    confirmExit,
    detailDisabled,
    handleDeleted,
    isDirty,
    isExitBypass,
    setIsDirty,
    setIsExitBypass,
    snapshots,
  }
}
