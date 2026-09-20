import type { AuthResponse } from '../api/types'
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setAuthSession,
  updateStoredUser,
  updateTokens,
} from './storage'

export function hasSession(): boolean {
  return Boolean(getAccessToken() && getRefreshToken())
}

export function getSession() {
  return {
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
    user: getStoredUser(),
  }
}

export function saveAuthResponse(response: AuthResponse) {
  setAuthSession({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    user: response.user,
  })
}

export function saveRefreshedTokens(
  accessToken: string,
  refreshToken: string,
) {
  updateTokens({
    accessToken,
    refreshToken,
  })
}

export function saveUser(user: Parameters<typeof updateStoredUser>[0]) {
  updateStoredUser(user)
}

export function logout() {
  clearAuthSession()
}