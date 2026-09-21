import { endOfWeek, format, startOfWeek } from 'date-fns'
import { Bell, Info } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { Tabs } from '../../../components/ui/Tab'
import { useSession } from '../../auth/hooks/useSession'
import { getStoredUser } from '../../../lib/auth/storage'
import { WEEK_STARTS_ON } from '../utils/dateUtils'

type CalendarView = 'day' | 'week' | 'month'

interface CalendarToolbarProps {
  date: Date
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  onCreateEvent: () => void
}

/*
 * Only the week view is backed. Day and Month stay visible to match
 * the design, but are disabled rather than selectable-and-empty.
 */
const viewTabs = [
  {
    value: 'day' as const,
    label: 'Day',
    disabled: true,
    title: 'Day view isn’t available in this build',
  },
  {
    value: 'week' as const,
    label: 'Week',
  },
  {
    value: 'month' as const,
    label: 'Month',
    disabled: true,
    title: 'Month view isn’t available in this build',
  },
]

export function CalendarToolbar({
  date,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  onCreateEvent,
}: CalendarToolbarProps) {
  const sessionQuery = useSession()

  const user =
    sessionQuery.data ?? getStoredUser()

  const weekStart = startOfWeek(date, {
    weekStartsOn: WEEK_STARTS_ON,
  })

  const weekEnd = endOfWeek(date, {
    weekStartsOn: WEEK_STARTS_ON,
  })

  const weekLabel = getWeekLabel(
    weekStart,
    weekEnd,
  )

  return (
    <>
      {/* Search / top actions */}
      <div className="flex h-12 shrink-0 items-center gap-4 border-b border-border px-4">
        <div className="relative w-48">
          <span
            className="
              pointer-events-none
              absolute left-3 top-1/2
              -translate-y-1/2
              text-[10px] text-ink/30
            "
          >
            ⌕
          </span>

          {/* Search has no backing endpoint — shown, not wired. */}
          <input
            type="search"
            placeholder="Search events"
            disabled
            aria-label="Search events (not available)"
            title="Search isn't available in this build"
            className="
              h-7 w-full
              cursor-not-allowed
              rounded-md
              bg-canvas
              pl-7 pr-3
              text-[10px]
              text-ink
              opacity-60
              outline-none
              placeholder:text-ink/35
            "
          />
        </div>

        <div className="ml-auto flex items-center gap-3 text-ink/40">
          {/* Notifications and help are visual only. */}
          <button
            type="button"
            disabled
            aria-label="Notifications (not available)"
            title="Notifications aren't available in this build"
            className="
              relative flex size-7 items-center justify-center
              rounded-md text-ink/40
              disabled:cursor-not-allowed
            "
          >
            <Bell size={15} strokeWidth={1.7} />

            <span
              aria-hidden="true"
              className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-danger ring-2 ring-white"
            />
          </button>

          <button
            type="button"
            disabled
            aria-label="Help (not available)"
            title="Help isn't available in this build"
            className="
              flex size-7 items-center justify-center
              rounded-md text-ink/40
              disabled:cursor-not-allowed
            "
          >
            <Info size={15} strokeWidth={1.7} />
          </button>

          <UserAvatar
            name={user?.name ?? 'User'}
            avatarUrl={user?.avatarUrl ?? null}
          />
        </div>
      </div>

      {/* Calendar controls */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
        <button
          type="button"
          onClick={onToday}
          className="
            rounded-md
            bg-primary/5
            px-3 py-1.5
            text-[10px]
            font-medium
            text-primary
            hover:bg-primary/10
          "
        >
          Today
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous week"
            onClick={onPrevious}
            className="
              flex size-7
              items-center justify-center
              rounded-md
              text-ink/50
              hover:bg-canvas
              hover:text-ink
            "
          >
            ‹
          </button>

          <button
            type="button"
            aria-label="Next week"
            onClick={onNext}
            className="
              flex size-7
              items-center justify-center
              rounded-md
              text-ink/50
              hover:bg-canvas
              hover:text-ink
            "
          >
            ›
          </button>
        </div>

        <h2 className="text-label font-semibold text-ink">
          {weekLabel}
        </h2>

        <div className="ml-auto flex items-center gap-2">
          <Tabs
            items={viewTabs}
            value={view}
            onChange={onViewChange}
          />

          <Button
            onClick={onCreateEvent}
            size="sm"
            variant="primary"
          >
            + Add event
          </Button>
        </div>
      </div>
    </>
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
          size-7
          shrink-0
          rounded-full
          object-cover
        "
      />
    )
  }

  return (
    <div
      className="
        flex size-7
        shrink-0
        items-center justify-center
        rounded-full
        bg-primary/10
        text-[9px]
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

function getWeekLabel(
  start: Date,
  end: Date,
): string {
  const sameMonth =
    start.getMonth() === end.getMonth()

  const sameYear =
    start.getFullYear() === end.getFullYear()

  if (sameMonth) {
    return `${format(start, 'MMMM d')}–${format(
      end,
      'd, yyyy',
    )}`
  }

  if (sameYear) {
    return `${format(start, 'MMM d')}–${format(
      end,
      'MMM d, yyyy',
    )}`
  }

  return `${format(start, 'MMM d, yyyy')}–${format(
    end,
    'MMM d, yyyy',
  )}`
}