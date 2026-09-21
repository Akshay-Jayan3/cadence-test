import { describe, expect, it } from 'vitest'

import { getEventPosition } from './eventPosition'

const day = new Date(2026, 8, 21) // Mon 21 Sep 2026, local time

function iso(hours: number, minutes = 0, onDay = 21) {
  return new Date(
    2026,
    8,
    onDay,
    hours,
    minutes,
  ).toISOString()
}

describe('getEventPosition', () => {
  it('places an event at its offset from the start of the grid', () => {
    const position = getEventPosition({
      startsAt: iso(10),
      endsAt: iso(11),
      day,
      startHour: 0,
      hourHeight: 80,
    })

    expect(position).toEqual({ top: 800, height: 80 })
  })

  it('scales height with duration, including part hours', () => {
    const position = getEventPosition({
      startsAt: iso(9),
      endsAt: iso(10, 30),
      day,
      startHour: 0,
      hourHeight: 80,
    })

    expect(position?.height).toBe(120)
  })

  it('measures from startHour, not from midnight', () => {
    const position = getEventPosition({
      startsAt: iso(10),
      endsAt: iso(11),
      day,
      startHour: 8,
      hourHeight: 80,
    })

    expect(position?.top).toBe(160)
  })

  /*
   * The regression behind the 24-hour grid: a late event used to be
   * positioned past the bottom of an 8am-7pm column and clipped away.
   */
  it('keeps a late-evening event on the grid', () => {
    const position = getEventPosition({
      startsAt: iso(21),
      endsAt: iso(22),
      day,
      startHour: 0,
      hourHeight: 80,
    })

    expect(position).toEqual({ top: 1680, height: 80 })
  })

  it('clips an event that runs past midnight to the end of the day', () => {
    const position = getEventPosition({
      startsAt: iso(23),
      endsAt: iso(1, 0, 22),
      day,
      startHour: 0,
      hourHeight: 80,
    })

    expect(position).toEqual({ top: 1840, height: 80 })
  })

  it('returns null for an event on another day', () => {
    const position = getEventPosition({
      startsAt: iso(10, 0, 25),
      endsAt: iso(11, 0, 25),
      day,
      startHour: 0,
      hourHeight: 80,
    })

    expect(position).toBeNull()
  })
})
