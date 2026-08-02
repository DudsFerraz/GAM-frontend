import { describe, expect, it } from 'vitest'

import { SafeHttpError } from '@/lib/http'

import { InvalidOratorianoFormDataError } from './parseFormDetail'
import { getOratorianoFormDraftSaveErrorMessage } from './saveError'

describe('mensagens de salvamento do rascunho da ficha adicional', () => {
  it('explica que a incompletude é permitida, mas valores preenchidos devem ser válidos', () => {
    expect(getOratorianoFormDraftSaveErrorMessage(
      new SafeHttpError(400, 'INVALID_REQUEST'),
    )).toBe(
      'O rascunho pode ser salvo mesmo incompleto, mas os valores preenchidos precisam estar em formato válido. Revise os campos preenchidos e tente novamente.',
    )
  })

  it('mantém a orientação para respostas inválidas do servidor', () => {
    expect(getOratorianoFormDraftSaveErrorMessage(
      new InvalidOratorianoFormDataError(),
    )).toBe(
      'O rascunho pode ficar incompleto, mas não foi possível confirmar a resposta do servidor. Tente salvar novamente.',
    )
  })

  it('usa a mensagem segura compartilhada para falhas sem classificação', () => {
    expect(getOratorianoFormDraftSaveErrorMessage(new Error('privado')))
      .toBe('Ocorreu um erro inesperado. Tente novamente.')
  })
})
