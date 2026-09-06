import type { Booking } from '../types/api'

const API_URL = 'http://localhost:3000/api/v1'

interface CreateBookingData {
  roomId: string
  title: string
  comment?: string | null
  startsAt: string
  endsAt: string
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

  if (!response.ok) {
    throw new Error(
      data?.error?.message ?? 'Не удалось создать бронирование',
    )
  }

  return data
}