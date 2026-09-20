import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateProfile } from '../../../lib/api/profile'
import type { UpdateProfileInput } from '../../../lib/api/types'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      updateProfile(input),

    onSuccess: (user) => {
      queryClient.setQueryData(
        ['session'],
        user,
      )
    },
  })
}