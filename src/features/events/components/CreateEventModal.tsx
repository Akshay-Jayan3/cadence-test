import { Modal } from '../../../components/ui/Modal'
import type { CreateEventInput } from '../../../lib/api/types'
import { EventForm } from './EventForm'

interface CreateEventModalProps {
  open: boolean
  initialStartAt?: string
  initialEndAt?: string
  onClose: () => void
  onSubmit: (values: CreateEventInput) => void
  isSubmitting?: boolean
}

export function CreateEventModal({
  open,
  initialStartAt,
  initialEndAt,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateEventModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create event"
      className="max-w-xl"
    >
      <EventForm
        initialValues={{
          startAt: initialStartAt,
          endAt: initialEndAt,
        }}
        submitLabel="Create event"
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
      />
    </Modal>
  )
}