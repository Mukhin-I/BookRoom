import type { Booking } from '../types/api'

const API_URL = 'http://localhost:3000/api/v1'

interface CreateBookingData {
  roomId: string
  title: string
  comment?: string | null
  startsAt: string
  endsAt: string
}

interface BookingsResponse {
  items: Booking[]
}

type BookingScope = 'upcoming' | 'past' | 'all'

interface GetBookingsParams {
  scope?: BookingScope
  officeId?: string
}

export class BookingConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BookingConflictError'
  }
}

export async function createBooking(
  booking: CreateBookingData,
): Promise<Booking> {
  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(booking),
  })

  const data = await response.json()

  if (response.status === 409) {
    throw new BookingConflictError(
      data?.error?.message ??
        'Эта переговорная уже забронирована на выбранное время',
    )
  }

  if (!response.ok) {
    throw new Error(
      data?.error?.message ??
        'Не удалось создать бронирование',
    )
  }

  return data
}

export async function getBookings(
  params: GetBookingsParams = {},
): Promise<Booking[]> {
  const searchParams = new URLSearchParams()

  if (params.scope) {
    searchParams.set('scope', params.scope)
  }

  if (params.officeId) {
    searchParams.set('officeId', params.officeId)
  }

  const response = await fetch(
    `${API_URL}/bookings?${searchParams.toString()}`,
  )

  if (!response.ok) {
    throw new Error('Не удалось загрузить бронирования')
  }

  const data: BookingsResponse = await response.json()

  return data.items
}

export async function cancelBooking(
  bookingId: string,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/bookings/${bookingId}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.ok) {
    throw new Error('Не удалось отменить бронирование')
  }
}