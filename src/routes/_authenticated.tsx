import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppLayout } from '@/app/shell'
import { getUserIdFromToken } from '@/features/auth';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const token = getUserIdFromToken();
    if (!token) {
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href, 
        },
      })
    }
  },
  
  component: AppLayout,
})
