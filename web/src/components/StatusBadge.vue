<script setup lang="ts">
import { computed } from 'vue'
import type { BookingStatus } from '@/types'

const props = defineProps<{ status: BookingStatus }>()

const STYLES: Record<BookingStatus, { label: string; classes: string }> = {
  PENDING: { label: 'Pending', classes: 'bg-amber-50 text-amber-700' },
  CONFIRMED: { label: 'Confirmed', classes: 'bg-blue-50 text-primary' },
  CHECKED_IN: { label: 'Checked in', classes: 'bg-emerald-50 text-emerald-700' },
  CHECKED_OUT: { label: 'Checked out', classes: 'bg-slate-100 text-slate-600' },
  CANCELLED: { label: 'Cancelled', classes: 'bg-red-50 text-danger' },
  NO_SHOW: { label: 'No-show', classes: 'bg-orange-50 text-orange-700' },
}

const style = computed(() => STYLES[props.status])
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
    :class="style.classes"
  >
    <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
    {{ style.label }}
  </span>
</template>
