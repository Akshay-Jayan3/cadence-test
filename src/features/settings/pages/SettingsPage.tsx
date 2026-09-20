import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowLeft,
  Bell,
  Camera,
  LockKeyhole,
  UserRound,
} from 'lucide-react'

import { Avatar } from '../../../components/ui/Avatar'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Switch } from '../../../components/ui/Switch'

import { useSession } from '../../auth/hooks/useSession'
import { useChangePassword } from '../hooks/useChangePassword'
import { useUpdateProfile } from '../hooks/useUpdateProfile'

const MAX_AVATAR_SIZE = 300 * 1024

const ALLOWED_AVATAR_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]

export function SettingsPage() {
  const navigate = useNavigate()

  const sessionQuery = useSession()
  const updateProfileMutation = useUpdateProfile()
  const changePasswordMutation = useChangePassword()

  const user = sessionQuery.data

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [avatar, setAvatar] = useState<File | undefined>()
  const [avatarPreview, setAvatarPreview] = useState<string>()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [signOutOtherSessions, setSignOutOtherSessions] =
    useState(true)

  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    if (!user) {
      return
    }

    setName(user.name)
    setEmail(user.email)
  }, [user])

  /*
   * Create a temporary local preview when the user selects
   * a new avatar.
   */
  useEffect(() => {
    if (!avatar) {
      setAvatarPreview(undefined)
      return
    }

    const objectUrl = URL.createObjectURL(avatar)

    setAvatarPreview(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [avatar])

  function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setProfileError('')
    setProfileMessage('')

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setProfileError(
        'Please choose a PNG, JPEG, WebP, or GIF image.',
      )

      event.target.value = ''
      return
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setProfileError(
        'Avatar image must be smaller than 300 KB.',
      )

      event.target.value = ''
      return
    }

    setAvatar(file)
  }

  function handleProfileSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setProfileError('')
    setProfileMessage('')

    updateProfileMutation.mutate(
      {
        name,
        email,
        avatar,
      },
      {
        onSuccess: () => {
          setProfileMessage(
            'Profile updated successfully.',
          )

          setAvatar(undefined)
        },

        onError: () => {
          setProfileError(
            'Unable to update your profile. Please try again.',
          )
        },
      },
    )
  }

  function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setPasswordError('')
    setPasswordMessage('')

    if (newPassword !== confirmPassword) {
      setPasswordError(
        'New passwords do not match.',
      )

      return
    }

    changePasswordMutation.mutate(
      {
        currentPassword,
        newPassword,
      },
      {
        onSuccess: () => {
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')

          setPasswordMessage(
            'Password updated successfully.',
          )
        },

        onError: () => {
          setPasswordError(
            'Unable to update your password. Please try again.',
          )
        },
      },
    )
  }

  if (sessionQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas">
        <p className="text-body text-ink/60">
          Loading...
        </p>
      </main>
    )
  }

  if (!user) {
    return null
  }

  const initials = getInitials(user.name)

  /*
   * The API may expose createdAt depending on the user shape.
   * We only display it when it actually exists.
   */
  const memberSince =
    'createdAt' in user &&
    typeof user.createdAt === 'string'
      ? formatMemberSince(user.createdAt)
      : undefined

  return (
    <main className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="flex h-16 items-center gap-3 border-b border-border bg-white px-6">
        <button
          type="button"
          aria-label="Go back to calendar"
          onClick={() => navigate('/calendar')}
          className="
            flex size-8 items-center justify-center
            rounded-md text-ink/50
            transition-colors
            hover:bg-canvas hover:text-ink
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-primary/30
          "
        >
          <ArrowLeft className="size-4" />
        </button>

        <h1 className="text-title font-semibold text-ink">
          Settings
        </h1>
      </header>

      <div className="mx-auto flex max-w-5xl gap-8 px-6 py-8">
        {/* Settings navigation */}
        <aside className="w-40 shrink-0">
          <nav className="flex flex-col gap-1">
            <SettingsNavItem
              active
              label="Account"
              icon={<UserRound className="size-3.5" />}
            />

            <SettingsNavItem
              label="Security"
              icon={
                <LockKeyhole className="size-3.5" />
              }
            />

            <SettingsNavItem
              label="Notifications"
              icon={<Bell className="size-3.5" />}
            />
          </nav>
        </aside>

        {/* Main settings content */}
        <section className="min-w-0 max-w-2xl flex-1">
          {/* Profile details */}
          <section className="rounded-xl border border-border bg-white p-6">
            <div className="mb-6">
              <h2 className="text-title font-semibold text-ink">
                Profile details
              </h2>

              <p className="mt-1 text-label text-ink/50">
                How you appear to your team.
              </p>
            </div>

            <form onSubmit={handleProfileSubmit}>
              {/* Avatar */}
              <div className="mb-6 flex items-center gap-4">
                <div className="relative">
                  <Avatar
                    src={
                      avatarPreview ??
                      getAvatarUrl(user.avatarUrl)
                    }
                    fallback={initials}
                    alt={user.name}
                    size="lg"
                  />

                  {/* Camera upload button */}
                  <label
                    htmlFor="settings-avatar"
                    aria-label="Change profile photo"
                    className="
                      absolute bottom-0 right-0
                      flex size-5 cursor-pointer
                      items-center justify-center
                      rounded-full border-2 border-white
                      bg-primary text-white
                      shadow-sm
                      transition-transform
                      hover:scale-105
                      focus-within:ring-2
                      focus-within:ring-primary/30
                    "
                  >
                    <Camera className="size-2.5" />

                    <input
                      id="settings-avatar"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleAvatarChange}
                      className="sr-only"
                    />
                  </label>
                </div>

                <div className="min-w-0">
                  <p className="text-body font-semibold text-ink">
                    {user.name}
                  </p>

                  {memberSince && (
                    <p className="mt-0.5 text-label text-ink/50">
                      Member since {memberSince}
                    </p>
                  )}

                  <label
                    htmlFor="settings-avatar"
                    className="
                      mt-1 inline-block
                      cursor-pointer
                      text-label font-medium text-primary
                      hover:underline
                    "
                  >
                    Change photo
                  </label>
                </div>
              </div>

              {/* Profile fields */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="settings-name"
                  label="Full name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />

                <Input
                  id="settings-email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />
              </div>

              {/* Profile error */}
              {profileError && (
                <p
                  role="alert"
                  className="mt-4 text-label text-danger"
                >
                  {profileError}
                </p>
              )}

              {/* Profile success */}
              {profileMessage && (
                <p className="mt-4 text-label text-primary">
                  {profileMessage}
                </p>
              )}

              {/* Save */}
              <div className="mt-6 flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    updateProfileMutation.isPending
                  }
                >
                  {updateProfileMutation.isPending
                    ? 'Saving...'
                    : 'Save changes'}
                </Button>
              </div>
            </form>
          </section>

          {/* Change password */}
          <section className="mt-5 rounded-xl border border-border bg-white p-6">
            <div className="mb-6">
              <h2 className="text-title font-semibold text-ink">
                Change password
              </h2>

              <p className="mt-1 text-label text-ink/50">
                You'll stay logged in on this device.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="flex flex-col gap-4">
                <Input
                  id="current-password"
                  label="Current password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(
                      event.target.value,
                    )
                  }
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="new-password"
                    label="New password"
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value,
                      )
                    }
                    required
                  />

                  <Input
                    id="confirm-new-password"
                    label="Confirm new password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    required
                  />
                </div>

                <PasswordStrength
                  password={newPassword}
                />

                <div className="my-2 border-t border-border" />

                {/* Sign out other sessions */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body font-medium text-ink">
                      Sign out other sessions
                    </p>

                    <p className="text-label text-ink/50">
                      Log out everywhere else after this
                      change
                    </p>
                  </div>

                  <Switch
                    id="sign-out-sessions"
                    checked={signOutOtherSessions}
                    onChange={(event) =>
                      setSignOutOtherSessions(
                        event.target.checked,
                      )
                    }
                  />
                </div>

                {/* Password error */}
                {passwordError && (
                  <p
                    role="alert"
                    className="text-label text-danger"
                  >
                    {passwordError}
                  </p>
                )}

                {/* Password success */}
                {passwordMessage && (
                  <p className="text-label text-primary">
                    {passwordMessage}
                  </p>
                )}

                {/* Update password */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      changePasswordMutation.isPending
                    }
                  >
                    {changePasswordMutation.isPending
                      ? 'Updating...'
                      : 'Update password'}
                  </Button>
                </div>
              </div>
            </form>
          </section>
        </section>
      </div>
    </main>
  )
}

interface SettingsNavItemProps {
  label: string
  icon: ReactNode
  active?: boolean
}

function SettingsNavItem({
  label,
  icon,
  active = false,
}: SettingsNavItemProps) {
  return (
    <button
      type="button"
      disabled={!active}
      className={`
        flex items-center gap-3
        rounded-md px-3 py-2
        text-left text-label font-medium
        transition-colors
        disabled:cursor-default
        ${
          active
            ? 'bg-primary/5 text-primary'
            : 'text-ink/60'
        }
      `}
    >
      {icon}
      {label}
    </button>
  )
}

function PasswordStrength({
  password,
}: {
  password: string
}) {
  const strength = getPasswordStrength(password)

  if (!password) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: 3 }).map((_, index) => (
          <span
            key={index}
            className={`
              h-1 w-5 rounded-full
              ${
                index < strength
                  ? 'bg-primary'
                  : 'bg-border'
              }
            `}
          />
        ))}
      </div>

      <span className="text-label text-ink/50">
        {strength === 3
          ? 'Strong'
          : strength === 2
            ? 'Medium'
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

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

/**
 * The API returns avatarUrl as something like:
 *
 * /avatars/3f2a1c9e-....jpg
 *
 * The avatar endpoint is public, so the browser can load
 * the image directly from the API base URL.
 */
function getAvatarUrl(avatarUrl: string | null) {
  if (!avatarUrl) {
    return undefined
  }

  if (avatarUrl.startsWith('http')) {
    return avatarUrl
  }

  return new URL(
    avatarUrl,
    import.meta.env.VITE_API_BASE_URL,
  ).toString()
}

function formatMemberSince(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return ''
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}