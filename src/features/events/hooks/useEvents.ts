import { useQuery } from '@tanstack/react-query'
import { getEvents } from '../../../lib/api/events'

interface UseEventsParams {
  from: Date
  to: Date
}

export function useEvents({
  from,
  to,
}: UseEventsParams) {
  const fromIso = from.toISOString()
  const toIso = to.toISOString()

  return useQuery({
    queryKey: ['events', fromIso, toIso],
    queryFn: () =>
      getEvents({
        from: fromIso,
        to: toIso,
      }),
  })
}