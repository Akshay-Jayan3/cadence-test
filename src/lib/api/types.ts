

export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  avatar?: File
}

export interface LoginInput {
  email: string
  password: string
}

export interface UpdateProfileInput {
  name?: string
  email?: string
  avatar?: File
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface Event {
  id: string
  title: string
  description: string
  location: string
  startAt: string
  endAt: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface CreateEventInput {
  title: string
  description: string
  location: string
  startAt: string
  endAt: string
  color: string
}

export type UpdateEventInput = Partial<CreateEventInput>