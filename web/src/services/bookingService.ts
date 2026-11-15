import { api } from './api'
import { roomService } from './roomService'
import type { Booking, CreateBookingInput } from '@/types'
import { nightsBetween } from '@/utils/format'

/** Thrown when no room of the type is free (the real API will answer 409 Conflict). */
export class NoRoomAvailableError extends Error {
  constructor() {
    super('No room of this type is free for these dates')
    this.name = 'NoRoomAvailableError'
  }
}

export const bookingService = {
  async getMyBookings(userId: number): Promise<Booking[]> {
    // _expand joins the RoomType and Room objects into each booking (json-server feature)
    const params = new URLSearchParams({ userId: String(userId), _sort: 'checkIn', _order: 'desc' })
    params.append('_expand', 'roomType')
    params.append('_expand', 'room')
    const { data } = await api.get<Booking[]>('/bookings', { params })
    return data
  },

  // MOCK ONLY: here the browser picks the room and calculates the total.
  // In M3 the browser sends only `input`; NestJS checks availability inside a
  // transaction, assigns the room and calculates the total from database prices.
  async createBooking(input: CreateBookingInput, pricePerNight: number): Promise<Booking> {
    const room = await roomService.findFreeRoom(input.roomTypeId, input)
    if (!room) throw new NoRoomAvailableError()

    const { data } = await api.post<Booking>('/bookings', {
      ...input,
      roomId: room.id,
      status: 'PENDING',
      totalUsd: nightsBetween(input.checkIn, input.checkOut) * pricePerNight,
    })
    return data
  },

  async cancelBooking(id: number): Promise<Booking> {
    const { data } = await api.patch<Booking>(`/bookings/${id}`, { status: 'CANCELLED' })
    return data
  },
}
