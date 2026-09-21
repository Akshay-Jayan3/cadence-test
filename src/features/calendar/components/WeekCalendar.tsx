import { useCallback, useEffect, useRef } from 'react'
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
import { applyDrag, useEventDrag } from '../hooks/useEventDrag'

/*
 * The grid covers the full day so an event can never be positioned
 * outside it, but it opens scrolled to the start of the working day
 * rather than to midnight.
 */
const INITIAL_SCROLL_HOUR = 8

interface WeekCalendarProps {
  date: Date
  events?: Event[]
  startHour?: number
  endHour?: number
  hourHeight?: number
  onTimeSlotClick?: (date: Date) => void
  onEventClick?: (event: Event) => void
  onEventDrop?: (
    event: Event,
    startsAt: string,
    endsAt: string,
  ) => void
}

export function WeekCalendar({
  date,
  events = [],
  startHour = 0,
  endHour = 24,
  hourHeight = 80,
  onTimeSlotClick,
  onEventClick,
  onEventDrop,
}: WeekCalendarProps) {
  const days = getWeekDays(date)
  const scrollRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const hours = Array.from(
    { length: endHour - startHour },
    (_, index) => startHour + index,
  )

  const getColumnWidth = useCallback(
    () => (gridRef.current?.clientWidth ?? 0) / days.length,
    [days.length],
  )

  const drag = useEventDrag({
    hourHeight,
    dayCount: days.length,
    getColumnWidth,
    onCommit: (event, startsAt, endsAt) => {
      onEventDrop?.(event, startsAt, endsAt)
    },
  })

  useEffect(() => {
    const scroller = scrollRef.current

    if (!scroller) {
      return
    }

    scroller.scrollTop =
      Math.max(INITIAL_SCROLL_HOUR - startHour, 0) *
      hourHeight
  }, [startHour, hourHeight])

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-auto bg-canvas"
    >

        {/* =========================
            DAY HEADER
        ========================== */}

        <div className="sticky top-0 z-30 ml-[80px] grid grid-cols-7 bg-canvas">
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
            ref={gridRef}
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
            {days.map((day, dayIndex) => {
              const today = isToday(day)

              const dayEvents = events.filter((event) =>
                isSameDay(parseISO(event?.startsAt), day),
              )

              /*
               * A column holding a dragging event has to outrank its
               * siblings, or the card slides underneath the days to
               * its right.
               */
              const hasDraggingEvent = dayEvents.some(
                (event) =>
                  event.id === drag.preview?.eventId,
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
                      hasDraggingEvent ? 'z-40' : ''
                    }
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
                    const isDragging =
                      drag.preview?.eventId === event.id

                    /*
                     * While dragging, the card renders the times it
                     * would land on, so the label tracks the gesture.
                     */
                    const displayEvent = isDragging
                      ? {
                          ...event,
                          ...applyDrag(
                            event,
                            drag.preview!.mode,
                            drag.preview!.dayDelta,
                            drag.preview!.minuteDelta,
                          ),
                        }
                      : event

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

                    const height = isDragging
                      ? getEventPosition({
                          startsAt: displayEvent.startsAt,
                          endsAt: displayEvent.endsAt,
                          day,
                          startHour,
                          hourHeight,
                        })?.height ?? position.height
                      : position.height

                    const offsetX =
                      isDragging &&
                      drag.preview!.mode === 'move'
                        ? drag.preview!.dayDelta *
                          drag.preview!.columnWidth
                        : 0

                    const offsetY =
                      isDragging &&
                      drag.preview!.mode === 'move'
                        ? (drag.preview!.minuteDelta / 60) *
                          hourHeight
                        : 0

                    return (
                      <div
                        key={event.id}
                        className={`
                          group
                          absolute
                          left-1
                          right-1
                          touch-none
                          ${
                            isDragging
                              ? 'z-40 cursor-grabbing opacity-90 drop-shadow-lg'
                              : 'z-10 cursor-grab'
                          }
                        `}
                        style={{
                          top: position.top,
                          height,
                          transform: `translate(${offsetX}px, ${offsetY}px)`,
                        }}
                        onPointerDown={(pointerEvent) =>
                          drag.start(
                            pointerEvent,
                            event,
                            dayIndex,
                            'move',
                          )
                        }
                        onPointerMove={drag.move}
                        onPointerUp={drag.end}
                        onPointerCancel={drag.cancel}
                        onClick={() => {
                          if (
                            drag.consumeClickSuppression()
                          ) {
                            return
                          }

                          onEventClick?.(event)
                        }}
                      >
                        <EventCard event={displayEvent} />

                        {/* Resize handle */}
                        <div
                          role="presentation"
                          aria-hidden="true"
                          className="
                            absolute
                            -bottom-1
                            left-1/2
                            h-2.5
                            w-8
                            -translate-x-1/2
                            cursor-ns-resize
                            rounded-full
                          "
                          onPointerDown={(
                            pointerEvent,
                          ) => {
                            pointerEvent.stopPropagation()

                            drag.start(
                              pointerEvent,
                              event,
                              dayIndex,
                              'resize',
                            )
                          }}
                        >
                          <span
                            className="
                              pointer-events-none
                              absolute
                              left-1/2
                              top-1/2
                              h-1
                              w-6
                              -translate-x-1/2
                              -translate-y-1/2
                              rounded-full
                              opacity-0
                              transition-opacity
                              group-hover:opacity-60
                            "
                            style={{
                              backgroundColor: event.color,
                            }}
                          />
                        </div>
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