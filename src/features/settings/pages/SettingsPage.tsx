import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { Avatar } from '../../../components/ui/Avatar'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Switch } from '../../../components/ui/Switch'

import { useSession } from '../../auth/hooks/useSession'
import { useChangePassword } from '../hooks/useChangePassword'
import { useUpdateProfile } from '../hooks/useUpdateProfile'

export function SettingsPage() {
  const navigate = useNavigate()

  const sessionQuery = useSession()

  const updateProfileMutation = useUpdateProfile()
  const changePasswordMutation = useChangePassword()

  const user = sessionQuery.data

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState<File | undefined>()

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

  function handleAvatarChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setAvatar(event.target.files?.[0])
  }

  function handleProfileSubmit(
    event: React.FormEvent<HTMLFormElement>,
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
          setProfileMessage('Profile updated successfully.')
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
    event: React.FormEvent<HTMLFormElement>,
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

  return (
    <main className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="flex h-16 items-center gap-3 border-b border-border bg-white px-6">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => navigate('/calendar')}
          className="flex size-8 items-center justify-center rounded-md bg-canvas text-ink/60 hover:text-ink"
        >
          ←
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
              icon="♙"
            />

            <SettingsNavItem
              label="Security"
              icon="♧"
            />

            <SettingsNavItem
              label="Notifications"
              icon="♧"
            />
          </nav>
        </aside>

        {/* Content */}
        <section className="min-w-0 max-w-2xl flex-1">
          {/* Profile */}
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
                <Avatar
                  src={
                    avatar
                      ? URL.createObjectURL(avatar)
                      : getAvatarUrl(user.avatarUrl)
                  }
                  fallback={initials}
                  alt={user.name}
                  size="lg"
                />

                <div>
                  <label
                    htmlFor="settings-avatar"
                    className="cursor-pointer text-label font-medium text-primary hover:underline"
                  >
                    Change photo
                  </label>

                  <input
                    id="settings-avatar"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleAvatarChange}
                    className="sr-only"
                  />
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

              {profileError && (
                <p
                  role="alert"
                  className="mt-4 text-label text-danger"
                >
                  {profileError}
                </p>
              )}

              {profileMessage && (
                <p className="mt-4 text-label text-primary">
                  {profileMessage}
                </p>
              )}

              <div className="mt-6 flex justify-end">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
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
                    setCurrentPassword(event.target.value)
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
                      setNewPassword(event.target.value)
                    }
                    required
                  />

                  <Input
                    id="confirm-new-password"
                    label="Confirm new password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    required
                  />
                </div>

                <PasswordStrength password={newPassword} />

                <div className="my-2 border-t border-border" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body font-medium text-ink">
                      Sign out other sessions
                    </p>

                    <p className="text-label text-ink/50">
                      Log out everywhere else after this change
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

                {passwordError && (
                  <p
                    role="alert"
                    className="text-label text-danger"
                  >
                    {passwordError}
                  </p>
                )}

                {passwordMessage && (
                  <p className="text-label text-primary">
                    {passwordMessage}
                  </p>
                )}

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
  icon: string
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
        flex items-center gap-3 rounded-md px-3 py-2 text-left
        text-label font-medium
        ${
          active
            ? 'bg-primary/5 text-primary'
            : 'text-ink/60'
        }
      `}
    >
      <span aria-hidden="true">{icon}</span>
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
            className={`h-1 w-5 rounded-full ${
              index < strength
                ? 'bg-primary'
                : 'bg-border'
            }`}
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

  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
    score += 1
  }

  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) {
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

function getAvatarUrl(avatarUrl: string | null) {
  if (!avatarUrl) {
    return undefined
  }

  if (avatarUrl.startsWith('http')) {
    return avatarUrl
  }

  return `${import.meta.env.VITE_API_BASE_URL}${avatarUrl}`
}