import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateEvent } from '../../../lib/api/events'
import type {
  Event,
  UpdateEventInput,
} from '../../../lib/api/types'

interface UpdateEventVariables {
  id: string
  data: UpdateEventInput
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: UpdateEventVariables) =>
      updateEvent(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({
        queryKey: ['events'],
      })

      const previousQueries =
        queryClient.getQueriesData<Event[]>({
          queryKey: ['events'],
        })

      queryClient.setQueriesData<Event[]>(
        { queryKey: ['events'] },
        (currentEvents) => {
          if (!currentEvents) {
            return currentEvents
          }

          return currentEvents.map((event) =>
            event.id === id
              ? {
                  ...event,
                  ...data,
                }
              : event,
          )
        },
      )

      return {
        previousQueries,
      }
    },

    onError: (_error, _variables, context) => {
      if (!context) {
        return
      }

      for (const [queryKey, previousData] of context.previousQueries) {
        queryClient.setQueryData(queryKey, previousData)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
      })
    },
  })
}