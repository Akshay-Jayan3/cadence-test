import { useCallback, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import {
  addDays,
  addMinutes,
  differenceInMinutes,
  parseISO,
} from 'date-fns'

import type { Event } from '../../../lib/api/types'

/*
 * A pointer has to travel this far before we treat the gesture as a
 * drag rather than a click, so tapping an event still opens its
 * details instead of nudging it by a pixel.
 */
const DRAG_THRESHOLD_PX = 4

/* Reschedules snap to the quarter hour, like the rest of the grid. */
const SNAP_MINUTES = 15

/* An event can never be resized shorter than this. */
const MIN_DURATION_MINUTES = 15

export type DragMode = 'move' | 'resize'

export interface DragPreview {
  eventId: string
  mode: DragMode
  dayDelta: number
  minuteDelta: number
  /*
   * Measured when the pointer moves, not read during render — the
   * grid element is a ref, and refs are off limits at render time.
   */
  columnWidth: number
}

interface ActiveDrag extends DragPreview {
  event: Event
  dayIndex: number
  pointerId: number
  originX: number
  originY: number
  hasMoved: boolean
}

interface UseEventDragOptions {
  hourHeight: number
  dayCount: number
  getColumnWidth: () => number
  onCommit: (
    event: Event,
    startsAt: string,
    endsAt: string,
  ) => void
}

/*
 * Applies an in-progress drag to an event's times. Both the live
 * preview and the committed payload go through this, so what the user
 * releases is exactly what gets sent.
 */
export function applyDrag(
  event: Event,
  mode: DragMode,
  dayDelta: number,
  minuteDelta: number,
): { startsAt: string; endsAt: string } {
  const start = parseISO(event.startsAt)
  const end = parseISO(event.endsAt)

  if (mode === 'move') {
    return {
      startsAt: addMinutes(
        addDays(start, dayDelta),
        minuteDelta,
      ).toISOString(),

      endsAt: addMinutes(
        addDays(end, dayDelta),
        minuteDelta,
      ).toISOString(),
    }
  }

  const duration = Math.max(
    differenceInMinutes(end, start) + minuteDelta,
    MIN_DURATION_MINUTES,
  )

  return {
    startsAt: start.toISOString(),
    endsAt: addMinutes(start, duration).toISOString(),
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function useEventDrag({
  hourHeight,
  dayCount,
  getColumnWidth,
  onCommit,
}: UseEventDragOptions) {
  const dragRef = useRef<ActiveDrag | null>(null)
  const suppressClickRef = useRef(false)

  const [preview, setPreview] =
    useState<DragPreview | null>(null)

  const start = useCallback(
    (
      pointerEvent: ReactPointerEvent<HTMLElement>,
      event: Event,
      dayIndex: number,
      mode: DragMode,
    ) => {
      /* Ignore right-clicks and anything that isn't a primary press. */
      if (pointerEvent.button !== 0) {
        return
      }

      /*
       * Capture keeps the gesture alive when the pointer leaves the
       * card, which it always does. It throws if the pointer is
       * already gone, and that is not worth failing the drag over.
       */
      try {
        pointerEvent.currentTarget.setPointerCapture(
          pointerEvent.pointerId,
        )
      } catch {
        /* Non-fatal — the drag still tracks via bubbled events. */
      }

      dragRef.current = {
        event,
        mode,
        dayIndex,
        eventId: event.id,
        pointerId: pointerEvent.pointerId,
        originX: pointerEvent.clientX,
        originY: pointerEvent.clientY,
        dayDelta: 0,
        minuteDelta: 0,
        columnWidth: 0,
        hasMoved: false,
      }
    },
    [],
  )

  const move = useCallback(
    (pointerEvent: ReactPointerEvent<HTMLElement>) => {
      const active = dragRef.current

      if (
        !active ||
        active.pointerId !== pointerEvent.pointerId
      ) {
        return
      }

      const dx = pointerEvent.clientX - active.originX
      const dy = pointerEvent.clientY - active.originY

      if (
        !active.hasMoved &&
        Math.abs(dx) <= DRAG_THRESHOLD_PX &&
        Math.abs(dy) <= DRAG_THRESHOLD_PX
      ) {
        return
      }

      active.hasMoved = true

      const columnWidth = getColumnWidth()

      /*
       * Only a move changes the day. A resize is vertical by
       * definition, and clamping keeps the event inside the week
       * that's currently on screen.
       */
      active.dayDelta =
        active.mode === 'move' && columnWidth > 0
          ? clamp(
              Math.round(dx / columnWidth),
              -active.dayIndex,
              dayCount - 1 - active.dayIndex,
            )
          : 0

      active.minuteDelta =
        Math.round(
          (dy / hourHeight) * 60 / SNAP_MINUTES,
        ) * SNAP_MINUTES

      setPreview({
        eventId: active.eventId,
        mode: active.mode,
        dayDelta: active.dayDelta,
        minuteDelta: active.minuteDelta,
        columnWidth,
      })
    },
    [dayCount, getColumnWidth, hourHeight],
  )

  const end = useCallback(
    (pointerEvent: ReactPointerEvent<HTMLElement>) => {
      const active = dragRef.current

      if (
        !active ||
        active.pointerId !== pointerEvent.pointerId
      ) {
        return
      }

      dragRef.current = null
      setPreview(null)

      /* Never moved far enough — let the click through. */
      if (!active.hasMoved) {
        return
      }

      /*
       * It was a drag, so the click that follows pointerup should not
       * also open the details popover.
       */
      suppressClickRef.current = true

      if (
        active.dayDelta === 0 &&
        active.minuteDelta === 0
      ) {
        return
      }

      const { startsAt, endsAt } = applyDrag(
        active.event,
        active.mode,
        active.dayDelta,
        active.minuteDelta,
      )

      onCommit(active.event, startsAt, endsAt)
    },
    [onCommit],
  )

  const cancel = useCallback(() => {
    dragRef.current = null
    setPreview(null)
  }, [])

  const handleClickCapture = useCallback(
    (clickEvent: {
      stopPropagation: () => void
      preventDefault: () => void
    }) => {
      if (!suppressClickRef.current) {
        return
      }

      suppressClickRef.current = false

      clickEvent.stopPropagation()
      clickEvent.preventDefault()
    },
    [],
  )

  return {
    preview,
    start,
    move,
    end,
    cancel,
    handleClickCapture,
  }
}
