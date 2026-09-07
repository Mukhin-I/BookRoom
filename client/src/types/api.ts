export interface User {
  id: string
  login: string
  displayName: string
  email: string
  avatarUrl: string | null
  initials: string
}

export interface Office {
  id: string
  name: string
  address: string
  timezone: string
}

export interface RoomFeature {
  code: string
  name: string
}

export interface Room {
  id: string
  officeId: string
  name: string
  floor: number
  capacity: number
  features: RoomFeature[]
  office: Office
  available?: boolean
}

export interface Booking {
  id: string
  roomId: string
  userId: string
  title: string
  comment: string | null
  startsAt: string
  endsAt: string
  createdAt: string

  room: {
    id: string
    officeId: string
    name: string
    floor: number
    capacity: number
    features: RoomFeature[]
  }

  office: Office

  owner: User
}