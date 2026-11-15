<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BaseInput from '@/components/BaseInput.vue'
import { useAuthStore } from '@/stores/auth'
import type { LoginInput } from '@/types'
import { hasErrors, validateLogin, type Errors } from '@/utils/validation'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = ref<LoginInput>({ email: '', password: '' })
const errors = ref<Errors<keyof LoginInput>>({})
const serverError = ref<string | null>(null)
const submitting = ref(false)

// Where to go after login. Only allow relative paths
const redirectTo = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : '/'
})

async function onSubmit() {
  serverError.value = null
  errors.value = validateLogin(form.value)
  if (hasErrors(errors.value)) return

  submitting.value = true
  try {
    const ok = await auth.login(form.value)
    if (ok) router.replace(redirectTo.value)
    else serverError.value = 'Invalid email or password.'
  } catch {
    serverError.value = "Couldn't reach the server. Try again."
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="mx-auto flex max-w-md flex-col px-4 py-16">
    <form
      class="flex flex-col gap-4 rounded-2xl border border-line bg-white p-8"
      novalidate
      @submit.prevent="onSubmit"
    >
      <div>
        <h1 class="text-2xl font-bold">Welcome back</h1>
        <p class="mt-1 text-sm text-muted">Log in to book rooms and manage your stays.</p>
      </div>

      <BaseInput
        id="email"
        v-model="form.email"
        label="Email"
        type="email"
        autocomplete="email"
        :error="errors.email"
      />
      <BaseInput
        id="password"
        v-model="form.password"
        label="Password"
        type="password"
        autocomplete="current-password"
        :error="errors.password"
      />

      <p v-if="serverError" role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-danger">
        {{ serverError }}
      </p>

      <button
        type="submit"
        class="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        :disabled="submitting"
      >
        {{ submitting ? 'Logging in…' : 'Log in' }}
      </button>

      <p class="border-t border-line pt-4 text-center text-sm text-muted">
        New here?
        <RouterLink
          :to="{ name: 'register', query: route.query }"
          class="font-semibold text-primary hover:underline"
        >
          Create an account
        </RouterLink>
      </p>
    </form>

    <p class="mt-4 text-center text-xs text-muted">
      Mock accounts (M1): mengan@example.com · reception@example.com · manager@example.com — any
      password.
    </p>
  </section>
</template>
