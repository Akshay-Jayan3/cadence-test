import { Modal } from '../../../components/ui/Modal'
import type { Event, CreateEventInput } from '../../../lib/api/types'
import { EventForm } from './EventForm'

interface EditEventModalProps {
  open: boolean
  event: Event | null
  onClose: () => void
  onSubmit: (values: CreateEventInput) => void
  onDelete: () => void
  isSubmitting?: boolean
  isDeleting?: boolean
}

export function EditEventModal({
  open,
  event,
  onClose,
  onSubmit,
  onDelete,
  isSubmitting = false,
  isDeleting = false,
}: EditEventModalProps) {
  if (!event) {
    return null
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit event"
      className="max-w-xl"
    >
      <EventForm
        initialValues={{
          title: event.title,
          startAt: toDateTimeLocalValue(event.startAt),
          endAt: toDateTimeLocalValue(event.endAt),
          location: event.location,
          description: event.description,
          color: event.color,
        }}
        submitLabel="Save changes"
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting || isDeleting}
      />

      <div className="border-t border-border px-6 py-4">
        <button
          type="button"
          onClick={onDelete}
          disabled={isSubmitting || isDeleting}
          className="text-body font-medium text-danger hover:underline disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete event'}
        </button>
      </div>
    </Modal>
  )
}

function toDateTimeLocalValue(value: string): string {
  const date = new Date(value)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}