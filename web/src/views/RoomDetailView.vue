<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { isAxiosError } from 'axios'
import BookingCard from '@/components/BookingCard.vue'
import StatePanel from '@/components/StatePanel.vue'
import { roomService } from '@/services/roomService'
import type { RoomType } from '@/types'
import { plural } from '@/utils/format'

//id comes from the URL
const props = defineProps<{ id: string }>()
const router = useRouter()

const roomType = ref<RoomType | null>(null)
const loading = ref(true)
const error = ref<'not-found' | 'failed' | null>(null)

async function load() {
  loading.value = true
  error.value = null
  roomType.value = null
  const id = Number(props.id)
  if (!Number.isInteger(id) || id < 1) {
    error.value = 'not-found'
    loading.value = false
    return
  }
  try {
    roomType.value = await roomService.getRoomType(id)
  } catch (e) {
    error.value = isAxiosError(e) && e.response?.status === 404 ? 'not-found' : 'failed'
  } finally {
    loading.value = false
  }
}

watch(() => props.id, load, { immediate: true })
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-8 sm:px-8">
    <nav class="mb-4 text-sm text-muted" aria-label="Breadcrumb">
      <RouterLink to="/rooms" class="hover:text-ink">Rooms</RouterLink>
      <span class="mx-2">/</span>
      <span class="text-ink">{{ roomType?.name ?? '…' }}</span>
    </nav>

    <!-- Loading -->
    <div
      v-if="loading"
      class="grid animate-pulse gap-10 lg:grid-cols-[1fr_400px]"
      aria-hidden="true"
    >
      <div class="flex flex-col gap-4">
        <div class="h-80 rounded-2xl bg-line" />
        <div class="h-8 w-1/2 rounded bg-line" />
        <div class="h-4 w-3/4 rounded bg-surface" />
      </div>
      <div class="h-[520px] rounded-2xl bg-line" />
    </div>

    <!-- Not found / error -->
    <StatePanel
      v-else-if="error === 'not-found'"
      variant="empty"
      title="Room type not found"
      message="This room type does not exist or was removed."
      action-label="See all rooms"
      @action="router.push({ name: 'rooms' })"
    />
    <StatePanel
      v-else-if="error === 'failed' || !roomType"
      variant="error"
      title="Couldn't load this room"
      message="The server didn't respond. Check your connection and try again."
      action-label="Try again"
      @action="load"
    />

    <!-- Data -->
    <div v-else class="grid items-start gap-10 lg:grid-cols-[1fr_400px]">
      <div class="flex flex-col gap-6">
        <img
          v-if="roomType.photos[0]"
          :src="roomType.photos[0]"
          :alt="roomType.name"
          class="h-80 w-full rounded-2xl object-cover"
        />
        <div v-else class="h-80 rounded-2xl bg-linear-to-br from-sky-100 to-indigo-200" />

        <div>
          <h1 class="text-3xl font-bold">{{ roomType.name }}</h1>
          <ul class="mt-3 flex flex-wrap gap-2 text-sm">
            <li class="rounded-full border border-line bg-white px-3 py-1">
              {{ plural(roomType.capacity, 'guest') }}
            </li>
            <li class="rounded-full border border-line bg-white px-3 py-1">{{ roomType.bed }}</li>
            <li class="rounded-full border border-line bg-white px-3 py-1">
              {{ roomType.sizeM2 }} m²
            </li>
          </ul>
        </div>

        <div>
          <h2 class="font-semibold">About this room</h2>
          <!-- {{ }} always shows plain text, so HTML in the description cannot run (no XSS) -->
          <p class="mt-2 text-sm text-muted">{{ roomType.description }}</p>
        </div>

        <div v-if="roomType.features.length">
          <h2 class="font-semibold">Features</h2>
          <ul class="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            <li v-for="feature in roomType.features" :key="feature" class="flex items-center gap-2">
              <span class="text-emerald-600" aria-hidden="true">✓</span>{{ feature }}
            </li>
          </ul>
        </div>
      </div>

      <BookingCard :key="roomType.id" :room-type="roomType" class="lg:sticky lg:top-24" />
    </div>
  </section>
</template>
