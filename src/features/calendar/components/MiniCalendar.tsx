import {
  format,
  isSameDay,
  isToday,
} from 'date-fns'
import { useState } from 'react'

import {
  getMonthDays,
  getNextMonth,
  getPreviousMonth,
  isCurrentMonth,
} from '../utils/dateUtils'

interface MiniCalendarProps {
  value: Date
  onChange: (date: Date) => void
}

/* Monday-first, matching WEEK_STARTS_ON and the week grid. */
const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function MiniCalendar({
  value,
  onChange,
}: MiniCalendarProps) {
  const [visibleMonth, setVisibleMonth] =
    useState(value)

  const days = getMonthDays(visibleMonth)

  function handlePreviousMonth() {
    setVisibleMonth(
      getPreviousMonth(visibleMonth),
    )
  }

  function handleNextMonth() {
    setVisibleMonth(
      getNextMonth(visibleMonth),
    )
  }

  function handleDateChange(date: Date) {
    onChange(date)

    if (!isCurrentMonth(date, visibleMonth)) {
      setVisibleMonth(date)
    }
  }

  return (
    <div className="w-full">
      {/* Month header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[10px] font-semibold text-ink">
          {format(visibleMonth, 'MMMM yyyy')}
        </h2>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={handlePreviousMonth}
            className="flex size-5 items-center justify-center rounded text-ink/40 hover:bg-canvas hover:text-ink"
          >
            ‹
          </button>

          <button
            type="button"
            aria-label="Next month"
            onClick={handleNextMonth}
            className="flex size-5 items-center justify-center rounded text-ink/40 hover:bg-canvas hover:text-ink"
          >
            ›
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7">
        {weekDays.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="flex h-6 items-center justify-center text-[8px] font-medium text-ink/35"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const selected = isSameDay(day, value)
          const today = isToday(day)
          const currentMonth = isCurrentMonth(
            day,
            visibleMonth,
          )

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() =>
                handleDateChange(day)
              }
              className={`
                flex size-6 items-center justify-center
                rounded-full !text-[9px] !font-medium
                transition-colors
                ${
                  !currentMonth
                    ? 'text-ink/20'
                    : selected
                      ? 'bg-primary font-semibold text-white'
                      : today
                        ? 'font-semibold text-primary'
                        : 'text-ink/70 hover:bg-canvas'
                }
              `}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}