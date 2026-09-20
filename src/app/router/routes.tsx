import { Navigate, type RouteObject } from 'react-router'
import { ProtectedRoute } from './ProtectedRoute'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/calendar" replace />,
  },
  {
    path: '/login',
    lazy: async () => {
      const { LoginPage } = await import(
        '../../features/auth/pages/LoginPage'
      )

      return { Component: LoginPage }
    },
  },
  {
    path: '/register',
    lazy: async () => {
      const { RegisterPage } = await import(
        '../../features/auth/pages/RegisterPage'
      )

      return { Component: RegisterPage }
    },
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/calendar',
        lazy: async () => {
          const { CalendarPage } = await import(
            '../../features/calendar/pages/CalendarPage'
          )

          return { Component: CalendarPage }
        },
      },
      {
        path: '/settings',
        lazy: async () => {
          const { SettingsPage } = await import(
            '../../features/settings/pages/SettingsPage'
          )

          return { Component: SettingsPage }
        },
      },
    ],
  },
  {
    path: '*',
    lazy: async () => {
      const { NotFoundPage } = await import(
        '../../components/layout/NotFoundPage'
      )

      return { Component: NotFoundPage }
    },
  },
]