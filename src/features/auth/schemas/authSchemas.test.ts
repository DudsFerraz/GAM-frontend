import { describe, expect, it } from 'vitest'

import { loginSchema } from './loginSchema'
import { registerSchema } from './registerSchema'

describe('loginSchema', () => {
  it('aceita credenciais preenchidas', () => {
    expect(loginSchema.safeParse({
      email: 'conta@example.test',
      password: 'segredo',
    }).success).toBe(true)
  })

  it('fornece mensagens explícitas em português', () => {
    const result = loginSchema.safeParse({ email: 'inválido', password: '' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        email: ['Digite um e-mail válido'],
        password: ['A senha é obrigatória'],
      })
    }
  })
})

describe('registerSchema', () => {
  const validRegistration = {
    confirmPassword: 'segredo8',
    displayName: 'Conta GAM',
    email: 'conta@example.test',
    password: 'segredo8',
  }

  it('aceita um cadastro válido', () => {
    expect(registerSchema.safeParse(validRegistration).success).toBe(true)
  })

  it('rejeita nome e senha com menos de oito caracteres com feedback em português', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      confirmPassword: '123',
      displayName: 'Ga',
      password: '123',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        displayName: ['O nome deve ter pelo menos 3 caracteres'],
        password: ['A senha deve ter pelo menos 8 caracteres'],
      })
    }
  })

  it('rejeita senha de sete caracteres', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      confirmPassword: '1234567',
      password: '1234567',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toContain(
        'A senha deve ter pelo menos 8 caracteres',
      )
    }
  })

  it('associa a divergência de senhas à confirmação', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      confirmPassword: 'outra-senha',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toContain(
        'As senhas não coincidem',
      )
    }
  })
})
