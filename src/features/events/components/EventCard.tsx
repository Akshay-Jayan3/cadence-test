import { format, parseISO } from 'date-fns'

import type { Event } from '../../../lib/api/types'

interface EventCardProps {
  event: Event
  onClick?: (event: Event) => void
}

export function EventCard({
  event,
  onClick,
}: EventCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      className="h-full w-full overflow-hidden rounded-md border border-black/5 px-2 py-1.5 text-left transition-shadow hover:shadow-sm"
      style={{
        backgroundColor: `${event.color}18`,
        borderColor: `${event.color}45`,
      }}
    >
      <p
        className="truncate text-[10px] font-semibold"
        style={{ color: event.color }}
      >
        {event.title}
      </p>

      <p
        className="mt-0.5 truncate text-[9px]"
        style={{ color: `${event.color}B3` }}
      >
        {format(
          parseISO(event.startAt),
          'h:mm a',
        )}
        {' – '}
        {format(
          parseISO(event.endAt),
          'h:mm a',
        )}
      </p>

      {event.location && (
        <p
          className="mt-0.5 truncate text-[8px]"
          style={{ color: `${event.color}B3` }}
        >
          {event.location}
        </p>
      )}
    </button>
  )
}