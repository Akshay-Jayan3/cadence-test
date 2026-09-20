import { apiClient } from './client'
import type {
  AuthResponse,
  LoginInput,
  RefreshResponse,
  RegisterInput,
} from './types'

export async function register(
  input: RegisterInput,
): Promise<AuthResponse> {
  const formData = new FormData()

  formData.append('name', input.name)
  formData.append('email', input.email)
  formData.append('password', input.password)

  if (input.avatar) {
    formData.append('avatar', input.avatar)
  }

  const response = await apiClient.post<AuthResponse>(
    '/auth/register',
    formData,
  )

  return response.data
}

export async function login(
  input: LoginInput,
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    '/auth/login',
    input,
  )

  return response.data
}

export async function refreshToken(
  refreshToken: string,
): Promise<RefreshResponse> {
  const response = await apiClient.post<RefreshResponse>(
    '/auth/refresh',
    {
      refreshToken,
    },
  )

  return response.data
}