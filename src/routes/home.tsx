import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute("/home")({
  component: Home,
})

function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Bem-vindo ao GAM Project</h1>
      <p className="text-gray-500">
        Ambiente configurado com Vite, Tailwind 4, Shadcn, Axios e TanStack Router.
      </p>
    </div>
  )
}