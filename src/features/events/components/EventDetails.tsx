import { format, parseISO } from 'date-fns'
import type { Event } from '../../../lib/api/types'

interface EventDetailsProps {
  event: Event
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
  isDeleting?: boolean
}

export function EventDetails({
  event,
  onEdit,
  onDelete,
  onClose,
  isDeleting = false,
}: EventDetailsProps) {
  const start = parseISO(event.startsAt)
  const end = parseISO(event.endsAt)

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-white shadow-xl">
      {/* Event color accent */}
      <div
        className="absolute bottom-0 left-0 top-0 w-1.5"
        style={{ backgroundColor: event.color }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-7 pb-4 pt-6">
        <h2 className="min-w-0 flex-1 truncate text-[18px] font-semibold text-ink">
          {event.title}
        </h2>

        <div className="flex shrink-0 items-center gap-2">
          {/* Edit */}
          <button
            type="button"
            aria-label="Edit event"
            onClick={onEdit}
            className="
              flex size-10 items-center justify-center
              rounded-lg border border-border
              text-ink/55
              transition-colors
              hover:bg-canvas
              hover:text-ink
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary/30
            "
          >
            <EditIcon />
          </button>

          {/* Delete */}
          <button
            type="button"
            aria-label="Delete event"
            onClick={onDelete}
            disabled={isDeleting}
            className="
              flex size-10 items-center justify-center
              rounded-lg border border-danger/35
              text-danger
              transition-colors
              hover:bg-danger/5
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-danger/30
              disabled:pointer-events-none
              disabled:opacity-50
            "
          >
            <DeleteIcon />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="px-7">
        {/* Date / time */}
        <div className="flex items-center gap-3">
          <span className="flex w-5 shrink-0 justify-center text-ink/45">
            <CalendarIcon />
          </span>

          <p className="text-[13px] font-medium text-ink/75">
            {format(start, 'EEE, MMM d')}
            <span className="mx-2 text-ink/30">·</span>
            {format(start, 'h:mm a')}
            <span className="mx-1.5 text-ink/40">–</span>
            {format(end, 'h:mm a')}
          </p>
        </div>

        {/* Location */}
        {event.location && (
          <div className="mt-4 flex items-center gap-3">
            <span className="flex w-5 shrink-0 justify-center text-ink/45">
              <LocationIcon />
            </span>

            <p className="text-[13px] text-ink/65">
              {event.location}
            </p>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div className="mt-5 border-t border-border pt-5">
            <p className="whitespace-pre-wrap text-[13px] leading-5 text-ink/65">
              {event.description}
            </p>
          </div>
        )}

        {/* Join call — visual only */}
        <button
          type="button"
          className="
            mb-6 mt-5
            flex h-11 w-full
            items-center justify-center
            rounded-lg
            bg-primary
            text-[13px]
            font-semibold
            text-white
            shadow-[0px_8px_20px_0px_#3568F833]
            transition-opacity
            hover:opacity-90
          "
        >
          Join call
        </button>
      </div>

      {/* Hidden close behavior through parent Modal */}
      <button
        type="button"
        aria-label="Close event details"
        onClick={onClose}
        className="sr-only"
      >
        Close
      </button>
    </div>
  )
}

/* Icons */

function CalendarIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 9h18" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}


function EditIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
    </svg>
  )
}