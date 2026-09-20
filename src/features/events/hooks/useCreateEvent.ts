import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createEvent } from '../../../lib/api/events'
import type { CreateEventInput } from '../../../lib/api/types'

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
      })
    },
  })
}