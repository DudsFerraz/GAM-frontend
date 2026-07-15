import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import { RouterProvider } from '@tanstack/react-router'

import { AppProviders } from '@/app/providers'
import { router } from '@/app/router'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </React.StrictMode>,
  )
}
