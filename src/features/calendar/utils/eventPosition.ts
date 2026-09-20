import {
  differenceInMinutes,
  parseISO,
} from 'date-fns'

interface EventPositionParams {
  startAt: string
  endAt: string
  day: Date
  startHour: number
  hourHeight: number
}

interface EventPosition {
  top: number
  height: number
}

export function getEventPosition({
  startAt,
  endAt,
  day,
  startHour,
  hourHeight,
}: EventPositionParams): EventPosition | null {
  const eventStart = parseISO(startAt)
  const eventEnd = parseISO(endAt)

  const dayStart = new Date(day)
  dayStart.setHours(startHour, 0, 0, 0)

  const nextDay = new Date(day)
  nextDay.setDate(nextDay.getDate() + 1)
  nextDay.setHours(startHour, 0, 0, 0)

  const visibleStart = eventStart < dayStart
    ? dayStart
    : eventStart

  const visibleEnd = eventEnd > nextDay
    ? nextDay
    : eventEnd

  if (visibleEnd <= visibleStart) {
    return null
  }

  const minutesFromStart = differenceInMinutes(
    visibleStart,
    dayStart,
  )

  const duration = differenceInMinutes(
    visibleEnd,
    visibleStart,
  )

  return {
    top: (minutesFromStart / 60) * hourHeight,
    height: (duration / 60) * hourHeight,
  }
}