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

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 0 })

  return Array.from({ length: 7 }, (_, index) =>
    addDays(start, index),
  )
}

export function getMonthDays(date: Date): Date[] {
  const start = startOfWeek(startOfMonth(date), {
    weekStartsOn: 0,
  })

  const end = endOfWeek(endOfMonth(date), {
    weekStartsOn: 0,
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
    from: startOfWeek(date, { weekStartsOn: 0 }),
    to: endOfWeek(date, { weekStartsOn: 0 }),
  }
}