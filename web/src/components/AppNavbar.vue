<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-line bg-white">
    <nav class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
      <RouterLink to="/" class="flex items-center gap-2 font-semibold">
        <span class="grid size-8 place-items-center rounded-lg bg-primary text-sm text-white"
          >R</span
        >
        <span class="hidden sm:inline">Riverside Hotel</span>
      </RouterLink>

      <div class="flex items-center gap-4 text-sm sm:gap-6">
        <RouterLink to="/rooms" class="nav-link text-muted hover:text-ink">Rooms</RouterLink>

        <!-- The UI only shows what the visitor can use -->
        <template v-if="auth.user">
          <RouterLink to="/my-bookings" class="nav-link text-muted hover:text-ink">
            My bookings
          </RouterLink>
          <span class="hidden items-center gap-2 md:flex">
            <span
              class="grid size-7 place-items-center rounded-full bg-blue-50 text-xs font-semibold text-primary"
            >
              {{ auth.user.name.charAt(0) }}
            </span>
            {{ auth.user.name }}
          </span>
          <button type="button" class="text-muted hover:text-ink" @click="logout">Log out</button>
        </template>
        <RouterLink
          v-else
          to="/login"
          class="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Log in
        </RouterLink>
      </div>
    </nav>
  </header>
</template>
