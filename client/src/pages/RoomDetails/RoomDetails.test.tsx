import { render, screen, waitFor } from '@testing-library/react'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import RoomDetails from './RoomDetails'
import { getRoom } from '../../api/rooms'

import type { Room } from '../../types/api'


vi.mock('../../api/rooms', () => ({
  getRoom: vi.fn(),
}))


vi.mock('../../components/Header', () => ({
  default: () => <header>Header</header>,
}))


vi.mock('../../components/RoomDetailsCard', () => ({
  default: ({
    room,
  }: {
    room: Room | null
  }) => (
    <div>
      Детали комнаты: {room?.name}
    </div>
  ),
}))


vi.mock('../../components/RoomCalendar', () => ({
  default: ({
    onBookClick,
  }: {
    onBookClick: () => void
  }) => (
    <div>
      <div>Календарь комнаты</div>

      <button onClick={onBookClick}>
        Открыть бронирование
      </button>
    </div>
  ),
}))


vi.mock('../../components/BookRoomModal', () => ({
  default: ({
    isOpen,
    onSuccess,
  }: {
    isOpen: boolean
    onSuccess?: (details: {
      roomName: string
      dateStr: string
      timeRangeStr: string
    }) => void
  }) => {
    if (!isOpen) return null

    return (
      <div>
        <div>Модальное окно бронирования</div>

        <button
          onClick={() =>
            onSuccess?.({
              roomName: 'Переговорная 101',
              dateStr: '10 сентября',
              timeRangeStr: '15:00-16:00',
            })
          }
        >
          Успешно забронировать
        </button>
      </div>
    )
  },
}))


vi.mock('../../components/ToastNotification', () => ({
  default: ({
    title,
    message,
    onClose,
  }: {
    title: string
    message: string
    onClose: () => void
  }) => (
    <div>
      <h2>{title}</h2>

      <p>{message}</p>

      <button onClick={onClose}>
        Закрыть toast
      </button>
    </div>
  ),
}))


const room: Room = {
  id: 'room-1',
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


function renderRoomDetails() {
  return render(
    <MemoryRouter
      initialEntries={['/rooms/room-1']}
    >
      <Routes>
        <Route
          path="/rooms/:roomId"
          element={<RoomDetails />}
        />
      </Routes>
    </MemoryRouter>,
  )
}


describe('RoomDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })


  it('loads and displays room information', async () => {
    vi.mocked(getRoom).mockResolvedValue(room)

    renderRoomDetails()

    await waitFor(() => {
      expect(getRoom).toHaveBeenCalledWith(
        'room-1',
      )
    })

    expect(
      await screen.findByText(
        'Детали комнаты: Переговорная 101',
      ),
    ).toBeInTheDocument()
  })


  it('shows error when room loading fails', async () => {
    vi.mocked(getRoom).mockRejectedValue(
      new Error('API error'),
    )

    renderRoomDetails()

    expect(
      await screen.findByText(
        'Не удалось загрузить переговорную',
      ),
    ).toBeInTheDocument()
  })


  it('shows toast after successful booking', async () => {
    vi.mocked(getRoom).mockResolvedValue(room)

    const user = userEvent.setup()

    renderRoomDetails()

    await screen.findByText(
      'Детали комнаты: Переговорная 101',
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Открыть бронирование',
      }),
    )

    expect(
      screen.getByText(
        'Модальное окно бронирования',
      ),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'Успешно забронировать',
      }),
    )

    expect(
      screen.getByText(
        'Бронирование создано',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'Комната Переговорная 101, 10 сентября, 15:00-16:00',
      ),
    ).toBeInTheDocument()
  })
})