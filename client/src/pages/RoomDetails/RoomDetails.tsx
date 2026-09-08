import './RoomDetails.css'
import { Link, useParams } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'

import type { Room } from '../../types/api'
import { getRoom } from '../../api/rooms'
import Header from '../../components/Header'
import RoomDetailsCard from '../../components/RoomDetailsCard'
import RoomCalendar from '../../components/RoomCalendar'
import BookRoomModal from '../../components/BookRoomModal'
import ToastNotification from '../../components/ToastNotification'
import PageTitle from '../../components/PageTitle'
import { useRealtime, type RealtimeEvent } from '../../realtime/useRealtime'

export default function RoomDetails() {
  const { roomId } = useParams()

  const [room, setRoom] = useState<Room | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0)

  const [toast, setToast] = useState<{ title: string; message: string } | null>(null)

  const handleRealtimeEvent = useCallback((event: RealtimeEvent) => {
    if (event.type === 'data.reset') {
      setCalendarRefreshKey((prev) => prev + 1)
      return
    }

    if (
      event.type === 'booking.created' ||
      event.type === 'booking.cancelled'
    ) {
      const booking = event.data.booking as {
        roomId?: string
      }

      if (booking.roomId === roomId) {
        setCalendarRefreshKey((prev) => prev + 1)
      }
    }
  }, [roomId])

  useRealtime({
    onEvent: handleRealtimeEvent,
  })

  const loadRoom = async () => {
    if (!roomId) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const data = await getRoom(roomId)

      setRoom(data)
    } catch {
      setError('Не удалось загрузить переговорную')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRoom()
  }, [roomId])

  if (error && !room) {
    return (
      <div className="container">
        <Header />
        <p>{error}</p>
      </div>
    )
  }


  return (
    <>
      <PageTitle
        title={room ? room.name : 'Переговорная'}
      />

      <div className="container">
        <Header />

        {toast && (
          <ToastNotification
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        <div className="container">
          <nav className="breadcrumbs">
            {isLoading ? (
              <div className="skeleton" style={{ width: '220px', height: '18px', borderRadius: '4px' }} />
            ) : (
              <>
                <Link to="/rooms">Переговорные</Link>
                <span className="breadcrumb-separator">&gt;</span>
                <Link to={`/rooms?officeId=${room?.office.id}`}>{room?.office.name}</Link>
                <span className="breadcrumb-separator">&gt;</span>
                <span className="breadcrumb-current">Комната '{room?.name}'</span>
              </>
            )}
          </nav>

          <div className="room-details-wrapper">
            <RoomDetailsCard 
              room={room}
              isLoading={isLoading}
            />

            <RoomCalendar
              key={calendarRefreshKey}
              roomId={roomId}
              timezone={room?.office.timezone ?? 'Europe/Moscow'}
              onBookClick={() => setIsBookModalOpen(true)}
              isLoadingRoom={isLoading}
            />
          </div>
        </div>

        {room && (
          <BookRoomModal
            isOpen={isBookModalOpen}
            onClose={() => setIsBookModalOpen(false)}
            room={room}
            onScheduleRefresh={() => setCalendarRefreshKey((prev) => prev + 1)}
            onSuccess={({ roomName, dateStr, timeRangeStr }) => {
              setCalendarRefreshKey((prev) => prev + 1)
              setToast({
                title: 'Бронирование создано',
                message: `Комната ${roomName}, ${dateStr}, ${timeRangeStr}`,
              })
            }}
          />
        )}
      </div>
    </>
  )
}