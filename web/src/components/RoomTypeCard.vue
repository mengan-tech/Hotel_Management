<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { AvailabilityQuery, RoomType } from '@/types'
import { formatKhr, formatUsd, plural } from '@/utils/format'

const props = defineProps<{
  roomType: RoomType
  query?: AvailabilityQuery | null 
}>()

const detailLink = computed(() => ({
  name: 'room-detail',
  params: { id: props.roomType.id },
  query: props.query
    ? {
        checkIn: props.query.checkIn,
        checkOut: props.query.checkOut,
        guests: String(props.query.guests),
      }
    : {},
}))
</script>

<template>
  <article class="flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
    <img
      v-if="roomType.photos[0]"
      :src="roomType.photos[0]"
      :alt="roomType.name"
      class="h-44 w-full object-cover"
    />
    <div v-else class="h-44 bg-linear-to-br from-sky-100 to-indigo-200" />

    <div class="flex flex-1 flex-col gap-1 p-4">
      <h3 class="font-semibold">{{ roomType.name }}</h3>
      <p class="text-xs text-muted">
        {{ plural(roomType.capacity, 'guest') }} · {{ roomType.bed }} · {{ roomType.sizeM2 }} m²
      </p>

      <div class="mt-auto flex items-end justify-between gap-2 pt-4">
        <div>
          <p class="font-semibold text-primary">
            {{ formatUsd(roomType.priceUsd) }} <span class="text-sm font-normal">/ night</span>
          </p>
          <p class="text-xs text-muted">{{ formatKhr(roomType.priceKhr) }}</p>
        </div>
        <RouterLink
          :to="detailLink"
          class="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          View &amp; book
        </RouterLink>
      </div>
    </div>
  </article>
</template>
