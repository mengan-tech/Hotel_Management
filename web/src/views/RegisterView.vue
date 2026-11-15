<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BaseInput from '@/components/BaseInput.vue'
import { useAuthStore } from '@/stores/auth'
import type { RegisterInput } from '@/types'
import { LIMITS, hasErrors, validateRegister, type Errors } from '@/utils/validation'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = ref<RegisterInput>({ name: '', email: '', phone: '', password: '' })
const errors = ref<Errors<keyof RegisterInput>>({})
const serverError = ref<string | null>(null)
const submitting = ref(false)

const redirectTo = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : '/'
})

async function onSubmit() {
  serverError.value = null
  errors.value = validateRegister(form.value)
  if (hasErrors(errors.value)) return

  submitting.value = true
  try {
    const result = await auth.register(form.value)
    if (result === 'email-taken') errors.value = { email: 'This email is already registered.' }
    else router.replace(redirectTo.value)
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
        <h1 class="text-2xl font-bold">Create your account</h1>
        <p class="mt-1 text-sm text-muted">Register to book rooms and manage your bookings.</p>
      </div>

      <BaseInput
        id="name"
        v-model="form.name"
        label="Full name"
        autocomplete="name"
        :error="errors.name"
      />
      <BaseInput
        id="email"
        v-model="form.email"
        label="Email"
        type="email"
        autocomplete="email"
        :error="errors.email"
      />
      <BaseInput
        id="phone"
        v-model="form.phone"
        label="Phone"
        type="tel"
        autocomplete="tel"
        placeholder="012 345 678"
        :error="errors.phone"
      />
      <BaseInput
        id="password"
        v-model="form.password"
        label="Password"
        type="password"
        autocomplete="new-password"
        :hint="`At least ${LIMITS.minPassword} characters.`"
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
        {{ submitting ? 'Creating account…' : 'Create account' }}
      </button>

      <p class="border-t border-line pt-4 text-center text-sm text-muted">
        Already have an account?
        <RouterLink
          :to="{ name: 'login', query: route.query }"
          class="font-semibold text-primary hover:underline"
        >
          Log in
        </RouterLink>
      </p>
    </form>

    <p class="mt-4 text-center text-xs text-muted">
      Guests register here. Staff accounts are created by the manager.
    </p>
  </section>
</template>
