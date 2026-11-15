<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StatePanel from '@/components/StatePanel.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { bookingService } from '@/services/bookingService'
import { useAuthStore } from '@/stores/auth'
import type { Booking } from '@/types'
import { formatDate, formatKhr, formatUsd, nightsBetween, plural, todayISO } from '@/utils/format'

type Tab = 'all' | 'upcoming' | 'past' | 'cancelled'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const today = todayISO()

const bookings = ref<Booking[]>([])
const loading = ref(true)
const error = ref(false)

async function load() {
  if (!auth.user) return 
  loading.value = true
  error.value = false
  try {
    bookings.value = await bookingService.getMyBookings(auth.user.id)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}
onMounted(load)

//Tabs 
function tabOf(b: Booking): Exclude<Tab, 'all'> {
  if (b.status === 'CANCELLED') return 'cancelled'
  if (b.status === 'CHECKED_OUT' || b.status === 'NO_SHOW' || b.checkOut < today) return 'past'
  return 'upcoming'
}
const tab = ref<Tab>('all')
const tabs = computed(() =>
  (['all', 'upcoming', 'past', 'cancelled'] as const).map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    count:
      key === 'all' ? bookings.value.length : bookings.value.filter((b) => tabOf(b) === key).length,
  })),
)
const visible = computed(() =>
  tab.value === 'all' ? bookings.value : bookings.value.filter((b) => tabOf(b) === tab.value),
)

// Cancel 
const canCancel = (b: Booking) =>
  (b.status === 'PENDING' || b.status === 'CONFIRMED') && b.checkIn > today
const confirmingId = ref<number | null>(null)
const cancellingId = ref<number | null>(null)
const actionError = ref<string | null>(null)

async function cancel(b: Booking) {
  cancellingId.value = b.id
  actionError.value = null
  try {
    const updated = await bookingService.cancelBooking(b.id)
    bookings.value = bookings.value.map((x) =>
      x.id === b.id ? { ...x, status: updated.status } : x,
    )
  } catch {
    actionError.value = "Couldn't cancel the booking. Try again."
  } finally {
    cancellingId.value = null
    confirmingId.value = null
  }
}

const code = (b: Booking) => `#HMS-${String(b.id).padStart(4, '0')}`
const nights = (b: Booking) => nightsBetween(b.checkIn, b.checkOut)
const createdId = computed(() => Number(route.query.created) || null)
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-10 sm:px-8">
    <h1 class="text-3xl font-bold">My bookings</h1>
    <p class="mt-2 text-sm text-muted">See your bookings, their status and your invoices.</p>

    <p
      v-if="createdId"
      role="status"
      class="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
    >
      ✓ Booking #HMS-{{ String(createdId).padStart(4, '0') }} was created. Its status is
      <strong>Pending</strong> until the hotel confirms it.
    </p>

    <!-- Tabs -->
    <div v-if="!loading && !error" class="mt-6 flex flex-wrap gap-2" role="tablist">
      <button
        v-for="t in tabs"
        :key="t.key"
        type="button"
        role="tab"
        :aria-selected="tab === t.key"
        class="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
        :class="
          tab === t.key
            ? 'border-primary bg-white font-semibold text-ink'
            : 'border-transparent text-muted hover:text-ink'
        "
        @click="tab = t.key"
      >
        {{ t.label }}
        <span class="rounded-full bg-surface px-2 text-xs">{{ t.count }}</span>
      </button>
    </div>

    <div class="mt-6">
      <!-- Loading -->
      <div v-if="loading" class="flex flex-col gap-3" aria-hidden="true">
        <div v-for="n in 3" :key="n" class="h-28 animate-pulse rounded-2xl bg-line" />
      </div>

      <!-- Error -->
      <StatePanel
        v-else-if="error"
        variant="error"
        title="Couldn't load your bookings"
        message="The server didn't respond. Check your connection and try again."
        action-label="Try again"
        @action="load"
      />

      <!-- Empty: no bookings at all -->
      <StatePanel
        v-else-if="bookings.length === 0"
        variant="empty"
        title="You have no bookings yet"
        message="When you book a room, it will appear here with its status and invoice."
        action-label="Find a room"
        @action="router.push({ name: 'home' })"
      />

      <!-- Empty: nothing in this tab -->
      <p
        v-else-if="visible.length === 0"
        class="rounded-2xl border border-line bg-white p-8 text-center text-sm text-muted"
      >
        No bookings in this tab.
      </p>

      <!-- Data -->
      <ul v-else class="flex flex-col gap-3">
        <li
          v-for="b in visible"
          :key="b.id"
          class="flex flex-col gap-4 rounded-2xl border bg-white p-4 md:flex-row md:items-center"
          :class="b.id === createdId ? 'border-emerald-300' : 'border-line'"
        >
          <div
            class="hidden h-20 w-28 shrink-0 rounded-lg bg-linear-to-br from-sky-100 to-indigo-200 md:block"
          />

          <div class="flex-1">
            <p class="text-xs text-muted">{{ code(b) }}</p>
            <p class="font-semibold">
              {{ b.roomType?.name ?? 'Room type' }}
              <span v-if="b.room" class="font-normal text-muted">· Room {{ b.room.number }}</span>
            </p>
            <p class="text-sm text-muted">
              {{ formatDate(b.checkIn) }} → {{ formatDate(b.checkOut) }} ·
              {{ plural(nights(b), 'night') }} · {{ plural(b.guests, 'guest') }}
            </p>
            <!-- plain text with {{ }}: a special request can never run as HTML -->
            <p v-if="b.specialRequest" class="mt-1 text-xs text-muted">“{{ b.specialRequest }}”</p>
          </div>

          <StatusBadge :status="b.status" class="self-start md:self-center" />

          <div class="md:w-32 md:text-right">
            <p class="font-semibold">{{ formatUsd(b.totalUsd) }}</p>
            <p v-if="b.roomType" class="text-xs text-muted">
              {{ formatKhr(b.roomType.priceKhr * nights(b)) }}
            </p>
          </div>

          <div class="flex gap-2 md:w-48 md:justify-end">
            <template v-if="canCancel(b)">
              <template v-if="confirmingId === b.id">
                <button
                  type="button"
                  class="rounded-lg bg-danger px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  :disabled="cancellingId === b.id"
                  @click="cancel(b)"
                >
                  {{ cancellingId === b.id ? 'Cancelling…' : 'Yes, cancel' }}
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-line px-3 py-2 text-sm"
                  @click="confirmingId = null"
                >
                  Keep
                </button>
              </template>
              <button
                v-else
                type="button"
                class="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-danger hover:bg-red-100"
                @click="confirmingId = b.id"
              >
                Cancel
              </button>
            </template>
          </div>
        </li>
      </ul>

      <p v-if="actionError" role="alert" class="mt-3 text-sm text-danger">{{ actionError }}</p>
    </div>

    <p class="mt-6 rounded-lg bg-surface p-3 text-xs text-muted">
      You can cancel a booking until the day before check-in. Invoices appear here after check-out.
    </p>
  </section>
</template>
