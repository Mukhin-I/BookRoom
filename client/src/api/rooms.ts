import type { Booking, Room } from '../types/api'

const API_URL = 'http://localhost:3000/api/v1'

interface RoomsResponse {
  items: Room[]
}

interface BookingsResponse {
  items: Booking[]
}

interface GetRoomsParams {
  officeId: string
  minCapacity?: number
  from?: string
  to?: string
}

export async function getRooms(
  params: GetRoomsParams,
): Promise<Room[]> {
  const searchParams = new URLSearchParams()

  searchParams.set('officeId', params.officeId)

  if (params.minCapacity !== undefined) {
    searchParams.set('minCapacity', String(params.minCapacity))
  }

  if (params.from && params.to) {
    searchParams.set('from', params.from)
    searchParams.set('to', params.to)
  }

  const response = await fetch(
    `${API_URL}/rooms?${searchParams.toString()}`,
  )

  if (!response.ok) {
    throw new Error('Не удалось загрузить переговорные')
  }

  const data: RoomsResponse = await response.json()

  return data.items
}

export async function getRoom(roomId: string): Promise<Room> {
  const response = await fetch(
    `${API_URL}/rooms/${roomId}`
  )

  if (!response.ok) {
    throw new Error('Не удалось загрузить переговорную')
  }

  return response.json()
}


export async function getRoomBookings(
  roomId: string,
  from: string,
  to: string,
): Promise<Booking[]> {
  const searchParams = new URLSearchParams()

  searchParams.set('from', from)
  searchParams.set('to', to)

  const response = await fetch(
    `${API_URL}/rooms/${roomId}/bookings?${searchParams.toString()}`
  )

  if (!response.ok) {
    throw new Error('Не удалось загрузить расписание переговорной')
  }

  const data: BookingsResponse = await response.json()

  return data.items
}