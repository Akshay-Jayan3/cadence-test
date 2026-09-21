import { describe, expect, it } from 'vitest'

import { applyDrag } from './useEventDrag'
import type { Event } from '../../../lib/api/types'

const event: Event = {
  id: 'evt_1',
  title: 'Design Review',
  description: '',
  location: '',
  startsAt: '2026-09-21T09:00:00.000Z',
  endsAt: '2026-09-21T10:00:00.000Z',
  color: '#3366FF',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
}

describe('applyDrag', () => {
  describe('move', () => {
    it('shifts start and end by the same minutes', () => {
      const result = applyDrag(event, 'move', 0, 90)

      expect(result.startsAt).toBe(
        '2026-09-21T10:30:00.000Z',
      )
      expect(result.endsAt).toBe(
        '2026-09-21T11:30:00.000Z',
      )
    })

    it('shifts across days without changing the time', () => {
      const result = applyDrag(event, 'move', 2, 0)

      expect(result.startsAt).toBe(
        '2026-09-23T09:00:00.000Z',
      )
      expect(result.endsAt).toBe(
        '2026-09-23T10:00:00.000Z',
      )
    })

    it('preserves duration exactly', () => {
      const result = applyDrag(event, 'move', -1, -45)

      const duration =
        new Date(result.endsAt).getTime() -
        new Date(result.startsAt).getTime()

      expect(duration).toBe(60 * 60 * 1000)
    })
  })

  describe('resize', () => {
    it('moves the end and leaves the start alone', () => {
      const result = applyDrag(event, 'resize', 0, 30)

      expect(result.startsAt).toBe(event.startsAt)
      expect(result.endsAt).toBe(
        '2026-09-21T10:30:00.000Z',
      )
    })

    it('never shrinks an event below 15 minutes', () => {
      const result = applyDrag(event, 'resize', 0, -600)

      expect(result.startsAt).toBe(event.startsAt)
      expect(result.endsAt).toBe(
        '2026-09-21T09:15:00.000Z',
      )
    })

    it('ignores a day delta', () => {
      const result = applyDrag(event, 'resize', 3, 0)

      expect(result.startsAt).toBe(event.startsAt)
      expect(result.endsAt).toBe(event.endsAt)
    })
  })
})
