import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '@/services/authService'
import type { LoginInput, RegisterInput, User } from '@/types'

const STORAGE_KEY = 'hms-user'

// Keep the user after a page refresh. 
function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function saveUser(user: User | null) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // the user stays logged in for this tab only
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(loadUser())
  const isLoggedIn = computed(() => user.value !== null)

  function setUser(next: User | null) {
    user.value = next
    saveUser(next)
  }

  async function login(credentials: LoginInput): Promise<boolean> {
    const found = await authService.login(credentials)
    setUser(found)
    return found !== null
  }

  async function register(input: RegisterInput): Promise<'ok' | 'email-taken'> {
    if (await authService.emailExists(input.email)) return 'email-taken'
    setUser(await authService.register(input))
    return 'ok'
  }

  function logout() {
    setUser(null)
  }

  return { user, isLoggedIn, login, register, logout }
})
