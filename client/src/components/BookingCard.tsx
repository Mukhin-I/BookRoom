import './BookingCard.css'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import doorOpen from '../assets/door-open.svg'

import type { Booking } from '../types/api'

interface BookingCardProps {
  booking: Booking
}

export default function BookingCard({
  booking,
}: BookingCardProps) {
  const startDate = new Date(booking.startsAt)
  const endDate = new Date(booking.endsAt)

  const month = format(startDate, 'LLLL', {
    locale: ru,
  })

  const day = format(startDate, 'd')

  const startTime = format(startDate, 'HH:mm')
  const endTime = format(endDate, 'HH:mm')

  return (
    <div className="booking-card">
      <div className="booking-card-left">
        <div className="booking-date-badge">
          <p className="booking-month">
            {month}
          </p>

          <span className="booking-day">
            {day}
          </span>
        </div>

        <div className="booking-card-info">
          <h2 className="booking-title">
            {booking.title}
          </h2>

          <div className="booking-bottom-info">
            <div className="booking-office">
              <img src={doorOpen} alt="room" />

              <p className="booking-office-title">
                {booking.room.name}
              </p>
            </div>

            <span className="booking-bottom-sep" />

            <p className="booking-bottom-rest">
              {booking.room.floor} этаж
            </p>

            <span className="booking-bottom-sep" />

            <p className="booking-bottom-rest">
              {startTime} - {endTime}
            </p>
          </div>
        </div>
      </div>

      <button className="cancel-booking">
        Отменить
      </button>
    </div>
  )
}