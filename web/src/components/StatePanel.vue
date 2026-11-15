<script setup lang="ts">


defineProps<{
  variant: 'empty' | 'error'
  title: string
  message: string
  actionLabel?: string
}>()

const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <div
    class="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white px-6 py-12 text-center"
    :role="variant === 'error' ? 'alert' : 'status'"
  >
    <div
      class="grid size-14 place-items-center rounded-full"
      :class="variant === 'error' ? 'bg-red-50 text-danger' : 'bg-blue-50 text-primary'"
    >
      <!-- alert icon -->
      <svg
        v-if="variant === 'error'"
        class="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
      <!-- calendar-x icon -->
      <svg
        v-else
        class="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18M10 14l4 4M14 14l-4 4" />
      </svg>
    </div>

    <h3 class="text-lg font-semibold">{{ title }}</h3>
    <p class="max-w-md text-sm text-muted">{{ message }}</p>

    <button
      v-if="actionLabel"
      type="button"
      class="mt-2 rounded-lg px-4 py-2 text-sm font-semibold"
      :class="
        variant === 'error'
          ? 'bg-primary text-white hover:bg-blue-700'
          : 'border border-line bg-surface text-ink hover:bg-line'
      "
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
