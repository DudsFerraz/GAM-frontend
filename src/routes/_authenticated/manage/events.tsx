import { createFileRoute } from '@tanstack/react-router'

import { ManageEventsPage } from '@/features/manage/events'

export const Route = createFileRoute('/_authenticated/manage/events')({ component: ManageEventsPage })
