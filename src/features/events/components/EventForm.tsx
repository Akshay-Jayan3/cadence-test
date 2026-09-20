import { useState } from 'react'
import type { EventColor } from '../constants/eventColor'
import { EVENT_COLORS } from '../constants/eventColor'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { ColorSwatch } from '../../../components/ui/ColorSwatch'
import type { CreateEventInput } from '../../../lib/api/types'

interface EventFormProps {
  initialValues?: Partial<CreateEventInput>
  submitLabel: string
  onSubmit: (values: CreateEventInput) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function EventForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: EventFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [startAt, setStartAt] = useState(
    initialValues?.startAt ?? '',
  )
  const [endAt, setEndAt] = useState(
    initialValues?.endAt ?? '',
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    onSubmit({
      title,
      startAt,
      endAt,
      location,
      description,
      color,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex flex-col gap-4">
        <Input
          id="event-title"
          label="Title"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="event-start"
            label="Start"
            type="datetime-local"
            value={startAt}
            onChange={(event) =>
              setStartAt(event.target.value)
            }
            required
          />

          <Input
            id="event-end"
            label="End"
            type="datetime-local"
            value={endAt}
            onChange={(event) =>
              setEndAt(event.target.value)
            }
            required
          />
        </div>

        <Input
          id="event-location"
          label="Location"
          value={location}
          onChange={(event) =>
            setLocation(event.target.value)
          }
        />

        <div className="flex flex-col gap-2">
          <label
            htmlFor="event-description"
            className="text-body font-medium text-ink"
          >
            Description
          </label>

          <textarea
            id="event-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            className="
              min-h-24 w-full resize-y
              rounded-lg border border-border
              bg-white px-4 py-3
              text-body text-ink
              outline-none
              focus:border-primary
            "
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-body font-medium text-ink">
            Color
          </span>

          <div className="flex gap-2">
            {Object.entries(EVENT_COLORS).map(
              ([name, value]) => (
                <ColorSwatch
                  key={name}
                  color={value}
                  label={name}
                  selected={color === value}
                  onClick={() =>
                    setColor(value)
                  }
                />
              ),
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Saving...'
              : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}