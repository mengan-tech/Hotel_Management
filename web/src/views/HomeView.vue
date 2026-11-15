<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter, type LocationQuery } from 'vue-router'
import SearchForm from '../components/SearchForm.vue'
import RoomTypeCard from '../components/RoomTypeCard.vue'
import RoomCardSkeleton from '../components/RoomCardSkeleton.vue'
import StatePanel from '../components/StatePanel.vue'
import { roomService } from '../services/roomService'
import type { AvailabilityQuery, RoomType } from '../types'
import { formatDate, nightsBetween, plural } from '../utils/format'

const route = useRoute()
const router = useRouter()

//3 states of the page
const roomTypes = ref<RoomType[]>([])
const loading = ref(false)
const error = ref(false)

function parseQuery(q: LocationQuery): AvailabilityQuery | null {
  const { checkIn, checkOut, guests } = q
  if (typeof checkIn !== 'string' || typeof checkOut !== 'string' || typeof guests !== 'string')
    return null
  const g = Number(guests)
  return Number.isInteger(g) && g > 0 ? { checkIn, checkOut, guests: g } : null
}
const query = computed(() => parseQuery(route.query))

let lastRequest = 0
async function load() {
  const requestId = ++lastRequest
  loading.value = true
  error.value = false
  try {
    const result = query.value
      ? await roomService.searchAvailable(query.value)
      : await roomService.getRoomTypes()
    if (requestId === lastRequest) roomTypes.value = result
  } catch {
    if (requestId === lastRequest) error.value = true
  } finally {
    if (requestId === lastRequest) loading.value = false
  }
}

watch(() => route.query, load, { immediate: true })

function onSearch(q: AvailabilityQuery) {
  const next = { checkIn: q.checkIn, checkOut: q.checkOut, guests: String(q.guests) }
  const same =
    route.query.checkIn === next.checkIn &&
    route.query.checkOut === next.checkOut &&
    route.query.guests === next.guests
  if (same) load()
  else router.push({ name: 'home', query: next })
}

function scrollToSearch() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  document.getElementById('checkIn')?.focus()
}

const heading = computed(() =>
  query.value ? `${plural(roomTypes.value.length, 'room type')} available` : 'Our room types',
)
const subheading = computed(() => {
  const q = query.value
  if (!q) return 'Choose your dates above to see which rooms are free.'
  return `${formatDate(q.checkIn)} – ${formatDate(q.checkOut)} · ${plural(nightsBetween(q.checkIn, q.checkOut), 'night')} · ${plural(q.guests, 'guest')}`
})
</script>

<template>
  <!-- Hero + search -->
  <section class="bg-linear-to-b from-blue-50 to-page">
    <div class="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-8">
      <p class="text-xs font-semibold tracking-wider text-primary uppercase">
        Book direct · Best rate
      </p>
      <h1 class="mt-3 text-3xl font-bold sm:text-4xl">Find a room for your dates</h1>
      <p class="mt-3 max-w-xl text-sm text-muted">
        Pick check-in and check-out dates and the number of guests. We only show rooms that are free
        for every night of your stay.
      </p>
      <div class="mt-6">
        <SearchForm :initial="query" @search="onSearch" />
      </div>
    </div>
  </section>

  <!-- Results -->
  <section class="mx-auto max-w-7xl px-4 pb-16 sm:px-8">
    <div class="mb-5">
      <h2 class="text-lg font-semibold">
        {{ loading ? 'Searching available rooms…' : error ? 'Available rooms' : heading }}
      </h2>
      <p class="text-sm text-muted">{{ subheading }}</p>
    </div>

    <!-- 1. Loading -->
    <div v-if="loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <RoomCardSkeleton v-for="n in 4" :key="n" />
    </div>

    <!-- 2. Error -->
    <StatePanel
      v-else-if="error"
      variant="error"
      title="Couldn't load available rooms"
      message="The server didn't respond. Check your connection and try again."
      action-label="Try again"
      @action="load"
    />

    <!-- 3. Empty -->
    <StatePanel
      v-else-if="roomTypes.length === 0"
      variant="empty"
      :title="query ? 'No rooms are free for these dates' : 'No room types yet'"
      :message="
        query
          ? 'Every room type is booked or too small for your group. Try other dates or fewer guests.'
          : 'The hotel has not added any room types yet.'
      "
      :action-label="query ? 'Change dates' : undefined"
      @action="scrollToSearch"
    />

    <!-- 4. Data -->
    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <RoomTypeCard v-for="rt in roomTypes" :key="rt.id" :room-type="rt" :query="query" />
    </div>
  </section>
</template>
