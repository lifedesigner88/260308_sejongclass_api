import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Home, { action as homeAction, loader as homeLoader } from './routes/home'
import About from './routes/about'
import Login, { action as loginAction, loader as loginLoader } from './routes/login'
import { queryClient } from './lib/query'
import './styles.css'

const router = createBrowserRouter([
  { path: '/', element: <Home />, loader: homeLoader, action: homeAction },
  { path: '/login', element: <Login />, loader: loginLoader, action: loginAction },
  { path: '/about', element: <About /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
