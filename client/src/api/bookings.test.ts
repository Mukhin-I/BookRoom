import { describe, expect, it, vi, afterEach } from 'vitest'

import {
  createBooking,
  BookingConflictError,
} from './bookings'

describe('createBooking', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('throws BookingConflictError when server returns 409', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({
          error: {
            message: 'Конфликт бронирования',
          },
        }),
      }),
    )

    const booking = {
      roomId: 'room-1',
      title: 'Встреча',
      comment: null,
      startsAt: '2026-09-10T12:00:00.000Z',
      endsAt: '2026-09-10T13:00:00.000Z',
    }

    await expect(
      createBooking(booking),
    ).rejects.toBeInstanceOf(
      BookingConflictError,
    )
  })
})

describe('createBooking', () => {
  it('sends POST request with booking data', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'booking-1',
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    await createBooking({
      roomId: 'room-1',
      title: 'Meeting',
      comment: null,
      startsAt: '2026-09-07T12:00:00Z',
      endsAt: '2026-09-07T13:00:00Z',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
      }),
    )
  })
})