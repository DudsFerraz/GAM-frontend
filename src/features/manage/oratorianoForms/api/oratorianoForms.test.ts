import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createOratorianoForm,
  deleteOratorianoFormDraft,
  getOratorianoFormDetail,
  getOratorianoFormHistory,
  replaceOratorianoFormDraft,
} from './oratorianoForms'

const apiMocks = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}))

vi.mock('@/lib/http', () => ({ api: apiMocks }))

beforeEach(() => {
  apiMocks.delete.mockReset()
  apiMocks.get.mockReset()
  apiMocks.post.mockReset()
  apiMocks.put.mockReset()
})

describe('API de criação do rascunho', () => {
  it.each([
    'PAPER_TRANSCRIPTION',
    'DIRECT_SYSTEM_ENTRY',
  ] as const)('usa POST, path e origem obrigatória para %s', async (origin) => {
    const response = { data: {}, id: 'form-id', origin, status: 'DRAFT' }
    apiMocks.post.mockResolvedValueOnce({ data: response })

    const result = await createOratorianoForm('oratoriano/id', origin)

    expect(apiMocks.post).toHaveBeenCalledWith(
      '/oratorianos/oratoriano%2Fid/forms',
      { origin },
    )
    expect(result).toBe(response)
  })

  it('rejeita origem ausente antes de chamar a rede', async () => {
    const promise = Reflect.apply(
      createOratorianoForm,
      undefined,
      ['oratoriano-id', undefined],
    )

    await expect(promise).rejects.toThrow('Invalid Oratoriano form origin')
    expect(apiMocks.post).not.toHaveBeenCalled()
  })
})

describe('API do histórico de fichas adicionais', () => {
  it('usa GET, path relativo e paginação explícita', async () => {
    const response = { items: [], page: 2, totalPages: 3 }
    apiMocks.get.mockResolvedValueOnce({ data: response })

    const result = await getOratorianoFormHistory(
      'oratoriano-id',
      2,
      25,
    )

    expect(apiMocks.get).toHaveBeenCalledWith(
      '/oratorianos/oratoriano-id/forms',
      { params: { page: 2, size: 25 } },
    )
    expect(result).toBe(response)
  })

  it('usa dez itens por página como padrão', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: { items: [] } })

    await getOratorianoFormHistory('oratoriano-id', 0)

    expect(apiMocks.get).toHaveBeenCalledWith(
      '/oratorianos/oratoriano-id/forms',
      { params: { page: 0, size: 10 } },
    )
  })
})

describe('API do detalhe de ficha adicional', () => {
  it('usa GET, path relativo e os dois identificadores corretos', async () => {
    const response = {
      data: {},
      origin: 'DIRECT_SYSTEM_ENTRY',
      status: 'DRAFT',
      version: 3,
    }
    apiMocks.get.mockResolvedValueOnce({ data: response })

    const result = await getOratorianoFormDetail(
      'oratoriano-id',
      'form-id',
    )

    expect(apiMocks.get).toHaveBeenCalledWith(
      '/oratorianos/oratoriano-id/forms/form-id',
    )
    expect(result).toBe(response)
  })

  it('codifica os identificadores sem alterar o path do recurso', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: { data: {} } })

    await getOratorianoFormDetail('oratoriano/id', 'form id')

    expect(apiMocks.get).toHaveBeenCalledWith(
      '/oratorianos/oratoriano%2Fid/forms/form%20id',
    )
  })

  it('preserva o erro para a fronteira segura da página', async () => {
    const error = new Error('diagnóstico sintético')
    apiMocks.get.mockRejectedValueOnce(error)

    await expect(getOratorianoFormDetail('oratoriano-id', 'form-id'))
      .rejects.toBe(error)
  })
})

describe('API de substituição integral do rascunho', () => {
  it('usa PUT com o body completo e retorna a resposta autoritativa', async () => {
    const draft = {
      firstName: 'Marina',
      health: { allergies: { answer: 'NO' as const } },
      surname: 'Alves',
    }
    const response = {
      data: draft,
      draftRevision: 8,
      id: 'form-id',
      status: 'DRAFT',
    }
    apiMocks.put.mockResolvedValueOnce({ data: response })

    const result = await replaceOratorianoFormDraft(
      'oratoriano/id',
      'form id',
      draft,
    )

    expect(apiMocks.put).toHaveBeenCalledWith(
      '/oratorianos/oratoriano%2Fid/forms/form%20id',
      draft,
    )
    expect(result).toBe(response)
    expect(apiMocks).not.toHaveProperty('patch')
  })

  it('preserva erro sem expor ou converter o payload', async () => {
    const error = new Error('diagnóstico privado')
    apiMocks.put.mockRejectedValueOnce(error)

    await expect(replaceOratorianoFormDraft(
      'oratoriano-id',
      'form-id',
      {},
    )).rejects.toBe(error)
  })
})

describe('API de exclusão do rascunho', () => {
  it('usa DELETE, path codificado e body na configuração do Axios', async () => {
    apiMocks.delete.mockResolvedValueOnce({ status: 204 })

    await deleteOratorianoFormDraft('oratoriano/id', 'form id', {
      reason: 'Ficha criada para a pessoa errada.',
    })

    expect(apiMocks.delete).toHaveBeenCalledWith(
      '/oratorianos/oratoriano%2Fid/forms/form%20id',
      { data: { reason: 'Ficha criada para a pessoa errada.' } },
    )
  })

  it('aceita 204 sem tentar interpretar body de resposta', async () => {
    apiMocks.delete.mockResolvedValueOnce({ status: 204 })

    await expect(deleteOratorianoFormDraft(
      'oratoriano-id',
      'form-id',
      { reason: 'Motivo válido.' },
    )).resolves.toBeUndefined()
  })

  it('preserva falha para a camada de apresentação segura', async () => {
    const error = new Error('diagnóstico privado')
    apiMocks.delete.mockRejectedValueOnce(error)

    await expect(deleteOratorianoFormDraft(
      'oratoriano-id',
      'form-id',
      { reason: 'Motivo válido.' },
    )).rejects.toBe(error)
  })
})
