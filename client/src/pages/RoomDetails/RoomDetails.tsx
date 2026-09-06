import './RoomDetails.css'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import type { Room } from '../../types/api'
import { getRoom } from '../../api/rooms'
import Header from '../../components/Header'
import RoomDetailsCard from '../../components/RoomDetailsCard'
import RoomCalendar from '../../components/RoomCalendar'
import BookRoomModal from '../../components/BookRoomModal'

export default function RoomDetails() {
  const { roomId } = useParams()

  const [room, setRoom] = useState<Room | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [isBookModalOpen, setIsBookModalOpen] = useState(false)

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

  if (isLoading) {
    return (
      <div className="container">
        <Header />
        <p>Загрузка переговорной...</p>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="container">
        <Header />
        <p>{error ?? 'Переговорная не найдена'}</p>
      </div>
    )
  }

  return (
    <div className="container">
      <Header />

      <div className="container">
        <nav className="breadcrumbs">
          <Link to="/rooms">Переговорные</Link>
          <span className="breadcrumb-separator">&gt;</span>
          <Link to="/rooms">{room.office.name}</Link>
          <span className="breadcrumb-separator">&gt;</span>
          <span className="breadcrumb-current">Комната '{room.name}'</span>
        </nav>

        <div className="room-details-wrapper">
          <RoomDetailsCard 
            room={room} 
          />

          {room && (
            <RoomCalendar
              roomId={room.id}
              timezone={room.office.timezone}
              onBookClick={() => setIsBookModalOpen(true)}
            />
          )}
        </div>
      </div>

      {room && (
        <BookRoomModal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
          room={room}
          onSuccess={() => {
            loadRoom()
          }}
        />
      )}
    </div>
  )
}