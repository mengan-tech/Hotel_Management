<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AvailabilityQuery } from '@/types'
import { addDays, todayISO } from '@/utils/format'
import { LIMITS, hasErrors, validateStay, type StayErrors } from '@/utils/validation'

type Field = keyof StayErrors

const props = defineProps<{ initial?: AvailabilityQuery | null }>()
const emit = defineEmits<{ search: [query: AvailabilityQuery] }>()

const today = todayISO()
const lastCheckIn = addDays(today, LIMITS.maxDaysAhead)
const MAX_GUESTS = LIMITS.maxGuests

const form = ref<AvailabilityQuery>({ checkIn: today, checkOut: addDays(today, 1), guests: 2 })
const errors = ref<StayErrors>({})

// Fill the form from the URL 
watch(
  () => props.initial,
  (initial) => {
    if (initial) form.value = { ...initial }
  },
  { immediate: true },
)

function onSubmit() {
  errors.value = validateStay(form.value) 
  if (!hasErrors(errors.value)) emit('search', { ...form.value })
}

const fieldClass = (field: Field) => [
  'w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2',
  errors.value[field]
    ? 'border-danger bg-red-50 focus:ring-red-200'
    : 'border-line bg-surface focus:border-primary focus:ring-blue-100',
]
</script>

<template>
  <form
    class="grid gap-4 rounded-2xl border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-start"
    novalidate
    @submit.prevent="onSubmit"
  >
    <div>
      <label for="checkIn" class="mb-1 block text-xs font-medium text-muted">Check-in</label>
      <input
        id="checkIn"
        v-model="form.checkIn"
        type="date"
        :min="today"
        :max="lastCheckIn"
        :class="fieldClass('checkIn')"
        :aria-invalid="!!errors.checkIn"
        aria-describedby="checkIn-error"
      />
      <p v-if="errors.checkIn" id="checkIn-error" class="mt-1 text-xs text-danger">
        {{ errors.checkIn }}
      </p>
    </div>

    <div>
      <label for="checkOut" class="mb-1 block text-xs font-medium text-muted">Check-out</label>
      <input
        id="checkOut"
        v-model="form.checkOut"
        type="date"
        :min="form.checkIn ? addDays(form.checkIn, 1) : today"
        :class="fieldClass('checkOut')"
        :aria-invalid="!!errors.checkOut"
        aria-describedby="checkOut-error"
      />
      <p v-if="errors.checkOut" id="checkOut-error" class="mt-1 text-xs text-danger">
        {{ errors.checkOut }}
      </p>
    </div>

    <div>
      <label for="guests" class="mb-1 block text-xs font-medium text-muted">Guests</label>
      <input
        id="guests"
        v-model.number="form.guests"
        type="number"
        min="1"
        :max="MAX_GUESTS"
        :class="fieldClass('guests')"
        :aria-invalid="!!errors.guests"
        aria-describedby="guests-error"
      />
      <p v-if="errors.guests" id="guests-error" class="mt-1 text-xs text-danger">
        {{ errors.guests }}
      </p>
    </div>

    <button
      type="submit"
      class="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 lg:mt-5"
    >
      Search availability
    </button>
  </form>
</template>
