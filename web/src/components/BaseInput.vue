<script setup lang="ts">

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

defineProps<{
  id: string
  label: string
  error?: string
  hint?: string
}>()
</script>

<template>
  <div>
    <label :for="id" class="mb-1 block text-xs font-medium text-muted">{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      v-bind="$attrs"
      class="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2"
      :class="
        error
          ? 'border-danger bg-red-50 focus:ring-red-200'
          : 'border-line bg-surface focus:border-primary focus:ring-blue-100'
      "
      :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined"
    />
    <p v-if="error" :id="`${id}-error`" class="mt-1 text-xs text-danger">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="mt-1 text-xs text-muted">{{ hint }}</p>
  </div>
</template>
