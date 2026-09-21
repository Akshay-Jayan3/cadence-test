import { useQueryClient } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'

import { MiniCalendar } from './MiniCalendar'
import { useSession } from '../../auth/hooks/useSession'
import { getStoredUser } from '../../../lib/auth/storage'
import { logout } from '../../../lib/auth/session'

interface CalendarSidebarProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  onCreateEvent: () => void
}

export function CalendarSidebar({
  selectedDate,
  onDateChange,
  onCreateEvent,
}: CalendarSidebarProps) {
  const sessionQuery = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Stored user gives us an immediate fallback while /profile loads.
  const user =
    sessionQuery.data ?? getStoredUser()

  function handleLogout() {
    logout()

    /*
     * Drop the cached profile and events with the tokens, so the
     * next account to sign in on this browser never sees them.
     */
    queryClient.clear()

    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-white">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2 border-border px-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-white">
          <span className="text-xs">▣</span>
        </div>

        <span className="text-label font-semibold text-ink">
          Cadence
        </span>
      </div>

      {/* Create */}
      <div className="p-3">
        <button
          type="button"
          onClick={onCreateEvent}
          className="
            flex h-9 w-full items-center
            justify-center gap-2
            rounded-md bg-primary
            text-label font-medium text-white
            shadow-[0px_8px_20px_0px_#3568F833]
            hover:opacity-90
          "
        >
          <span className="text-sm">+</span>
          Create
        </button>
      </div>

      {/* Mini calendar */}
      <div className="px-4 pb-5">
        <MiniCalendar
          value={selectedDate}
          onChange={onDateChange}
        />
      </div>

      {/* My calendars */}
      <div className="border-t border-border px-4 py-4">
        <p className="mb-3 text-[9px] font-semibold uppercase tracking-wide text-ink/40">
          My calendars
        </p>

        <div className="flex flex-col gap-3">
          <CalendarLegend
            color="#3366FF"
            label="Work"
          />

          <CalendarLegend
            color="#8B5CF6"
            label="Personal"
          />

          <CalendarLegend
            color="#0EA5A5"
            label="Team"
          />

          <CalendarLegend
            color="#F59E0B"
            label="Reminders"
          />
        </div>
      </div>

      {/* Logged-in user */}
{/* User */}
      <div className="mt-auto flex items-center gap-1 border-t border-border p-3">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="
            flex min-w-0 flex-1 items-center gap-2
            rounded-md p-1
            text-left
            transition-colors
            hover:bg-canvas
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-primary/30
          "
        >
          <UserAvatar
            name={user?.name ?? 'User'}
            avatarUrl={user?.avatarUrl ?? null}
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold text-ink">
              {user?.name ?? 'Loading...'}
            </p>

            <p className="truncate text-[9px] text-ink/40">
              {user?.email ?? ''}
            </p>
          </div>
        </button>

        <button
          type="button"
          aria-label="Log out"
          title="Log out"
          onClick={handleLogout}
          className="
            flex size-7 shrink-0 items-center justify-center
            rounded-md text-ink/40
            transition-colors
            hover:bg-canvas hover:text-danger
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-primary/30
          "
        >
          <LogOut size={14} strokeWidth={1.7} />
        </button>
      </div>
    </aside>
  )
}

interface CalendarLegendProps {
  color: string
  label: string
}

function CalendarLegend({
  color,
  label,
}: CalendarLegendProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="size-3.5 rounded-sm"
        style={{ backgroundColor: color }}
      />

      <span className="text-label font-medium text-ink">
        {label}
      </span>
    </div>
  )
}

interface UserAvatarProps {
  name: string
  avatarUrl: string | null
}

function UserAvatar({
  name,
  avatarUrl,
}: UserAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={resolveAvatarUrl(avatarUrl)}
        alt={name}
        className="
          size-7 shrink-0
          rounded-full
          object-cover
        "
      />
    )
  }

  return (
    <div
      className="
        flex size-7 shrink-0
        items-center justify-center
        rounded-full
        bg-primary/10
        text-[10px]
        font-semibold
        text-primary
      "
    >
      {getInitials(name)}
    </div>
  )
}

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return initials || 'U'
}

function resolveAvatarUrl(
  avatarUrl: string,
): string {
  if (
    avatarUrl.startsWith('http://') ||
    avatarUrl.startsWith('https://')
  ) {
    return avatarUrl
  }

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL

  return `${apiBaseUrl}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`
}