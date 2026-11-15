<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseInput from '@/components/BaseInput.vue'
import { NoRoomAvailableError, bookingService } from '@/services/bookingService'
import { roomService } from '@/services/roomService'
import { useAuthStore } from '@/stores/auth'
import type { RoomType } from '@/types'
import { addDays, formatKhr, formatUsd, nightsBetween, plural, todayISO } from '@/utils/format'
import { LIMITS, hasErrors, validateStay, type StayErrors } from '@/utils/validation'

const props = defineProps<{ roomType: RoomType }>()

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const today = todayISO()


const q = route.query
const form = ref({
  checkIn: typeof q.checkIn === 'string' ? q.checkIn : '',
  checkOut: typeof q.checkOut === 'string' ? q.checkOut : '',
  guests: typeof q.guests === 'string' && Number(q.guests) > 0 ? Number(q.guests) : 1,
  specialRequest: '',
})

//Validation: always computed, but only shown after the first click on Confirm
const submitted = ref(false)
const stayErrors = computed(() => validateStay(form.value, { capacity: props.roomType.capacity }))
const stayValid = computed(() => !hasErrors(stayErrors.value))
const requestError = computed(() =>
  form.value.specialRequest.length > LIMITS.maxRequestLength
    ? `At most ${LIMITS.maxRequestLength} characters.`
    : undefined,
)
type ShownErrors = StayErrors & { specialRequest?: string }
const shown = computed<ShownErrors>(() =>
  submitted.value ? { ...stayErrors.value, specialRequest: requestError.value } : {},
)

//only when the dates are valid so the price can be computed
const nights = computed(() =>
  stayValid.value ? nightsBetween(form.value.checkIn, form.value.checkOut) : 0,
)
const totalUsd = computed(() => nights.value * props.roomType.priceUsd)
const totalKhr = computed(() => nights.value * props.roomType.priceKhr)

//Live availability check whenever dates/guests change
const availability = ref<'idle' | 'checking' | 'available' | 'unavailable' | 'error'>('idle')
let lastCheck = 0
watch(
  () => [form.value.checkIn, form.value.checkOut, form.value.guests],
  async () => {
    if (!stayValid.value) {
      availability.value = 'idle'
      return
    }
    const checkId = ++lastCheck
    availability.value = 'checking'
    try {
      const room = await roomService.findFreeRoom(props.roomType.id, form.value)
      if (checkId === lastCheck) availability.value = room ? 'available' : 'unavailable'
    } catch {
      if (checkId === lastCheck) availability.value = 'error'
    }
  },
  { immediate: true },
)

//Submit
const submitting = ref(false)
const submitError = ref<string | null>(null)

async function onSubmit() {
  submitted.value = true
  submitError.value = null
  if (!stayValid.value || requestError.value) return

  const { checkIn, checkOut, guests, specialRequest } = form.value

  //go to login, then come back again with the same dates
  if (!auth.user) {
    const back = router.resolve({
      name: 'room-detail',
      params: { id: props.roomType.id },
      query: { checkIn, checkOut, guests: String(guests) },
    }).fullPath
    router.push({ name: 'login', query: { redirect: back } })
    return
  }

  submitting.value = true
  try {
    const booking = await bookingService.createBooking(
      {
        userId: auth.user.id,
        roomTypeId: props.roomType.id,
        checkIn,
        checkOut,
        guests,
        specialRequest: specialRequest.trim() || undefined,
      },
      props.roomType.priceUsd,
    )
    router.push({ name: 'my-bookings', query: { created: String(booking.id) } })
  } catch (e) {
    if (e instanceof NoRoomAvailableError) {
      availability.value = 'unavailable'
      submitError.value = 'Sorry, the last room of this type was just booked. Try other dates.'
    } else {
      submitError.value = "Couldn't create the booking. Check your connection and try again."
    }
  } finally {
    submitting.value = false
  }
}

const buttonLabel = computed(() => {
  if (submitting.value) return 'Booking…'
  return auth.isLoggedIn ? 'Confirm booking' : 'Log in to book'
})
const buttonDisabled = computed(
  () => submitting.value || (stayValid.value && availability.value !== 'available'),
)
</script>

<template>
  <form
    class="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6"
    novalidate
    @submit.prevent="onSubmit"
  >
    <div>
      <p class="text-3xl font-bold text-primary">
        {{ formatUsd(roomType.priceUsd) }}
        <span class="text-sm font-normal text-muted">/ night</span>
      </p>
      <p class="text-xs text-muted">{{ formatKhr(roomType.priceKhr) }} per night</p>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <BaseInput
        id="bk-checkIn"
        v-model="form.checkIn"
        label="Check-in"
        type="date"
        :min="today"
        :error="shown.checkIn"
      />
      <BaseInput
        id="bk-checkOut"
        v-model="form.checkOut"
        label="Check-out"
        type="date"
        :min="form.checkIn ? addDays(form.checkIn, 1) : today"
        :error="shown.checkOut"
      />
    </div>

    <div>
      <label for="bk-guests" class="mb-1 block text-xs font-medium text-muted">Guests</label>
      <select
        id="bk-guests"
        v-model.number="form.guests"
        class="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2"
        :class="
          shown.guests
            ? 'border-danger bg-red-50 focus:ring-red-200'
            : 'border-line bg-surface focus:border-primary focus:ring-blue-100'
        "
        :aria-invalid="!!shown.guests"
        aria-describedby="bk-guests-msg"
      >
        <option v-for="n in LIMITS.maxGuests" :key="n" :value="n">{{ plural(n, 'guest') }}</option>
      </select>
      <p
        id="bk-guests-msg"
        class="mt-1 text-xs"
        :class="shown.guests ? 'text-danger' : 'text-muted'"
      >
        {{ shown.guests ?? `Maximum ${plural(roomType.capacity, 'guest')} for this room type.` }}
      </p>
    </div>

    <div>
      <label for="bk-request" class="mb-1 block text-xs font-medium text-muted">
        Special request (optional)
      </label>
      <textarea
        id="bk-request"
        v-model="form.specialRequest"
        rows="2"
        placeholder="e.g. Late arrival around 22:00"
        class="w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2"
        :class="
          shown.specialRequest
            ? 'border-danger bg-red-50 focus:ring-red-200'
            : 'border-line bg-surface focus:border-primary focus:ring-blue-100'
        "
      />
      <p v-if="shown.specialRequest" class="mt-1 text-xs text-danger">{{ shown.specialRequest }}</p>
    </div>

    <!-- Availability for the chosen dates -->
    <p v-if="availability === 'checking'" class="text-xs text-muted">Checking availability…</p>
    <p v-else-if="availability === 'available'" class="text-xs font-medium text-emerald-700">
      ✓ Available for these dates
    </p>
    <p v-else-if="availability === 'unavailable'" class="text-xs font-medium text-danger">
      No room of this type is free for these dates.
    </p>
    <p v-else-if="availability === 'error'" class="text-xs text-danger">
      Couldn't check availability. Try again.
    </p>

    <!-- Price summary -->
    <div class="flex flex-col gap-2 border-y border-line py-4 text-sm">
      <div class="flex justify-between">
        <span class="text-muted">
          {{ formatUsd(roomType.priceUsd) }} × {{ nights ? plural(nights, 'night') : '— nights' }}
        </span>
        <span>{{ nights ? formatUsd(totalUsd) : '—' }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted">Extras (added at the desk)</span>
        <span>$0</span>
      </div>
    </div>
    <div class="flex items-start justify-between">
      <span class="font-semibold">Total</span>
      <div class="text-right">
        <p class="text-xl font-bold">{{ nights ? formatUsd(totalUsd) : '—' }}</p>
        <p v-if="nights" class="text-xs text-muted">{{ formatKhr(totalKhr) }}</p>
      </div>
    </div>

    <p v-if="submitError" role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-danger">
      {{ submitError }}
    </p>

    <button
      type="submit"
      class="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="buttonDisabled"
    >
      {{ buttonLabel }}
    </button>

    <p class="rounded-lg bg-surface p-3 text-xs text-muted">
      You pay at the front desk when you check out. Free cancellation until the day before check-in.
    </p>
  </form>
</template>
