import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import RoomCard from './RoomCard'
import type { Room } from '../types/api'


vi.mock('./BookRoomModal', () => ({
  default: ({
    isOpen,
  }: {
    isOpen: boolean
  }) => (
    isOpen
      ? <div>Модальное окно бронирования</div>
      : null
  ),
}))


const room: Room = {
  id: '1',
  name: 'Переговорная 101',
  officeId: 'office-1',
  floor: 2,
  capacity: 8,
  available: true,
  features: [],
  office: {
    id: 'office-1',
    name: 'Главный офис',
    address: 'ул. Лесная 7',
    timezone: 'Europe/Moscow',
  },
}


describe('RoomCard', () => {

  it('renders room information', () => {
    render(
      <BrowserRouter>
        <RoomCard room={room} />
      </BrowserRouter>,
    )

    expect(
      screen.getByText('Переговорная 101'),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/Вместимость: до 8 человек/),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Доступна'),
    ).toBeInTheDocument()
  })


  it('opens booking modal when booking button is clicked', () => {
    render(
      <BrowserRouter>
        <RoomCard room={room} />
      </BrowserRouter>,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Забронировать',
      }),
    )

    expect(
      screen.getByText('Модальное окно бронирования'),
    ).toBeInTheDocument()
  })


  it('disables booking button when room is unavailable', () => {
    const unavailableRoom: Room = {
      ...room,
      available: false,
    }

    render(
      <BrowserRouter>
        <RoomCard room={unavailableRoom} />
      </BrowserRouter>,
    )

    const button = screen.getByRole('button', {
      name: 'Забронировать',
    })

    expect(button).toBeDisabled()

    expect(
      screen.getByText('Недоступна'),
    ).toBeInTheDocument()
  })


  it('contains correct link to room details', () => {
    render(
        <BrowserRouter>
        <RoomCard room={room} />
        </BrowserRouter>,
    )

    const link = screen.getByRole('link', {
        name: 'Подробнее',
    })

    expect(link).toHaveAttribute(
        'href',
        '/rooms/1',
    )
    })

})