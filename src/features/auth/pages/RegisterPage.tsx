import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'

import { register } from '../../../lib/api/auth'
import { saveAuthResponse } from '../../../lib/auth/session'

const MAX_AVATAR_SIZE = 300 * 1024

const ALLOWED_AVATAR_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]

export function RegisterPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatar, setAvatar] = useState<File | undefined>()

  const [avatarPreview, setAvatarPreview] = useState<string>()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!avatar) {
      setAvatarPreview(undefined)
      return
    }

    const previewUrl = URL.createObjectURL(avatar)

    setAvatarPreview(previewUrl)

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [avatar])

  function handleAvatarChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]

    if (!file) {
      setAvatar(undefined)
      return
    }

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setError(
        'Photo must be PNG, JPEG, WebP, or GIF.',
      )
      event.target.value = ''
      setAvatar(undefined)
      return
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError('Photo must be 300 KB or smaller.')
      event.target.value = ''
      setAvatar(undefined)
      return
    }

    setError('')
    setAvatar(file)
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await register({
        name,
        email,
        password,
        avatar,
      })

      saveAuthResponse(response)

      navigate('/calendar', {
        replace: true,
      })
    } catch (error) {
      setError(getRegisterErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-[40%_60%]">
        {/* Left panel */}
        <section className="relative hidden overflow-hidden bg-linear-to-br from-[#2857E8] via-[#3568F5] to-[#5484FF] text-white lg:flex">
          {/* Top-left decorative circles */}
          <div
            aria-hidden="true"
            className="absolute -left-28 -top-28 size-56 rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute -left-20 -top-20 size-40 rounded-full border border-white/10"
          />

          {/* Bottom-right decorative circles */}
          <div
            aria-hidden="true"
            className="absolute -bottom-28 -right-28 size-56 rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-20 -right-20 size-40 rounded-full border border-white/10"
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
            <div className="mt-auto max-w-sm pb-10">
              <h1 className="text-display font-semibold leading-tight">
                Set up in under a minute. No credit card.
              </h1>

              <p className="mt-4 max-w-xs text-label leading-relaxed text-white/70">
                One calendar for your whole week — day, week,
                or month, whichever fits what you’re planning.
              </p>
            </div>
          </div>
        </section>

        {/* Right panel */}
        <section className="flex min-h-screen items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">
            {/* Heading */}
            <div className="mb-5">
              <h2 className="text-title font-semibold text-ink">
                Create your account
              </h2>

              <p className="mt-1 text-label text-ink/50">
                Already have one?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>

            {/* Avatar */}
            <div className="mb-5 flex items-center gap-3">
              <label
                htmlFor="register-avatar"
                className="relative flex size-12 cursor-pointer items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/15"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Selected avatar"
                    className="size-12 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon />
                )}

                <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-white bg-primary text-white">
                  <CameraIcon />
                </span>
              </label>

              <input
                id="register-avatar"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleAvatarChange}
                className="sr-only"
              />

              <div>
                <p className="text-label font-medium text-ink/60">
                  Add a photo so teammates
                </p>

                <p className="text-label text-ink/40">
                  recognize you (optional).
                </p>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3"
            >
              <Input
                id="register-name"
                label="Full name"
                type="text"
                autoComplete="name"
                placeholder="Jordan Alvarez"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
              />

              <Input
                id="register-email"
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

              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="register-password"
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />

                <Input
                  id="register-confirm-password"
                  label="Confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  required
                />
              </div>

              <PasswordStrength password={password} />

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
                {isSubmitting
                  ? 'Creating account...'
                  : 'Create account'}
              </Button>
            </form>

            {/* Terms */}
            <p className="mt-4 text-center text-[9px] leading-relaxed text-ink/40">
              By continuing you agree to Cadence's{' '}
              <button
                type="button"
                className="hover:text-primary"
              >
                Terms
              </button>{' '}
              and{' '}
              <button
                type="button"
                className="hover:text-primary"
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

function PasswordStrength({
  password,
}: {
  password: string
}) {
  if (!password) {
    return null
  }

  const strength = getPasswordStrength(password)

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: 3 }).map((_, index) => (
          <span
            key={index}
            className={`h-1 w-5 rounded-full ${
              index < strength
                ? 'bg-primary'
                : 'bg-border'
            }`}
          />
        ))}
      </div>

      <span className="text-[9px] text-ink/40">
        {strength === 3
          ? 'Strong'
          : strength === 2
            ? 'Good — add a number to make it strong'
            : 'Weak'}
      </span>
    </div>
  )
}

function getPasswordStrength(password: string) {
  let score = 0

  if (password.length >= 8) {
    score += 1
  }

  if (
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password)
  ) {
    score += 1
  }

  if (
    /\d/.test(password) ||
    /[^A-Za-z0-9]/.test(password)
  ) {
    score += 1
  }

  return score
}

function getRegisterErrorMessage(error: unknown): string {
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

  return 'Unable to create your account. Please try again.'
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="3"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <path
        d="M5.5 19c.8-3.2 3-4.8 6.5-4.8s5.7 1.6 6.5 4.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 8.5h3l1.2-2h5.6l1.2 2H19a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 19 18.5H5A1.5 1.5 0 0 1 3.5 17v-7A1.5 1.5 0 0 1 5 8.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <circle
        cx="12"
        cy="13.5"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  )
}