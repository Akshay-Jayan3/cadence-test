import { useState } from 'react'
import type { EventColor } from '../constants/eventColor'
import { EVENT_COLORS } from '../constants/eventColor'
import { Button } from '../../../components/ui/Button'
import { ColorSwatch } from '../../../components/ui/ColorSwatch'
import type { CreateEventInput } from '../../../lib/api/types';
import {
  Calendar,
  MapPin,
  AlignLeft,
  Trash2,
} from 'lucide-react'

interface EventFormProps {
  initialValues?: Partial<CreateEventInput>
  submitLabel: string
  onSubmit: (values: CreateEventInput) => void
  onCancel: () => void
  onDelete?: () => void
  isSubmitting?: boolean
  isDeleting?: boolean
}

export function EventForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting = false,
  isDeleting = false,
}: EventFormProps) {
  const [title, setTitle] = useState(
    initialValues?.title ?? '',
  )

  const [startsAt, setStartAt] = useState(
    initialValues?.startsAt ?? '',
  )

  const [endsAt, setEndAt] = useState(
    initialValues?.endsAt ?? '',
  )

  const [location, setLocation] = useState(
    initialValues?.location ?? '',
  )

  const [description, setDescription] = useState(
    initialValues?.description ?? '',
  )

  const [color, setColor] = useState<EventColor>(
    (initialValues?.color as EventColor) ??
    EVENT_COLORS.primary,
  )

  const isEditMode = Boolean(onDelete)
  const isBusy = isSubmitting || isDeleting

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    onSubmit({
      title,
      startsAt,
      endsAt,
      location,
      description,
      color,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="px-7 pb-7 pt-6"
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <span
          className="size-3 rounded-[3px]"
          style={{
            backgroundColor: color,
          }}
          aria-hidden="true"
        />

        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">
          {isEditMode ? 'Edit event' : 'New event'}
        </span>
      </div>

      <div className="flex flex-col">
        {/* Title */}
        <input
          id="event-title"
          type="text"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          placeholder="Add title"
          required
          disabled={isBusy}
          className="
            w-full
            border-0
            border-b
            border-border
            bg-transparent
            pb-3
            text-[18px]
            font-semibold
            text-ink
            outline-none
            placeholder:text-ink/35
            focus:border-primary
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        />

        {/* Date + time */}
        <div className="mt-4 flex items-center gap-2">
          <span
            className="flex w-4 shrink-0 justify-center text-ink/45"
            aria-hidden="true"
          >
            <Calendar
              size={15}
              strokeWidth={1.7}
              className="text-ink/45"
            />
          </span>

          <input
            id="event-start"
            type="datetime-local"
            value={startsAt}
            onChange={(event) =>
              setStartAt(event.target.value)
            }
            required
            disabled={isBusy}
            className="
              min-w-0
              py-2
              flex-1
              rounded-lg
              border
              border-border
              bg-white
              px-3
              text-[12px]
              font-medium
              text-ink
              outline-none
              focus:border-primary
              focus:ring-1
              focus:ring-primary/10
              disabled:cursor-not-allowed
              disabled:bg-canvas
              disabled:opacity-60
            "
          />

          <input
            id="event-end"
            type="time"
            value={getTimeValue(endsAt)}
            onChange={(event) => {
              if (!startsAt) {
                setEndAt(event.target.value)
                return
              }

              const date = new Date(startsAt)

              const [hours, minutes] =
                event.target.value.split(':')

              date.setHours(
                Number(hours),
                Number(minutes),
                0,
                0,
              )

              setEndAt(
                toDateTimeLocalValue(date),
              )
            }}
            required
            disabled={isBusy}
            className="
              py-2
              w-[140px]
              shrink-0
              rounded-lg
              border
              border-border
              bg-white
              px-3
              text-[12px]
              font-medium
              text-ink
              outline-none
              focus:border-primary
              focus:ring-1
              focus:ring-primary/10
              disabled:cursor-not-allowed
              disabled:bg-canvas
              disabled:opacity-60
            "
          />
        </div>

        {/* Location */}
        <div className="mt-4 flex items-center gap-2">
          <span
            className="flex w-5 shrink-0 justify-center text-ink/45"
            aria-hidden="true"
          >
            <MapPin
              size={15}
              strokeWidth={1.7}
              className="text-ink/45"
            />
          </span>

          <input
            id="event-location"
            type="text"
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
            placeholder="Add location"
            disabled={isBusy}
            className="
              h-10
              w-full
              rounded-lg
              border
              border-border
              bg-white
              px-3
              text-[12px]
              text-ink
              outline-none
              placeholder:text-ink/35
              focus:border-primary
              focus:ring-1
              focus:ring-primary/10
              disabled:cursor-not-allowed
              disabled:bg-canvas
              disabled:opacity-60
            "
          />
        </div>

        {/* Description */}
        <div className="mt-4 flex items-start gap-2">
          <span
            className="flex w-5 shrink-0 justify-center pt-2 text-ink/45"
            aria-hidden="true"
          >
            <AlignLeft
              size={15}
              strokeWidth={1.7}
              className="text-ink/45"
            />
          </span>

          <textarea
            id="event-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Add description"
            disabled={isBusy}
            className="
              min-h-[66px]
              w-full
              resize-none
              rounded-lg
              border
              border-border
              bg-white
              px-3
              py-3
              text-[12px]
              text-ink
              outline-none
              placeholder:text-ink/35
              focus:border-primary
              focus:ring-1
              focus:ring-primary/10
              disabled:cursor-not-allowed
              disabled:bg-canvas
              disabled:opacity-60
            "
          />
        </div>

        {/* Color */}
        <div className="mt-4 flex items-center gap-2 pl-7">
          {Object.entries(EVENT_COLORS).map(
            ([name, value]) => (
              <ColorSwatch
                key={name}
                color={value}
                label={name}
                selected={color === value}
                disabled={isBusy}
                onClick={() => setColor(value)}
              />
            ),
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between">
          {/* Delete - Edit only */}
          {onDelete ? (
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={onDelete}
              disabled={isBusy}
              className="gap-1.5 px-3"
            >
              <Trash2
                size={13}
                strokeWidth={1.8}
              />

              {isDeleting
                ? 'Deleting...'
                : 'Delete'}
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onCancel}
              disabled={isBusy}
              className="px-4"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="md"
              disabled={isBusy}
              className="px-5"
            >
              {isSubmitting
                ? 'Saving...'
                : submitLabel}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

/* --------------------------------
   Helpers
--------------------------------- */

function getTimeValue(value: string): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const hours = String(
    date.getHours(),
  ).padStart(2, '0')

  const minutes = String(
    date.getMinutes(),
  ).padStart(2, '0')

  return `${hours}:${minutes}`
}

function toDateTimeLocalValue(date: Date): string {
  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  const hours = String(
    date.getHours(),
  ).padStart(2, '0')

  const minutes = String(
    date.getMinutes(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}
