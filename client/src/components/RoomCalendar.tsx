import React, { useState, useEffect, forwardRef } from 'react';
import './RoomCalendar.css';
import DatePicker, { registerLocale } from 'react-datepicker';
import alert from '../assets/alert-triangle.svg';
import 'react-datepicker/dist/react-datepicker.css';
import { ru } from 'date-fns/locale';
import { addDays, format } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

import { useCurrentUser } from '../context/CurrentUserContext'
import type { Booking } from '../types/api'
import { getRoomBookings } from '../api/rooms'

registerLocale('ru', ru);

const CustomDateInput = forwardRef(({ value, onClick }: any, ref: any) => (
  <button className="date-picker-btn" onClick={onClick} ref={ref} type="button">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.6667 2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V13.3333C2 14.0697 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0697 14 13.3333V4C14 3.26362 13.403 2.66667 12.6667 2.66667Z" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.6667 1.33333V4" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.33333 1.33333V4" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 6.66667H14" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    Выбрать дату
  </button>
));

interface RoomCalendarProps {
  roomId?: string
  timezone: string
  onBookClick: () => void
  isLoadingRoom: boolean
}

export default function RoomCalendar({
    roomId,
    timezone,
    onBookClick,
    isLoadingRoom
}: RoomCalendarProps) {
    const { currentUser } = useCurrentUser()
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [bookings, setBookings] = useState<Booking[]>([])
    const [isLoadingBookings, setIsLoadingBookings] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const formattedDate = new Intl.DateTimeFormat(
        'ru-RU',
        {
            timeZone: timezone,
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        },
    ).format(selectedDate)

    const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    const hours = Array.from({ length: 12 }, (_, i) => i + 9);

    const getDayInterval = () => {
        const date = format(selectedDate, 'yyyy-MM-dd')
        const from = fromZonedTime(`${date} 00:00:00`, timezone)
        const to = fromZonedTime(`${date} 23:59:59.999`, timezone)
        return { from: from.toISOString(), to: to.toISOString() }
    }

    const loadBookings = async () => {
        if (!roomId || isLoadingRoom) return;
        try {
            setIsLoadingBookings(true)
            setError(null)
            const { from, to } = getDayInterval()
            const data = await getRoomBookings(roomId, from, to)
            setBookings(data)
        } catch {
            setError('Не удалось загрузить расписание')
        } finally {
            setIsLoadingBookings(false)
        }
    }

    useEffect(() => {
        loadBookings()
    }, [roomId, selectedDate, isLoadingRoom])

    if (isLoadingRoom) {
      return (
        <div className="room-calendar-wrapper">
          <div className="calendar-header">
              <div className="calendar-date-title" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="skeleton" style={{ width: '140px', height: '20px', borderRadius: '4px' }} />
                  <div className="skeleton" style={{ width: '180px', height: '14px', borderRadius: '4px' }} />
              </div>
              <div className="skeleton" style={{ width: '120px', height: '36px', borderRadius: '8px' }} />
          </div>

          <div className="timeline-container">
              <div className="timeline-grid">
                  {hours.map((hour) => (
                    <div key={hour} className="timeline-row">
                        <span className="time-label">{hour < 10 ? `0${hour}:00` : `${hour}:00`}</span>
                        <div className="time-line" />
                    </div>
                  ))}
              </div>
          </div>

          <div className="calendar-footer">
              <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: '8px' }} />
          </div>
        </div>
      );
    }

    return (
        <div className="room-calendar-wrapper">
            <div className="calendar-header">
                <div className="calendar-date-title">
                    {!error && !isLoadingBookings && ( 
                        <h3 className="calendar-title">Расписание на день</h3>
                    )}
                    <p className="current-date">{displayDate}</p>
                </div>
                
                <div className="date-selector details-date-selector">
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date | null) => date && setSelectedDate(date)}
                        locale="ru"
                        dateFormat="d MMMM, EE"
                        minDate={new Date()} 
                        maxDate={addDays(new Date(), 30)}
                        customInput={<CustomDateInput />}
                        renderCustomHeader={({
                            date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled
                        }) => (
                            <div className="custom-calendar-header">
                                <span className="calendar-month-year">
                                    {format(date, 'LLLL yyyy', { locale: ru })}
                                </span>
                                <div className="calendar-arrows">
                                    <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} type="button">
                                        <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 13L1 7L7 1" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </button>
                                    <button onClick={increaseMonth} disabled={nextMonthButtonDisabled} type="button">
                                        <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 13L7 7L1 1" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    >
                        <div className="calendar-footer-text">
                            Ограничение: не более 30 дней вперёд.
                        </div>
                    </DatePicker>
                </div>
            </div>

           <div className="timeline-container">
                <div className="timeline-grid">
                    {hours.map((hour) => (
                    <div key={hour} className="timeline-row">
                        <span className="time-label">
                        {hour < 10 ? `0${hour}:00` : `${hour}:00`}
                        </span>
                        <div className="time-line" />
                    </div>
                    ))}
                </div>

                <div className="events-layer">
                    {isLoadingBookings && (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="skeleton" style={{ width: '80%', height: '40px', borderRadius: '6px' }} />
                        </div>
                    )}

                    {error && (
                        <div className="error-banner">
                            <div className="alert-triangle">
                                <img src={alert} alt="error" />
                            </div>
                            <h3 className="error-title">{error}</h3>
                            <p className="error-desc">Произошла ошибка при загрузке расписания переговорной</p>
                            <button className="reload-rooms" onClick={loadBookings}>Попробовать снова</button>
                        </div>
                    )}

                    {!isLoadingBookings &&
                        !error &&
                        bookings.map((booking) => {
                            const start = new Date(booking.startsAt)
                            const end = new Date(booking.endsAt)

                            const startMinutes =
                            start.getHours() * 60 + start.getMinutes()

                            const endMinutes =
                            end.getHours() * 60 + end.getMinutes()

                            const topPosition =
                            startMinutes - 9 * 60

                            const eventHeight =
                            endMinutes - startMinutes

                            const isMyBooking =
                            booking.userId === currentUser?.id

                            return (
                            <div
                                key={booking.id}
                                className={`event-card ${
                                isMyBooking
                                    ? 'event-active'
                                    : 'event-disabled'
                                }`}
                                style={{
                                top: `${topPosition}px`,
                                height: `${eventHeight}px`,
                                }}
                            >
                                {isMyBooking
                                ? booking.title
                                : 'Занято'}
                            </div>
                            )
                        })}
                </div>
            </div>

            <div className="calendar-footer">
                <button className="book-btn" onClick={onBookClick}>Забронировать комнату</button>
            </div>
        </div>
    );
}