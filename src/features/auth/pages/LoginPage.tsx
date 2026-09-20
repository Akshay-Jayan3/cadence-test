import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'

import { Button } from '../../../components/ui/Button'
import { Checkbox } from '../../../components/ui/CheckBox'
import { Input } from '../../../components/ui/Input'

import { login } from '../../../lib/api/auth'
import { saveAuthResponse } from '../../../lib/auth/session'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [stayLoggedIn, setStayLoggedIn] = useState(true)

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')
    setIsSubmitting(true)

    try {
      const response = await login({
        email,
        password,
      })

      saveAuthResponse(response)

      const from =
        (
          location.state as {
            from?: string
          } | null
        )?.from ?? '/calendar'

      navigate(from, { replace: true })
    } catch (error) {
      setError(getLoginErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left panel */}
        <section className="relative hidden overflow-hidden bg-linear-to-br from-[#2857E8] via-[#3568F5] to-[#5484FF] text-white lg:flex">
          {/* Decorative circles */}
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 size-60 rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute -right-12 -top-12 size-44 rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-24 size-72 rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-12 -left-12 size-48 rounded-full border border-white/10"
          />

          <div className="relative flex w-full flex-col p-8 xl:p-10">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-white/15">
                <span className="text-xs">▣</span>
              </div>

              <span className="text-label font-semibold">
                Cadence
              </span>
            </div>

            {/* Marketing copy */}
            <div className="max-w-sm h-full flex flex-col justify-center">
              <h1 className="text-display font-semibold leading-tight">
                A schedule that moves as fast as your day does.
              </h1>

              <p className="mt-4 max-w-xs text-label leading-relaxed text-white/70">
                Drag to reschedule, resize to adjust — every
                change syncs the moment you let go.
              </p>
            </div>
          </div>
        </section>

        {/* Right panel */}
        <section className="flex min-h-screen items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            {/* Heading */}
            <div className="mb-6">
              <h2 className="text-title font-semibold text-ink">
                Welcome back
              </h2>

              <p className="mt-1 text-label text-ink/50">
                Log in to see what's on today.
              </p>
            </div>

            {/* Google */}
            <button
              type="button"
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border bg-white text-label font-medium text-ink hover:bg-canvas"
              onClick={() => {
                // Google OAuth is visual-only.
              }}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />

              <span className="text-[10px] font-medium uppercase text-ink/40">
                OR
              </span>

              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Login form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <Input
                id="login-email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@planetmedia.in"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="text-label font-medium text-ink"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-[10px] font-medium text-primary hover:underline"
                    onClick={() => {
                      // Forgot password is visual-only.
                    }}
                  >
                    Forgot?
                  </button>
                </div>

                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />
              </div>

              <Checkbox
                id="stay-logged-in"
                label="Stay logged in for 30 days"
                checked={stayLoggedIn}
                onChange={(event) =>
                  setStayLoggedIn(event.target.checked)
                }
              />

              {error && (
                <p
                  role="alert"
                  className="text-label text-danger"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="mt-1 h-10 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Log in'}
              </Button>
            </form>

            {/* Register */}
            <p className="mt-5 text-center text-[10px] text-ink/50">
              New to Cadence?{' '}
              <Link
                to="/register"
                className="font-medium text-primary hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.22Z"
      />
      <path
        fill="#34A853"
        d="M12 21.7c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.7Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.8A5.85 5.85 0 0 1 6.23 12c0-.62.11-1.23.31-1.8V7.67H3.3A9.75 9.75 0 0 0 2.26 12c0 1.57.38 3.05 1.04 4.33l3.24-2.53Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.17c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.84 3.28 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.7 5.37l3.24 2.53c.77-2.31 2.92-4.03 5.46-4.03Z"
      />
    </svg>
  )
}

function getLoginErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            error?: {
              message?: string
            }
          }
        }
      }
    ).response

    const message = response?.data?.error?.message

    if (message) {
      return message
    }
  }

  return 'Unable to sign in. Please try again.'
}