import axios from 'axios'

// API address

export const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 5000,
})
