import { describe, expect, it } from 'vitest'

import { getMainRoleLabel } from './getMainRoleLabel'
import { normalizeAccountRoles } from './normalizeAccount'
import {
  getPermissionPresentation,
  getRolePresentation,
} from './presentation'
import type { RoleResponse } from './types'

const visitor: RoleResponse = {
  description: 'Backend visitor description',
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'VISITOR',
  systemManaged: true,
}

const coordinator: RoleResponse = {
  ...visitor,
  id: '6ba7b810-9dad-41d1-80b4-00c04fd430c8',
  name: 'COORD',
}

const member: RoleResponse = {
  ...visitor,
  id: '019f6343-321a-7c90-a096-a551e8f88eb4',
  name: 'MEMBER',
}

const oratorioCoordinator: RoleResponse = {
  ...visitor,
  id: '019f6343-321a-7c90-a096-a551e8f88eb5',
  name: 'ORATORIO_COORD',
}

describe('apresentação de acesso', () => {
  it('usa textos frontend para papéis e permissões conhecidos', () => {
    expect(getRolePresentation(coordinator)).toEqual({
      description: 'Acesso às atividades de coordenação e administração do grupo.',
      label: 'Coordenação',
    })
    expect(getPermissionPresentation('MEMBER_SEARCH').label).toBe('Buscar membros')
  })

  it('apresenta as três capacidades específicas de Presença', () => {
    expect(getPermissionPresentation('PRESENCE_REGISTER').label).toBe(
      'Registrar presenças',
    )
    expect(getPermissionPresentation('PRESENCE_EDIT').label).toBe(
      'Editar presenças',
    )
    expect(getPermissionPresentation('PRESENCE_REMOVE').label).toBe(
      'Remover presenças',
    )
  })

  it('cobre os papéis e as capacidades do catálogo aceito', () => {
    expect(getRolePresentation({
      name: 'ORATORIO_COORD',
      systemManaged: true,
    }).label).toBe('Coordenação do Oratório')

    const acceptedPermissionCodes = [
      'MEMBER_GET',
      'MEMBER_SEARCH',
      'MEMBER_ACTIVATION',
      'MEMBER_GET_NON_ACTIVE',
      'MEMBER_MANAGE',
      'COORDINATOR_MANAGE',
      'ACCOUNT_GET',
      'ACCOUNT_SEARCH',
      'ACCOUNT_ROLE_MANAGE',
      'EVENT_CREATE',
      'EVENT_SEARCH',
      'EVENT_GET_PRESENCES',
      'EVENT_GET_MEMBER',
      'EVENT_GET_COORD',
      'EVENT_MANAGE',
      'GAM_LOCATION_GET',
      'GAM_LOCATION_CREATE',
      'GAM_LOCATION_MANAGE',
      'PRESENCES_SEARCH',
      'PRESENCE_REGISTER',
      'PRESENCE_EDIT',
      'PRESENCE_REMOVE',
      'ORATORIO_GET',
      'ORATORIO_CREATE',
      'ORATORIO_MANAGE',
      'ORATORIO_ATTENDANCE_GET',
      'ORATORIO_ATTENDANCE_MANAGE',
      'ORATORIO_COORD_MANAGE',
      'ORATORIANO_GET',
      'ORATORIANO_REGISTER',
      'ORATORIANO_MANAGE',
      'ORATORIANO_FORM_GET',
      'ORATORIANO_FORM_MANAGE',
      'ORATORIANO_FORM_PDF_GENERATE',
      'ORATORIANO_FORM_ATTACHMENT_GET',
      'ROLE_GET',
      'PERMISSION_GET',
    ]

    for (const code of acceptedPermissionCodes) {
      expect(getPermissionPresentation(code).label).not.toBe(
        'Capacidade de acesso não identificada',
      )
    }
  })

  it('não expõe nomes nem metadados desconhecidos do backend', () => {
    const role = getRolePresentation({ name: 'BACKEND_SUPER_ROLE', systemManaged: true })
    const permission = getPermissionPresentation('INTERNAL_PERMISSION')

    expect(role.label).toBe('Tipo de acesso não identificado')
    expect(role.label).not.toContain('BACKEND_SUPER_ROLE')
    expect(permission.label).toBe('Capacidade de acesso não identificada')
    expect(permission.label).not.toContain('INTERNAL_PERMISSION')
  })

  it('diferencia um tipo personalizado sem confiar no nome recebido', () => {
    expect(getRolePresentation({ name: 'PASTORAL_X', systemManaged: false }).label).toBe(
      'Tipo de acesso personalizado',
    )
  })

  it('seleciona o principal tipo de acesso pela hierarquia aceita', () => {
    expect(getMainRoleLabel([visitor, coordinator])).toBe('Coordenação')
    expect(getMainRoleLabel([member, oratorioCoordinator])).toBe(
      'Coordenação do Oratório',
    )
    expect(getMainRoleLabel([])).toBe('-')
  })
})

describe('normalizeAccountRoles', () => {
  it.each([
    [[visitor], [visitor]],
    [{ roles: [visitor] }, [visitor]],
  ])('aceita a forma plana e a forma embrulhada do contrato', (input, expected) => {
    expect(normalizeAccountRoles(input)).toEqual(expected)
  })

  it('descarta entradas malformadas e aplica defaults seguros', () => {
    expect(normalizeAccountRoles([
      null,
      { id: 'sem-nome' },
      {
        id: visitor.id,
        name: visitor.name,
      },
    ])).toEqual([
      {
        description: '',
        id: visitor.id,
        name: visitor.name,
        systemManaged: false,
      },
    ])
  })

  it.each([undefined, null, 'roles', { roles: 'inválido' }])(
    'retorna uma lista vazia para %s',
    (input) => {
      expect(normalizeAccountRoles(input)).toEqual([])
    },
  )
})
