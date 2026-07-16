import type { components } from '@/api/generated/gam-api'
import { api } from '@/lib/http'

export type Solicitation = components['schemas']['MembershipSolicitationRDTO']
export type SolicitationPage = components['schemas']['PagedResponseMembershipSolicitationRDTO']
export type SubmitSolicitation = Omit<components['schemas']['SubmitMembershipSolicitationDTO'], 'accountId'>
export type SolicitationStatus = NonNullable<Solicitation['status']>

export async function searchSolicitations(
  status: SolicitationStatus | 'ALL',
  page: number,
): Promise<SolicitationPage> {
  const filters = status === 'ALL'
    ? []
    : [{ field: 'status', value: status, comparationMethod: 'EQUALS' as const }]
  const { data } = await api.post<SolicitationPage>(
    '/membership-solicitations/search',
    { filters },
    {
      params: { page, size: 10, sort: ['createdAt,desc'] },
      paramsSerializer: { indexes: null },
    },
  )
  return data
}

export async function getSolicitation(id: string): Promise<Solicitation> {
  const { data } = await api.get<Solicitation>(`/membership-solicitations/${id}`)
  return data
}

export async function submitSolicitation(payload: SubmitSolicitation): Promise<Solicitation> {
  const { data } = await api.post<Solicitation>('/membership-solicitations', payload)
  return data
}

export async function reviewSolicitation(
  id: string,
  decision: 'approve' | 'reject',
  reason: string,
): Promise<Solicitation> {
  const { data } = await api.patch<Solicitation>(
    `/membership-solicitations/${id}/${decision}`,
    { reason },
  )
  return data
}
