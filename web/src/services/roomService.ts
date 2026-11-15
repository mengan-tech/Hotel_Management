import { api } from './api'
import type { AvailabilityQuery, Booking, BookingStatus, Room, RoomType } from '@/types'

// Bookings with these statuses hold a room. CANCELLED, CHECKED_OUT and NO_SHOW free it.
const BLOCKING: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CHECKED_IN']

// ---------- MOCK ONLY ----------
// json-server cannot check availability, so for M1 it runs in the browser.
// In M3 NestJS does this on the server (GET /availability, POST /bookings)
// and these helpers are deleted. The pages that call roomService do not change.
async function loadRoomsAndBookings(): Promise<{ rooms: Room[]; bookings: Booking[] }> {
  const [rooms, bookings] = await Promise.all([
    api.get<Room[]>('/rooms').then((r) => r.data),
    api.get<Booking[]>('/bookings').then((r) => r.data),
  ])
  return { rooms, bookings }
}

function roomIsFree(room: Room, bookings: Booking[], q: AvailabilityQuery): boolean {
  // Two stays share a night when: existing.checkIn < new.checkOut AND existing.checkOut > new.checkIn
  const overlaps = (b: Booking) => b.checkIn < q.checkOut && b.checkOut > q.checkIn
  return (
    room.status !== 'MAINTENANCE' &&
    !bookings.some((b) => b.roomId === room.id && BLOCKING.includes(b.status) && overlaps(b))
  )
}
// --------------------------------

export const roomService = {
  async getRoomTypes(): Promise<RoomType[]> {
    const { data } = await api.get<RoomType[]>('/roomTypes')
    return data
  },

  async getRoomType(id: number): Promise<RoomType> {
    const { data } = await api.get<RoomType>(`/roomTypes/${id}`)
    return data
  },

  /** Room types with at least one room free for every night (and big enough). */
  async searchAvailable(q: AvailabilityQuery): Promise<RoomType[]> {
    const [types, { rooms, bookings }] = await Promise.all([
      roomService.getRoomTypes(),
      loadRoomsAndBookings(),
    ])
    return types.filter(
      (type) =>
        type.capacity >= q.guests &&
        rooms.some((room) => room.roomTypeId === type.id && roomIsFree(room, bookings, q)),
    )
  },

  /** One free room of this type for these dates, or null. Used when booking. */
  async findFreeRoom(roomTypeId: number, q: AvailabilityQuery): Promise<Room | null> {
    const { rooms, bookings } = await loadRoomsAndBookings()
    return rooms.find((r) => r.roomTypeId === roomTypeId && roomIsFree(r, bookings, q)) ?? null
  },
}
