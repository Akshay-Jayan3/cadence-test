export type CalendarView = 'day' | 'week' | 'month'

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
}
