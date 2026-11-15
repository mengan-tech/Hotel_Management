<script setup lang="ts">
import { onMounted, ref } from 'vue'
import RoomTypeCard from '@/components/RoomTypeCard.vue'
import RoomCardSkeleton from '@/components/RoomCardSkeleton.vue'
import StatePanel from '@/components/StatePanel.vue'
import { roomService } from '@/services/roomService'
import type { RoomType } from '@/types'

const roomTypes = ref<RoomType[]>([])
const loading = ref(true)
const error = ref(false)

async function load() {
  loading.value = true
  error.value = false
  try {
    roomTypes.value = await roomService.getRoomTypes()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-10 sm:px-8">
    <h1 class="text-3xl font-bold">Rooms</h1>
    <p class="mt-2 mb-8 text-sm text-muted">
      All our room types. Open one to choose your dates and book.
    </p>

    <div v-if="loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <RoomCardSkeleton v-for="n in 4" :key="n" />
    </div>

    <StatePanel
      v-else-if="error"
      variant="error"
      title="Couldn't load rooms"
      message="The server didn't respond. Check your connection and try again."
      action-label="Try again"
      @action="load"
    />

    <StatePanel
      v-else-if="roomTypes.length === 0"
      variant="empty"
      title="No room types yet"
      message="The hotel has not added any room types yet."
    />

    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <RoomTypeCard v-for="rt in roomTypes" :key="rt.id" :room-type="rt" />
    </div>
  </section>
</template>
