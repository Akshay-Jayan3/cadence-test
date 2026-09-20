import { endOfWeek, format, startOfWeek } from 'date-fns'

import { Button } from '../../../components/ui/Button'
import { Tabs } from '../../../components/ui/Tab'

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

const viewTabs = [
  { value: 'day' as const, label: 'Day' },
  { value: 'week' as const, label: 'Week' },
  { value: 'month' as const, label: 'Month' },
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
  const weekStart = startOfWeek(date, {
    weekStartsOn: 0,
  })

  const weekEnd = endOfWeek(date, {
    weekStartsOn: 0,
  })

  const weekLabel = getWeekLabel(
    weekStart,
    weekEnd,
  )

  return (
    <>
      {/* Search / top actions */}
      <div className="flex h-12 items-center gap-4 border-b border-border px-4">
        <div className="relative w-48">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-ink/30">
            ⌕
          </span>

          <input
            type="search"
            placeholder="Search events"
            className="h-7 w-full rounded-md bg-canvas pl-7 pr-3 text-[10px] text-ink outline-none placeholder:text-ink/35 focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <div className="ml-auto flex items-center gap-3 text-ink/40">
          <span className="text-xs">♧</span>
          <span className="text-xs">◌</span>

          <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">
            JA
          </div>
        </div>
      </div>

      {/* Calendar controls */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2">
        <button
          type="button"
          onClick={onToday}
          className="rounded-md bg-primary/5 px-3 py-1.5 text-[10px] font-medium text-primary hover:bg-primary/10"
        >
          Today
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous week"
            onClick={onPrevious}
            className="flex size-7 items-center justify-center rounded-md text-ink/50 hover:bg-canvas hover:text-ink"
          >
            ‹
          </button>

          <button
            type="button"
            aria-label="Next week"
            onClick={onNext}
            className="flex size-7 items-center justify-center rounded-md text-ink/50 hover:bg-canvas hover:text-ink"
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
            onClick={onCreateEvent} size="sm" variant="primary">
            + Add event
          </Button>
        </div>
      </div>
    </>
  )
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