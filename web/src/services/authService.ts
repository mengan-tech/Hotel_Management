import { api } from './api'
import type { LoginInput, RegisterInput, User } from '@/types'

// MOCK ONLY: json-server has no passwords and no tokens.
// - login: finds the user by email; the password is NOT checked.
// - register: the password is NOT sent or stored.
// In M3: POST /auth/login and POST /auth/register on NestJS
// (bcrypt-hashed passwords, a JWT is returned).
export const authService = {
  async login(credentials: LoginInput): Promise<User | null> {
    const { data } = await api.get<User[]>('/users', {
      params: { email: credentials.email.trim().toLowerCase() },
    })
    return data[0] ?? null
  },

  async emailExists(email: string): Promise<boolean> {
    const { data } = await api.get<User[]>('/users', {
      params: { email: email.trim().toLowerCase() },
    })
    return data.length > 0
  },

  async register(input: RegisterInput): Promise<User> {
    const { data } = await api.post<User>('/users', {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      role: 'GUEST', // guests register themselves; staff are created by the manager
    })
    return data
  },
}
