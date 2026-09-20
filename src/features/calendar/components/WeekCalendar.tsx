import {
  format,
  getHours,
  getMinutes,
  isSameDay,
  isToday,
  isWeekend,
  parseISO,
} from 'date-fns'
import type { Event } from '../../../lib/api/types'
import { EventCard } from '../../events/components/EventCard'
import { getWeekDays } from '../utils/dateUtils'
import { getEventPosition } from '../utils/eventPosition'

interface WeekCalendarProps {
  date: Date
  events?: Event[]
  startHour?: number
  endHour?: number
  hourHeight?: number
  onTimeSlotClick?: (date: Date) => void
  onEventClick?: (event: Event) => void
}

export function WeekCalendar({
  date,
  events = [],
  startHour = 8,
  endHour = 19,
  hourHeight = 80,
  onTimeSlotClick,
  onEventClick,
}: WeekCalendarProps) {
  const days = getWeekDays(date)

  const hours = Array.from(
    { length: endHour - startHour },
    (_, index) => startHour + index,
  )

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[700px] overflow-auto bg-canvas">
      <div className="min-w-[1360px]">

        {/* =========================
            DAY HEADER
        ========================== */}

        <div className="ml-[80px] grid grid-cols-7">
          {days.map((day) => {
            const today = isToday(day)
            const weekend = isWeekend(day)

            return (
              <div
                key={day.toISOString()}
                className="flex h-16 flex-col items-center justify-center"
              >
                <p
                  className={`
                    text-[8px]
                    font-medium
                    uppercase
                    tracking-wide
                    ${
                      today
                        ? 'text-primary'
                        : weekend
                          ? 'text-ink/25'
                          : 'text-ink/40'
                    }
                  `}
                >
                  {format(day, 'EEE')}
                </p>

                <div
                  className={`
                    mt-1
                    flex
                    size-7
                    items-center
                    justify-center
                    rounded-full
                    text-[10px]
                    font-semibold
                    ${
                      today
                        ? 'bg-primary text-white'
                        : weekend
                          ? 'text-ink/35'
                          : 'text-ink/60'
                    }
                  `}
                >
                  {format(day, 'd')}
                </div>
              </div>
            )
          })}
        </div>

        {/* =========================
            CALENDAR BODY
        ========================== */}

        <div className="relative">

          {/* Hour labels — OUTSIDE the grid */}
          <div
            className="
              pointer-events-none
              absolute
              left-0
              top-0
              w-[80px]
            "
          >
            {hours.map((hour) => (
              <div
                key={hour}
                className="relative"
                style={{
                  height: hourHeight,
                }}
              >
                <span
                  className="
                    absolute
                    -top-2
                    right-6
                    whitespace-nowrap
                    text-[8px]
                    font-medium
                    text-ink/40
                  "
                >
                  {formatHour(hour)}
                </span>
              </div>
            ))}
          </div>

          {/* =========================
              ACTUAL CALENDAR GRID
          ========================== */}

          <div
            className="
              ml-[80px]
              grid
              grid-cols-7
              overflow-hidden
              rounded-lg
              border
              border-border
              bg-white
            "
          >
            {days.map((day) => {
              const today = isToday(day)

              const dayEvents = events.filter((event) =>
                isSameDay(parseISO(event?.startsAt), day),
              )

              return (
                <div
                  key={day.toISOString()}
                  className={`
                    relative
                    border-l
                    border-border
                    first:border-l-0
                    ${
                      today
                        ? 'bg-primary/[0.018]'
                        : 'bg-white'
                    }
                  `}
                >
                  {/* Hour rows */}
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      aria-label={`Create event on ${format(
                        day,
                        'EEEE, MMMM d',
                      )} at ${formatHour(hour)}`}
                      className="
                        block
                        w-full
                        border-b
                        border-border
                        text-left
                        transition-colors
                        last:border-b-0
                        hover:bg-primary/[0.025]
                      "
                      style={{
                        height: hourHeight,
                      }}
                      onClick={() => {
                        const slotDate = new Date(day)

                        slotDate.setHours(hour, 0, 0, 0)

                        onTimeSlotClick?.(slotDate)
                      }}
                    />
                  ))}

                  {/* Events */}
                  {dayEvents.map((event) => {
                    const position = getEventPosition({
                      startsAt: event.startsAt,
                      endsAt: event.endsAt,
                      day,
                      startHour,
                      hourHeight,
                    })

                    if (!position) {
                      return null
                    }

                    return (
                      <div
                        key={event.id}
                        className="
                          absolute
                          left-1
                          right-1
                          z-10
                        "
                        style={{
                          top: position.top,
                          height: position.height,
                        }}
                      >
                        <EventCard
                          event={event}
                          onClick={onEventClick}
                        />
                      </div>
                    )
                  })}

                  {/* Current time */}
                  {today && (
                    <CurrentTimeIndicator
                      startHour={startHour}
                      endHour={endHour}
                      hourHeight={hourHeight}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatHour(hour: number): string {
  return format(
    new Date(2000, 0, 1, hour),
    'h a',
  )
}

interface CurrentTimeIndicatorProps {
  startHour: number
  endHour: number
  hourHeight: number
}

function CurrentTimeIndicator({
  startHour,
  endHour,
  hourHeight,
}: CurrentTimeIndicatorProps) {
  const now = new Date()

  const minutesSinceStart =
    (getHours(now) - startHour) * 60 +
    getMinutes(now)

  if (minutesSinceStart < 0) {
    return null
  }

  const visibleMinutes =
    (endHour - startHour) * 60

  if (minutesSinceStart > visibleMinutes) {
    return null
  }

  const top =
    (minutesSinceStart / 60) * hourHeight

  return (
    <div
      className="
        pointer-events-none
        absolute
        left-0
        right-0
        z-20
      "
      style={{ top }}
    >
      <div className="relative h-px bg-danger">
        <span
          className="
            absolute
            -left-1
            -top-1
            size-2
            rounded-full
            bg-danger
          "
        />
      </div>
    </div>
  )
}