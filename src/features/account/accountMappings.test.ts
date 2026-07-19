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

describe('apresentação de acesso', () => {
  it('usa textos frontend para papéis e permissões conhecidos', () => {
    expect(getRolePresentation(coordinator)).toEqual({
      description: 'Acesso às atividades de coordenação e administração do grupo.',
      label: 'Coordenação',
    })
    expect(getPermissionPresentation('MEMBER_SEARCH').label).toBe('Buscar membros')
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
