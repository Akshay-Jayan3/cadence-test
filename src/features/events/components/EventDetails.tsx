import { format, parseISO } from 'date-fns'

import type { Event } from '../../../lib/api/types'
import { Button } from '../../../components/ui/Button'

interface EventDetailsProps {
  event: Event
  onEdit: () => void
  onClose: () => void
}

export function EventDetails({
  event,
  onEdit,
  onClose,
}: EventDetailsProps) {
  const start = parseISO(event.startAt)
  const end = parseISO(event.endAt)

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-white shadow-xl">
      <div className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div className="min-w-0">
          <div
            className="mb-3 h-2 w-10 rounded-full"
            style={{ backgroundColor: event.color }}
          />

          <h2 className="truncate text-title font-semibold text-ink">
            {event.title}
          </h2>
        </div>

        <button
          type="button"
          aria-label="Close event details"
          className="shrink-0 text-ink/50 hover:text-ink"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div>
          <p className="text-label font-medium text-ink/50">
            Time
          </p>

          <p className="mt-1 text-body text-ink">
            {format(start, 'EEEE, MMMM d')}
          </p>

          <p className="text-body text-ink">
            {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
          </p>
        </div>

        {event.location && (
          <div>
            <p className="text-label font-medium text-ink/50">
              Location
            </p>

            <p className="mt-1 text-body text-ink">
              {event.location}
            </p>
          </div>
        )}

        {event.description && (
          <div>
            <p className="text-label font-medium text-ink/50">
              Description
            </p>

            <p className="mt-1 whitespace-pre-wrap text-body text-ink">
              {event.description}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>

          <Button onClick={onEdit}>
            Edit event
          </Button>
        </div>
      </div>
    </div>
  )
}