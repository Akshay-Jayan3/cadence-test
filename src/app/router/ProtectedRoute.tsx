import { Navigate, Outlet, useLocation } from 'react-router'

import { useSession } from '../../features/auth/hooks/useSession'
import { hasSession } from '../../lib/auth/session'

export function ProtectedRoute() {
  const location = useLocation()
  const hasStoredSession = hasSession()

  const sessionQuery = useSession()

  if (!hasStoredSession) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  if (sessionQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <p className="text-body text-ink/60">
          Loading...
        </p>
      </div>
    )
  }

  if (sessionQuery.isError) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}