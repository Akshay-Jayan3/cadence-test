import { isAxiosError } from 'axios'

interface ApiErrorBody {
  error?: {
    code?: string
    message?: string
  }
}

/*
 * The API reports failures as { error: { code, message } }. Prefer
 * that message when there is one — it names the offending field —
 * and fall back to something a user can act on otherwise.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (!isAxiosError(error)) {
    return fallback
  }

  const message = (
    error.response?.data as ApiErrorBody | undefined
  )?.error?.message

  if (message) {
    return message
  }

  /* No response at all means the request never landed. */
  if (!error.response) {
    return 'Network error — check your connection and try again.'
  }

  return fallback
}
