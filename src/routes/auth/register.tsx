import { createFileRoute } from '@tanstack/react-router'
import { RegisterForm } from '@/features/auth/components/registerForm'

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
})

function RegisterPage() {
  return <RegisterForm />
}