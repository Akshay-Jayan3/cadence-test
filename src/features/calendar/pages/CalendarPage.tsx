import { useState } from 'react'
import {
  addHours,
  addWeeks,
  subWeeks,
} from 'date-fns'

import { Modal } from '../../../components/ui/Modal'

import { CalendarSidebar } from '../components/CalendarSidebar'
import { CalendarToolbar } from '../components/CalendarToolbar'
import { WeekCalendar } from '../components/WeekCalendar'

import { getWeekRange } from '../utils/dateUtils'

import { CreateEventModal } from '../../events/components/CreateEventModal'
import { EditEventModal } from '../../events/components/EditEventModal'
import { EventDetails } from '../../events/components/EventDetails'

import { useCreateEvent } from '../../events/hooks/useCreateEvent'
import { useDeleteEvent } from '../../events/hooks/useDeleteEvent'
import { useEvents } from '../../events/hooks/useEvents'
import { useUpdateEvent } from '../../events/hooks/useUpdateEvent'

import { getApiErrorMessage } from '../../../lib/api/errors'

import type {
  CreateEventInput,
  Event,
  UpdateEventInput,
} from '../../../lib/api/types'

type CalendarView = 'day' | 'week' | 'month'

export function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date(),
  )

  const [view, setView] =
    useState<CalendarView>('week')

  const [createModalOpen, setCreateModalOpen] =
    useState(false)

  const [createStartAt, setCreateStartAt] =
    useState('')

  const [createEndAt, setCreateEndAt] =
    useState('')

  const [selectedEvent, setSelectedEvent] =
    useState<Event | null>(null)

  const [editModalOpen, setEditModalOpen] =
    useState(false)

  const [lastFailedUpdate, setLastFailedUpdate] =
    useState<{
      id: string
      data: UpdateEventInput
    } | null>(null)

  const { from, to } = getWeekRange(selectedDate)

  const eventsQuery = useEvents({
    from,
    to,
  })

  const createEventMutation =
    useCreateEvent()

  const updateEventMutation =
    useUpdateEvent()

  const deleteEventMutation =
    useDeleteEvent()

  const events = eventsQuery.data ?? []

  function openCreateEvent(date?: Date) {
    const start = date ?? new Date()
    const end = addHours(start, 1)

    setCreateStartAt(
      toDateTimeLocalValue(start),
    )

    setCreateEndAt(
      toDateTimeLocalValue(end),
    )

    setCreateModalOpen(true)
  }

  function handleTimeSlotClick(date: Date) {
    openCreateEvent(date)
  }

  function handleCreateEvent(
    values: CreateEventInput,
  ) {
    createEventMutation.mutate(
      {
        ...values,
        startsAt: new Date(
          values.startsAt,
        ).toISOString(),
        endsAt: new Date(
          values.endsAt,
        ).toISOString(),
      },
      {
        onSuccess: () => {
          setCreateModalOpen(false)
          setCreateStartAt('')
          setCreateEndAt('')
        },
      },
    )
  }

  function handleCreateModalClose() {
    if (createEventMutation.isPending) {
      return
    }

    setCreateModalOpen(false)
    setCreateStartAt('')
    setCreateEndAt('')
    createEventMutation.reset()
  }

  function handleEventClick(event: Event) {
    setSelectedEvent(event)
  }

  function handleEventDetailsClose() {
    setSelectedEvent(null)
  }

  function handleEditEvent() {
    if (!selectedEvent) {
      return
    }

    setEditModalOpen(true)
    setLastFailedUpdate(null)
  }

  function handleEditModalClose() {
    if (
      updateEventMutation.isPending ||
      deleteEventMutation.isPending
    ) {
      return
    }

    setEditModalOpen(false)
    setLastFailedUpdate(null)

    updateEventMutation.reset()
    deleteEventMutation.reset()
  }

  function handleUpdateEvent(
    values: CreateEventInput,
  ) {
    if (!selectedEvent) {
      return
    }

    const data: UpdateEventInput = {
      ...values,
      startsAt: new Date(
        values.startsAt,
      ).toISOString(),
      endsAt: new Date(
        values.endsAt,
      ).toISOString(),
    }

    const variables = {
      id: selectedEvent.id,
      data,
    }

    setLastFailedUpdate(null)

    updateEventMutation.mutate(
      variables,
      {
        onSuccess: () => {
          setEditModalOpen(false)
          setSelectedEvent(null)
          setLastFailedUpdate(null)
        },

        onError: () => {
          setLastFailedUpdate(variables)
        },
      },
    )
  }

  /*
   * Drag-to-reschedule and resize. The mutation applies the change
   * optimistically and rolls back on failure, so this only has to
   * surface the failure for the retry affordance below.
   */
  function handleEventDrop(
    event: Event,
    startsAt: string,
    endsAt: string,
  ) {
    const variables = {
      id: event.id,
      data: { startsAt, endsAt },
    }

    setLastFailedUpdate(null)

    updateEventMutation.mutate(variables, {
      onError: () => {
        setLastFailedUpdate(variables)
      },
    })
  }

  function handleRetryUpdate() {
    if (!lastFailedUpdate) {
      return
    }

    const variables = lastFailedUpdate

    setLastFailedUpdate(null)

    updateEventMutation.mutate(
      variables,
      {
        onSuccess: () => {
          setEditModalOpen(false)
          setSelectedEvent(null)
        },

        onError: () => {
          setLastFailedUpdate(variables)
        },
      },
    )
  }

  function handleDeleteEvent() {
    if (!selectedEvent) {
      return
    }

    deleteEventMutation.mutate(
      selectedEvent.id,
      {
        onSuccess: () => {
          setEditModalOpen(false)
          setSelectedEvent(null)
        },
      },
    )
  }

  function handlePreviousWeek() {
    setSelectedDate(
      subWeeks(selectedDate, 1),
    )
  }

  function handleNextWeek() {
    setSelectedDate(
      addWeeks(selectedDate, 1),
    )
  }

  function handleToday() {
    setSelectedDate(new Date())
  }

  return (
    <main className="flex h-screen overflow-hidden bg-canvas">
      <CalendarSidebar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onCreateEvent={() =>
          openCreateEvent()
        }
      />

      <section className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-white">
        <CalendarToolbar
          date={selectedDate}
          view={view}
          onViewChange={setView}
          onPrevious={handlePreviousWeek}
          onNext={handleNextWeek}
          onToday={handleToday}
          onCreateEvent={() =>
            openCreateEvent()
          }
        />

        {eventsQuery.isLoading && (
          <div className="p-6 text-body text-ink/50">
            Loading events...
          </div>
        )}

        {eventsQuery.isError && (
          <div className="flex flex-col items-start gap-2 p-6">
            <p className="text-body text-danger">
              Couldn't load this week's events.
            </p>

            <button
              type="button"
              onClick={() => eventsQuery.refetch()}
              className="text-label font-medium text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!eventsQuery.isLoading &&
          !eventsQuery.isError && (
            <WeekCalendar
              date={selectedDate}
              events={events}
              onTimeSlotClick={
                handleTimeSlotClick
              }
              onEventClick={handleEventClick}
              onEventDrop={handleEventDrop}
            />
          )}

      </section>

      <CreateEventModal
        open={createModalOpen}
        initialStartAt={createStartAt}
        initialEndAt={createEndAt}
        onClose={handleCreateModalClose}
        onSubmit={handleCreateEvent}
        isSubmitting={
          createEventMutation.isPending
        }
        error={
          createEventMutation.isError
            ? getApiErrorMessage(
                createEventMutation.error,
                'Could not create the event. Please try again.',
              )
            : undefined
        }
      />

      <Modal
        open={
          selectedEvent !== null &&
          !editModalOpen
        }
        showCloseButton={false}
        onClose={handleEventDetailsClose}
        className="max-w-md"
      >
        {selectedEvent && (
          <EventDetails
            event={selectedEvent}
            onClose={
              handleEventDetailsClose
            }
            onDelete={handleDeleteEvent}
            onEdit={handleEditEvent}
          />
        )}
      </Modal>

      <EditEventModal
        open={editModalOpen}
        event={selectedEvent}
        onClose={handleEditModalClose}
        onSubmit={handleUpdateEvent}
        onDelete={handleDeleteEvent}
        isSubmitting={
          updateEventMutation.isPending
        }
        isDeleting={
          deleteEventMutation.isPending
        }
        error={
          updateEventMutation.isError ||
          deleteEventMutation.isError
            ? getApiErrorMessage(
                updateEventMutation.error ??
                  deleteEventMutation.error,
                'Could not save your changes. Please try again.',
              )
            : undefined
        }
      />

      {lastFailedUpdate && (
        <div className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-4 rounded-lg border border-danger bg-white px-4 py-3 shadow-lg">
          <p className="text-body text-ink">
            Failed to update event.
          </p>

          <button
            type="button"
            onClick={handleRetryUpdate}
            disabled={
              updateEventMutation.isPending
            }
            className="font-medium text-primary hover:underline disabled:opacity-50"
          >
            {updateEventMutation.isPending
              ? 'Retrying...'
              : 'Retry'}
          </button>
        </div>
      )}
    </main>
  )
}

function toDateTimeLocalValue(
  date: Date,
): string {
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