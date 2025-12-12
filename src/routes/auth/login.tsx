import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/features/auth/components/loginForm'

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
})

function LoginPage() {
  return <LoginForm />
}