import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import BookRoomModal from './BookRoomModal'
import type { Room } from '../types/api'
import { createBooking, BookingConflictError } from '../api/bookings'


vi.mock('../api/bookings', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../api/bookings')>()

  return {
    ...actual,
    createBooking: vi.fn(),
  }
})


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


describe('BookRoomModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })


  it('does not render when closed', () => {
    render(
      <BookRoomModal
        isOpen={false}
        onClose={vi.fn()}
        room={room}
      />,
    )

    expect(
      screen.queryByText('Новое бронирование'),
    ).not.toBeInTheDocument()
  })


  it('renders when opened', () => {
    render(
      <BookRoomModal
        isOpen={true}
        onClose={vi.fn()}
        room={room}
      />,
    )

    expect(
      screen.getByText('Новое бронирование'),
    ).toBeInTheDocument()
  })


  it('disables submit button when title is empty', () => {
    render(
      <BookRoomModal
        isOpen={true}
        onClose={vi.fn()}
        room={room}
      />,
    )

    expect(
      screen.getByRole('button', {
        name: 'Забронировать',
      }),
    ).toBeDisabled()
  })


  it('creates booking successfully', async () => {
    vi.mocked(createBooking).mockResolvedValueOnce(
      {} as never,
    )

    const onSuccess = vi.fn()
    const onClose = vi.fn()

    render(
      <BookRoomModal
        isOpen={true}
        onClose={onClose}
        room={room}
        onSuccess={onSuccess}
      />,
    )

    fireEvent.change(
      screen.getByLabelText(/Тема встречи/),
      {
        target: {
          value: 'Важная встреча',
        },
      },
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Забронировать',
      }),
    )

    await waitFor(() => {
      expect(createBooking).toHaveBeenCalledTimes(1)
    })

    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })


  it('shows conflict error when room is already booked (409)', async () => {
    vi.mocked(createBooking).mockRejectedValueOnce(
        new BookingConflictError('Переговорная уже занята на выбранное время'),
    )

    render(
        <BookRoomModal
        isOpen={true}
        onClose={vi.fn()}
        room={room}
        />,
    )

    fireEvent.change(
        screen.getByLabelText(/Тема встречи/),
        {
        target: {
            value: 'Встреча',
        },
        },
    )

    fireEvent.click(
        screen.getByRole('button', {
        name: 'Забронировать',
        }),
    )

    expect(
        await screen.findByText(
        'Эта переговорная уже была забронирована другим пользователем. Выберите другое время.',
        ),
    ).toBeInTheDocument()
  })
})