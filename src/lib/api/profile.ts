import { apiClient } from './client'
import type {
  ChangePasswordInput,
  UpdateProfileInput,
  User,
} from './types'

export async function getProfile(): Promise<User> {
  const response = await apiClient.get<User>('/profile')

  return response.data
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<User> {
  const formData = new FormData()

  if (input.name !== undefined) {
    formData.append('name', input.name)
  }

  if (input.email !== undefined) {
    formData.append('email', input.email)
  }

  if (input.avatar) {
    formData.append('avatar', input.avatar)
  }

  const response = await apiClient.patch<User>(
    '/profile',
    formData,
  )

  return response.data
}

export async function changePassword(
  input: ChangePasswordInput,
): Promise<void> {
  await apiClient.post(
    '/profile/change-password',
    input,
  )
}