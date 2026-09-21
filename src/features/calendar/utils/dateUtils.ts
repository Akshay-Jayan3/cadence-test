import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'

/*
 * The design's week runs Monday → Sunday. date-fns wants this as a
 * numeric option in half a dozen places, so it is declared once here
 * rather than repeated at every call site — which is how the week
 * grid and the mini month picker drifted apart in the first place.
 */
export const WEEK_STARTS_ON = 1 as const

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON })

  return Array.from({ length: 7 }, (_, index) =>
    addDays(start, index),
  )
}

export function getMonthDays(date: Date): Date[] {
  const start = startOfWeek(startOfMonth(date), {
    weekStartsOn: WEEK_STARTS_ON,
  })

  const end = endOfWeek(endOfMonth(date), {
    weekStartsOn: WEEK_STARTS_ON,
  })

  const days: Date[] = []
  let current = start

  while (current <= end) {
    days.push(current)
    current = addDays(current, 1)
  }

  return days
}

export function isSameCalendarDay(
  first: Date,
  second: Date,
): boolean {
  return isSameDay(first, second)
}

export function isCurrentMonth(
  date: Date,
  referenceDate: Date,
): boolean {
  return isSameMonth(date, referenceDate)
}

export function isTodayDate(date: Date): boolean {
  return isToday(date)
}

export function formatCalendarDate(
  date: Date,
  pattern: string,
): string {
  return format(date, pattern)
}

export function getPreviousMonth(date: Date): Date {
  return subMonths(date, 1)
}

export function getNextMonth(date: Date): Date {
  return addMonths(date, 1)
}


export function getWeekRange(date: Date) {
  return {
    from: startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }),
    to: endOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }),
  }
}