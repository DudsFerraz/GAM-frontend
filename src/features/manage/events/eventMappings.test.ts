import { describe, expect, it } from 'vitest'

import {
  mapEventEditFormToReplacement,
  mapEventFormToCreateEvent,
  mapEventToEditForm,
} from './eventMappings'

const validForm = {
  beginDate: '2026-08-01T10:00',
  description: 'Encontro mensal',
  endDate: '2026-08-01T11:00',
  locationId: '550e8400-e29b-41d4-a716-446655440000',
  requiredPermissionId: '6ba7b810-9dad-41d1-80b4-00c04fd430c8',
  title: 'Encontro do GAM',
}

describe('mapEventFormToCreateEvent', () => {
  it('omite a permissão de público ao criar um evento público', () => {
    const payload = mapEventFormToCreateEvent({
      ...validForm,
      description: '',
      requiredPermissionId: '',
    })

    expect(payload).toEqual({
      beginDate: new Date(validForm.beginDate).toISOString(),
      endDate: new Date(validForm.endDate).toISOString(),
      gamLocationId: validForm.locationId,
      title: validForm.title,
    })
    expect(payload).not.toHaveProperty('requiredPermissionId')
  })

  it('preserva uma restrição de público selecionada', () => {
    const payload = mapEventFormToCreateEvent(validForm)

    expect(payload).toMatchObject({
      description: validForm.description,
      requiredPermissionId: validForm.requiredPermissionId,
    })
  })
})

describe('mapeamento da edição de evento', () => {
  it('preenche o formulário com datas locais e relações atuais', () => {
    const event = {
      beginDate: '2026-08-01T13:00:00.000Z',
      description: 'Descrição atual',
      endDate: '2026-08-01T14:00:00.000Z',
      gamLocation: {
        city: 'Piracicaba',
        countryCode: 'BR',
        id: validForm.locationId,
        latitude: null,
        longitude: null,
        name: 'Sede',
        postalCode: null,
        state: 'SP',
        street: null,
      },
      requiredPermission: {
        code: 'EVENT_GET_MEMBER',
        id: validForm.requiredPermissionId,
      },
      title: validForm.title,
    }

    expect(mapEventToEditForm(event)).toMatchObject({
      description: event.description,
      locationId: validForm.locationId,
      reason: '',
      requiredPermissionId: validForm.requiredPermissionId,
      title: validForm.title,
    })
  })

  it('omite público e motivo vazios em uma substituição pública', () => {
    const payload = mapEventEditFormToReplacement({
      ...validForm,
      reason: '',
      requiredPermissionId: '',
    })

    expect(payload).not.toHaveProperty('requiredPermissionId')
    expect(payload).not.toHaveProperty('reason')
    expect(payload).toMatchObject({
      gamLocationId: validForm.locationId,
      title: validForm.title,
    })
  })
})
