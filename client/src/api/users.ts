import type { User } from '../types/api'

const API_URL = 'http://localhost:3000/api/v1'

export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_URL}/me`)

  if (!response.ok) {
    throw new Error('Не удалось загрузить текущего пользователя')
  }

  return response.json()
}