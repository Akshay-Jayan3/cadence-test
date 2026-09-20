import type { User } from '../api/types'

const ACCESS_TOKEN_KEY = 'cadence_access_token'
const REFRESH_TOKEN_KEY = 'cadence_refresh_token'
const USER_KEY = 'cadence_user'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getStoredUser(): User | null {
  const value = localStorage.getItem(USER_KEY)

  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as User
  } catch {
    return null
  }
}

export function setAuthSession({
  accessToken,
  refreshToken,
  user,
}: {
  accessToken: string
  refreshToken: string
  user?: User
}) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

export function updateTokens({
  accessToken,
  refreshToken,
}: {
  accessToken: string
  refreshToken: string
}) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function updateStoredUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}