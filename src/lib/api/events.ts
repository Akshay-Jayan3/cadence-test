import { apiClient } from './client'
import type {
  CreateEventInput,
  Event,
  UpdateEventInput,
} from './types'

interface GetEventsParams {
  from: string
  to: string
}

export async function getEvents(
  params: GetEventsParams,
): Promise<Event[]> {
  const response = await apiClient.get<Event[]>('/events', {
    params,
  })

  return response.data
}

export async function createEvent(
  input: CreateEventInput,
): Promise<Event> {
  const response = await apiClient.post<Event>(
    '/events',
    input,
  )

  return response.data
}

export async function updateEvent(
  id: string,
  input: UpdateEventInput,
): Promise<Event> {
  const response = await apiClient.patch<Event>(
    `/events/${id}`,
    input,
  )

  return response.data
}

export async function deleteEvent(
  id: string,
): Promise<void> {
  await apiClient.delete(`/events/${id}`)
}