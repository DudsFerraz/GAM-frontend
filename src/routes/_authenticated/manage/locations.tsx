import { createFileRoute } from '@tanstack/react-router'

import { ManageLocationsPage } from '@/features/manage/locations'

export const Route = createFileRoute('/_authenticated/manage/locations')({ component: ManageLocationsPage })
