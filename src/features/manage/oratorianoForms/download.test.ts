import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  buildOratorianoFormPdfFilename,
  downloadBlob,
} from './download'

describe('download de PDF da ficha adicional', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('cria um nome de arquivo comercial sem identificadores técnicos', () => {
    const filename = buildOratorianoFormPdfFilename({
      draftRevision: 7,
      generatedAt: '2026-08-01T12:30:00Z',
      name: 'Marina Alves / 019fb82d-2222-7222-8222-222222222222',
    })

    expect(filename).toBe('Marina Alves-ficha-revisao-7.pdf')
    expect(filename).not.toContain('019fb82d')
    expect(filename).not.toMatch(/[\\/:*?"<>|]/)
  })

  it('revoga o object URL e remove o link temporário', () => {
    const createObjectURL = vi.fn(() => 'blob:oratoriano-form')
    const revokeObjectURL = vi.fn()
    vi.spyOn(URL, 'createObjectURL').mockImplementation(createObjectURL)
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(revokeObjectURL)
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})

    downloadBlob(new Blob(['pdf']), 'Marina-ficha.pdf')

    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(click).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:oratoriano-form')
    expect(document.querySelector('a[download="Marina-ficha.pdf"]'))
      .not.toBeInTheDocument()
  })
})
