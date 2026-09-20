import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'

import { refreshToken } from './auth'
import {
  getAccessToken,
  getRefreshToken,
  clearAuthSession
} from '../auth/storage'
import {
  saveRefreshedTokens,
} from '../auth/session'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise: Promise<string> | null = null

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken()

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
)

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config

    if (
      error.response?.status !== 401 ||
      !originalRequest
    ) {
      return Promise.reject(error)
    }

    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    if ((originalRequest as InternalAxiosRequestConfig & {
      _retry?: boolean
    })._retry) {
      clearAuthSession()
      return Promise.reject(error)
    }

    ;(
      originalRequest as InternalAxiosRequestConfig & {
        _retry?: boolean
      }
    )._retry = true

    const storedRefreshToken = getRefreshToken()

    if (!storedRefreshToken) {
      clearAuthSession()
      return Promise.reject(error)
    }

    try {
      if (!refreshPromise) {
        refreshPromise = refreshToken(storedRefreshToken)
          .then((response) => {
            saveRefreshedTokens(
              response.accessToken,
              response.refreshToken,
            )

            return response.accessToken
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      const newAccessToken = await refreshPromise

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`

      return apiClient(originalRequest)
    } catch (refreshError) {
      clearAuthSession()

      return Promise.reject(refreshError)
    }
  },
)