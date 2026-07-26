import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  assignOratorioTeamMember,
  cancelOratorio,
  createOratorio,
  getAttendanceRoster,
  getPresentSummary,
  markAttendance,
  registerAndMarkOratoriano,
  removeOratorio,
  reopenOratorio,
  replaceOratorioPlanning,
  uncheckAttendance,
} from './oratorios'

const apiMocks = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}))

vi.mock('@/lib/http', () => ({ api: apiMocks }))

beforeEach(() => {
  Object.values(apiMocks).forEach((mock) => mock.mockReset())
})

describe('API de Oratórios', () => {
  it('cria a ocorrência somente com a data', async () => {
    const created = { id: 'oratorio-id' }
    apiMocks.post.mockResolvedValueOnce({ data: created })

    await expect(createOratorio({ date: '2026-08-02' })).resolves.toEqual(created)
    expect(apiMocks.post).toHaveBeenCalledWith('/oratorios', {
      date: '2026-08-02',
    })
  })

  it('substitui integralmente os quatro campos de planejamento', async () => {
    const payload = {
      boaTardeCriancasPlan: 'Plano das crianças',
      boaTardeJovensPlan: 'Plano dos jovens',
      gincanaDescription: 'Gincana cooperativa',
      lancheDescription: 'Pão e suco',
    }
    apiMocks.put.mockResolvedValueOnce({ data: { id: 'oratorio-id' } })

    await replaceOratorioPlanning('oratorio-id', payload)

    expect(apiMocks.put).toHaveBeenCalledWith(
      '/oratorios/oratorio-id/planning',
      payload,
    )
  })

  it('usa a relação de equipe sem expor operação adicional', async () => {
    apiMocks.put.mockResolvedValueOnce({})

    await assignOratorioTeamMember(
      'oratorio-id',
      'GINCANA',
      'member-id',
    )

    expect(apiMocks.put).toHaveBeenCalledWith(
      '/oratorios/oratorio-id/teams/GINCANA/members/member-id',
    )
  })

  it('consulta roster paginado e omite busca vazia', async () => {
    apiMocks.get.mockResolvedValue({ data: { items: [] } })

    await getAttendanceRoster('oratorio-id', 'members', 2, '  Ana  ')
    await getAttendanceRoster('oratorio-id', 'oratorianos', 0, '  ')

    expect(apiMocks.get).toHaveBeenNthCalledWith(
      1,
      '/oratorios/oratorio-id/attendance/members',
      { params: { name: 'Ana', page: 2 } },
    )
    expect(apiMocks.get).toHaveBeenNthCalledWith(
      2,
      '/oratorios/oratorio-id/attendance/oratorianos',
      { params: { page: 0 } },
    )
  })

  it('consulta o resumo persistente de presentes', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: { members: [] } })

    await getPresentSummary('oratorio-id')

    expect(apiMocks.get).toHaveBeenCalledWith(
      '/oratorios/oratorio-id/attendance/present',
    )
  })

  it('marca presença sem corpo e remove com motivo apenas quando informado', async () => {
    apiMocks.put.mockResolvedValueOnce({ data: { id: 'attendance-id' } })
    apiMocks.delete.mockResolvedValue({})

    await markAttendance('oratorio-id', 'oratorianos', 'person-id')
    await uncheckAttendance(
      'oratorio-id',
      'oratorianos',
      'person-id',
      'Marcação incorreta.',
    )
    await uncheckAttendance(
      'oratorio-id',
      'members',
      'member-id',
    )

    expect(apiMocks.put).toHaveBeenCalledWith(
      '/oratorios/oratorio-id/attendance/oratorianos/person-id',
    )
    expect(apiMocks.delete).toHaveBeenNthCalledWith(
      1,
      '/oratorios/oratorio-id/attendance/oratorianos/person-id',
      { data: { reason: 'Marcação incorreta.' } },
    )
    expect(apiMocks.delete).toHaveBeenNthCalledWith(
      2,
      '/oratorios/oratorio-id/attendance/members/member-id',
      {},
    )
  })

  it('cadastra e marca Oratoriano na operação atômica', async () => {
    const payload = { firstName: 'Ana', surname: 'Souza' }
    apiMocks.post.mockResolvedValueOnce({ data: {} })

    await registerAndMarkOratoriano('oratorio-id', payload)

    expect(apiMocks.post).toHaveBeenCalledWith(
      '/oratorios/oratorio-id/attendance/oratorianos/register-and-mark',
      payload,
    )
  })

  it('envia motivos no ciclo e na exclusão', async () => {
    apiMocks.patch.mockResolvedValue({})
    apiMocks.delete.mockResolvedValue({})

    await cancelOratorio('oratorio-id', { reason: 'Chuva intensa.' })
    await reopenOratorio(
      'oratorio-id',
      'COMPLETED',
      { reason: 'Correção de presença.' },
    )
    await removeOratorio('oratorio-id', { reason: 'Data duplicada.' })

    expect(apiMocks.patch).toHaveBeenNthCalledWith(
      1,
      '/oratorios/oratorio-id/cancel',
      { reason: 'Chuva intensa.' },
    )
    expect(apiMocks.patch).toHaveBeenNthCalledWith(
      2,
      '/oratorios/oratorio-id/reopen',
      {
        reason: 'Correção de presença.',
        targetStatus: 'COMPLETED',
      },
    )
    expect(apiMocks.delete).toHaveBeenCalledWith(
      '/oratorios/oratorio-id',
      { data: { reason: 'Data duplicada.' } },
    )
  })
})
