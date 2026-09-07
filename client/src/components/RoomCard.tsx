import './RoomCard.css'

import { Link } from 'react-router-dom'
import { useState } from 'react'

import users from '../assets/users.svg'
import clock from '../assets/clock.svg'

import type { Room } from '../types/api'

import BookRoomModal, {
  type BookingSuccessDetails,
} from './BookRoomModal'

interface RoomCardProps {
  room: Room
  onBookingSuccess?: (details: BookingSuccessDetails) => void
}

export default function RoomCard({ room, onBookingSuccess }: RoomCardProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  return (
    <>
      <div className="room-card">
        <h2 className="room-title">
          {room.name}
        </h2>

        <p className="room-floor">
          {room.floor} этаж
        </p>

        <div className="room-details-prev">
          <div className="room-details-prev-item">
            <img src={users} alt="capacity" />

            <p className="details-prev-desc">
              Вместимость: до {room.capacity} человек
            </p>
          </div>

          <div className="room-details-prev-item">
            <img src={clock} alt="time" />

            <p className="details-prev-desc">
              {room.available === false
                ? 'Недоступна'
                : 'Доступна'}
            </p>
          </div>
        </div>

        <div
          className={`room-availability ${
            room.available === false
              ? 'unavailable'
              : 'available'
          }`}
        >
          <span />

          <p className="room-av-text">
            {room.available === false
              ? 'Недоступно на выбранное время'
              : 'Доступно на выбранное время'}
          </p>
        </div>

        <div className="room-buttons">
          <Link
            to={`/rooms/${room.id}`}
            className="goto-room-details"
          >
            Подробнее
          </Link>

          <button
            type="button"
            className={`book-room ${
              room.available === false
                ? 'book-unavailable'
                : ''
            }`}
            disabled={room.available === false}
            onClick={() => setIsBookingModalOpen(true)}
          >
            Забронировать
          </button>
        </div>
      </div>

      <BookRoomModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        room={room}
        onSuccess={(details) => {
          onBookingSuccess?.(details)
        }}
      />
    </>
  )
}