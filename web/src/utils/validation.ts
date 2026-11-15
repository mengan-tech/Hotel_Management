import type { AvailabilityQuery, LoginInput, RegisterInput } from '@/types'
import { addDays, nightsBetween, plural, todayISO } from './format'

// Limits from the SRS (section 2.5)
export const LIMITS = {
  maxNights: 21,
  maxDaysAhead: 300,
  maxGuests: 10,
  maxRequestLength: 300,
  minPassword: 8,
} as const

export type Errors<Field extends string> = Partial<Record<Field, string>>
export type StayErrors = Errors<'checkIn' | 'checkOut' | 'guests'>

export const hasErrors = (errors: object) => Object.keys(errors).length > 0

// this check the email is in the correct format or not
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

// Validate the stay query (check-in, check-out, guests)
export function validateStay(
  q: AvailabilityQuery,
  options: { today?: string; capacity?: number } = {},
): StayErrors {
  const today = options.today ?? todayISO()
  const e: StayErrors = {}

  if (!q.checkIn){
    e.checkIn = 'Choose a check-in date.'
  } 
  else if (q.checkIn < today){
    e.checkIn = 'Check-in cannot be in the past.'
  }
  else if (q.checkIn > addDays(today, LIMITS.maxDaysAhead)){
    e.checkIn = `You can book at most ${LIMITS.maxDaysAhead} days ahead.`
  }
    

  if (!q.checkOut){
    e.checkOut = 'Choose a check-out date.'
  } 
  else if (q.checkIn && q.checkOut <= q.checkIn) {
    e.checkOut = 'Check-out must be after check-in.'
  }
  else if (q.checkIn && nightsBetween(q.checkIn, q.checkOut) > LIMITS.maxNights) {
    e.checkOut = `A stay can be at most ${LIMITS.maxNights} nights.`
  }

  if (!Number.isInteger(q.guests) || q.guests < 1) {
    e.guests = 'Enter at least 1 guest.'
  } else if (q.guests > LIMITS.maxGuests) {
    e.guests = `At most ${LIMITS.maxGuests} guests per booking.`
  } else if (options.capacity !== undefined && q.guests > options.capacity) {
    e.guests = `Maximum ${plural(options.capacity, 'guest')} for this room type.`
  }

  return e
}

export function validateLogin(input: LoginInput): Errors<keyof LoginInput> {
  const e: Errors<keyof LoginInput> = {}
  if (!isEmail(input.email)) {
    e.email = 'Enter a valid email address.'
  }
  if (!input.password) {
    e.password = 'Enter your password.'
  }
  return e
}

export function validateRegister(input: RegisterInput): Errors<keyof RegisterInput> {
  const e: Errors<keyof RegisterInput> = {}
  if (input.name.trim().length < 2) {
    e.name = 'Enter your full name.'
  }
  if (!isEmail(input.email)) {
    e.email = 'Enter a valid email address.'
  }
  if (!/^0\d{8,9}$/.test(input.phone.replace(/[\s-]/g, ''))) {
    e.phone = 'Enter a phone number like 012 345 678.'
  }
  if (input.password.length < LIMITS.minPassword) {
    e.password = `Use at least ${LIMITS.minPassword} characters.`
  }
  return e
}
