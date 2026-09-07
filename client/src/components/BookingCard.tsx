import './BookingCard.css'
import { useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import doorOpen from '../assets/door-open.svg'
import calIcon from '../assets/cal-icon.svg'
import calendar from '../assets/calendar.svg'

import type { Booking } from '../types/api'
import { cancelBooking } from '../api/bookings'

interface BookingCardProps {
  booking: Booking
  onCancelled: () => void
}

export default function BookingCard({ 
    booking,
    onCancelled
  }: BookingCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const startDate = new Date(booking.startsAt)
  const endDate = new Date(booking.endsAt)

  const month = format(startDate, 'LLLL', { locale: ru })
  const day = format(startDate, 'd')
  const startTime = format(startDate, 'HH:mm')
  const endTime = format(endDate, 'HH:mm')

  const fullDateStr = format(startDate, 'EEEE, d MMMM', { locale: ru })
  const modalDate = fullDateStr.charAt(0).toUpperCase() + fullDateStr.slice(1)

  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)


  const handleCancelBooking = async () => {
    try {
        setIsCancelling(true)
        setCancelError(null)

        await cancelBooking(booking.id)

        setIsModalOpen(false)
        onCancelled()
    } catch {
        setCancelError('Не удалось отменить бронирование. Попробуйте снова.')
    } finally {
        setIsCancelling(false)
    }
  }

  return (
    <>
      <div className="booking-card">
        <div className="booking-card-left">
          <div className="booking-date-badge">
            <p className="booking-month">{month}</p>
            <span className="booking-day">{day}</span>
          </div>

          <div className="booking-card-info">
            <h2 className="booking-title">{booking.title}</h2>

            <div className="booking-bottom-info">
              <div className="booking-office">
                <img src={doorOpen} alt="room" />
                <p className="booking-office-title">{booking.room.name}</p>
              </div>

              <span className="booking-bottom-sep" />
              <p className="booking-bottom-rest">{booking.room.floor} этаж</p>

              <span className="booking-bottom-sep" />
              <p className="booking-bottom-rest">
                {startTime} - {endTime}
              </p>
            </div>
          </div>
        </div>

        <button className="cancel-booking" onClick={() => setIsModalOpen(true)}>
          Отменить
        </button>
      </div>

      {/* модальное окно */}
      {isModalOpen && (
        <div
            className="modal-overlay"
            onClick={() => {
                if (!isCancelling) {
                setIsModalOpen(false)
                }
            }}
        >
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Отменить бронирование?</h2>
            <p className="modal-desc">
              Это действие нельзя будет отменить. Освободившееся время станет доступно другим сотрудникам.
            </p>

            <div className="modal-booking-info">
              <h3 className="modal-booking-title">{booking.title}</h3>
              
              <div className="modal-info-row">
                <img src={doorOpen} alt="room" />
                <span>Комната "{booking.room.name}", {booking.room.floor} этаж</span>
              </div>
              
              <div className="modal-info-row">
                <img src={calendar} alt="calendar" />
                <span>{modalDate}, {startTime} - {endTime}</span>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="modal-btn-cancel" 
                onClick={() => setIsModalOpen(false)}
                disabled={isCancelling}
              >
                Нет, оставить
              </button>
              <button
                className="modal-btn-confirm"
                onClick={handleCancelBooking}
                disabled={isCancelling}
                >
                {isCancelling ? 'Отмена...' : 'Да, отменить'}
              </button>
            </div>

            {cancelError && (
                <p className="cancel-error">
                    {cancelError}
                </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}