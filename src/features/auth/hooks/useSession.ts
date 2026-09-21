import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

import { getProfile } from '../../../lib/api/profile'
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  updateStoredUser,
} from '../../../lib/auth/storage'

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
        /*
         * Only a 401 means the session is genuinely dead — the
         * request interceptor has already tried to refresh by the
         * time we see one. A 500 or a dropped connection says
         * nothing about the tokens, so signing the user out over it
         * would turn a blip into a forced re-login.
         */
        if (
          isAxiosError(error) &&
          error.response?.status === 401
        ) {
          clearAuthSession()
        }

        throw error
      }
    },

    enabled: Boolean(accessToken && refreshToken),

    /* Give transient failures one more chance; never retry a 401. */
    retry: (failureCount, error) => {
      if (
        isAxiosError(error) &&
        error.response?.status === 401
      ) {
        return false
      }

      return failureCount < 2
    },
  })
}
