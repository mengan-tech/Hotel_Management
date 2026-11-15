<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
    <p class="text-sm font-semibold text-primary">404</p>
    <h1 class="mt-2 text-3xl font-bold">Page not found</h1>
    <p class="mt-3 text-sm text-muted">The page you are looking for does not exist or was moved.</p>
    <RouterLink
      to="/"
      class="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
    >
      Back to home
    </RouterLink>
  </section>
</template>
