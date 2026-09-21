import type { ReactNode } from 'react'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useUpdateEvent } from './useUpdateEvent'
import type { Event } from '../../../lib/api/types'

const updateEvent = vi.fn()

vi.mock('../../../lib/api/events', () => ({
  updateEvent: (...args: unknown[]) =>
    updateEvent(...args),
}))

const existing: Event = {
  id: 'evt_1',
  title: 'Client Call',
  description: '',
  location: '',
  startsAt: '2026-09-21T09:00:00.000Z',
  endsAt: '2026-09-21T10:00:00.000Z',
  color: '#0EA5A5',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
}

/* The cache is keyed per visible week, exactly as useEvents keys it. */
const weekKey = [
  'events',
  '2026-09-21T00:00:00.000Z',
  '2026-09-27T00:00:00.000Z',
]

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  queryClient.setQueryData<Event[]>(weekKey, [existing])

  const wrapper = ({
    children,
  }: {
    children: ReactNode
  }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  const view = renderHook(() => useUpdateEvent(), {
    wrapper,
  })

  return { queryClient, ...view }
}

function cached(queryClient: QueryClient) {
  return queryClient.getQueryData<Event[]>(weekKey)?.[0]
}

beforeEach(() => {
  updateEvent.mockReset()
})

describe('useUpdateEvent', () => {
  it('writes the change to the cache before the request resolves', async () => {
    let resolveRequest: (value: Event) => void = () => {}

    updateEvent.mockImplementation(
      () =>
        new Promise<Event>((resolve) => {
          resolveRequest = resolve
        }),
    )

    const { result, queryClient } = setup()

    act(() => {
      result.current.mutate({
        id: 'evt_1',
        data: { startsAt: '2026-09-21T14:00:00.000Z' },
      })
    })

    /*
     * The endpoint takes 300-900ms in production. The cache must
     * already show the new time while it is still in flight.
     */
    await waitFor(() => {
      expect(cached(queryClient)?.startsAt).toBe(
        '2026-09-21T14:00:00.000Z',
      )
    })

    expect(result.current.isPending).toBe(true)

    act(() => {
      resolveRequest({
        ...existing,
        startsAt: '2026-09-21T14:00:00.000Z',
      })
    })

    await waitFor(() =>
      expect(result.current.isSuccess).toBe(true),
    )
  })

  it('restores the previous value when the request fails', async () => {
    updateEvent.mockRejectedValue(
      new Error('500 Internal Server Error'),
    )

    const { result, queryClient } = setup()

    act(() => {
      result.current.mutate({
        id: 'evt_1',
        data: { startsAt: '2026-09-21T14:00:00.000Z' },
      })
    })

    await waitFor(() =>
      expect(result.current.isError).toBe(true),
    )

    /* Rolled back to exactly what was there before. */
    expect(cached(queryClient)).toEqual(existing)
  })

  it('leaves other events in the week untouched', async () => {
    const other: Event = { ...existing, id: 'evt_2' }

    updateEvent.mockResolvedValue(existing)

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    queryClient.setQueryData<Event[]>(weekKey, [
      existing,
      other,
    ])

    const { result } = renderHook(
      () => useUpdateEvent(),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      },
    )

    act(() => {
      result.current.mutate({
        id: 'evt_1',
        data: { title: 'Renamed' },
      })
    })

    await waitFor(() => {
      const events =
        queryClient.getQueryData<Event[]>(weekKey)

      expect(events?.[0].title).toBe('Renamed')
    })

    expect(
      queryClient.getQueryData<Event[]>(weekKey)?.[1],
    ).toEqual(other)
  })
})
