import type { Office } from '../types/api'

const API_URL = 'http://localhost:3000/api/v1'

interface OfficesResponse {
  items: Office[]
}

export async function getOffices(): Promise<Office[]> {
  const response = await fetch(`${API_URL}/offices`)

  if (!response.ok) {
    throw new Error('Не удалось загрузить офисы')
  }

  const data: OfficesResponse = await response.json()

  return data.items
}