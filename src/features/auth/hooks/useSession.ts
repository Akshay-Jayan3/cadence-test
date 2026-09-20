import { useQuery } from '@tanstack/react-query'

import { getProfile } from '../../../lib/api/profile'
import {
  getAccessToken,
  getRefreshToken,
  updateStoredUser,
} from '../../../lib/auth/storage'
import { clearAuthSession } from '../../../lib/auth/storage'

export function useSession() {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()

  return useQuery({
    queryKey: ['session'],

    queryFn: async () => {
      try {
        const user = await getProfile()

        updateStoredUser(user)

        return user
      } catch (error) {
        clearAuthSession()
        throw error
      }
    },

    enabled: Boolean(accessToken && refreshToken),

    retry: false,
  })
}