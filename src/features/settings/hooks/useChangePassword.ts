import { useMutation } from '@tanstack/react-query'

import { changePassword } from '../../../lib/api/profile'
import type { ChangePasswordInput } from '../../../lib/api/types'

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      changePassword(input),
  })
}