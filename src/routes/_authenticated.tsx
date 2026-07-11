import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppLayout } from '@/components/appLayout'
import { getUserIdFromToken } from '@/features/auth/util';

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
  
  component: () => (
    <AppLayout>
        
    </AppLayout>
  ),
})