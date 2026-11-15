export type Role = 'GUEST' | 'RECEPTIONIST' | 'MANAGER'

export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE'

export type BookingStatus =
  'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW'

export interface User {
  id: number
  name: string
  email: string
  phone: string
  role: Role
}

export interface RoomType {
  id: number
  name: string
  description: string
  bed: string
  sizeM2: number
  capacity: number
  priceUsd: number
  priceKhr: number
  features: string[]
  photos: string[]
}

export interface Room {
  id: number
  number: string
  floor: number
  roomTypeId: number
  status: RoomStatus
}

export interface Booking {
  id: number
  userId: number
  roomTypeId: number
  roomId: number | null
  checkIn: string // use this format "YYYY-MM-DD"
  checkOut: string // use this format "YYYY-MM-DD"
  guests: number
  status: BookingStatus
  specialRequest?: string
  totalUsd: number
  // Only present when the request uses json-server's _expand=roomType / _expand=room
  roomType?: RoomType
  room?: Room
}

export interface AvailabilityQuery {
  checkIn: string
  checkOut: string
  guests: number
}

export interface CreateBookingInput {
  userId: number
  roomTypeId: number
  checkIn: string
  checkOut: string
  guests: number
  specialRequest?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  phone: string
  password: string
}
