import './Bookings.css'
import type { Office, Booking } from '../../types/api'
import { getBookings } from '../../api/bookings'

import Header from '../../components/Header'
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { getOffices } from '../../api/offices'

import calendar from '../../assets/calendar.svg'
import calIcon from '../../assets/cal-icon.svg'
import alert from '../../assets/alert-triangle.svg'

import BookingCard from '../../components/BookingCard'
import PageTitle from '../../components/PageTitle'

import DatePicker from 'react-datepicker'
import { registerLocale } from 'react-datepicker'
import { ru } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import { format } from 'date-fns'

registerLocale('ru', ru)

const BookingCardSkeleton = () => (
  <div className="booking-card skeleton-card-wrapper">
    <div className="booking-card-left">
      <div className="booking-date-badge skeleton-badge-bg">
        <div className="skeleton skeleton-badge-month"></div>
        <div className="skeleton skeleton-badge-day"></div>
      </div>
      
      <div className="booking-card-info">
        <div className="skeleton skeleton-title-line"></div>
        
        <div className="booking-bottom-info">
          <div className="skeleton skeleton-info-segment"></div>
          <span className="booking-bottom-sep" />
          <div className="skeleton skeleton-info-segment"></div>
          <span className="booking-bottom-sep" />
          <div className="skeleton skeleton-info-segment" style={{ width: '90px' }}></div>
        </div>
      </div>
    </div>
    <div className="skeleton skeleton-cancel-btn"></div>
  </div>
);

export default function Bookings() {
    const [offices, setOffices] = useState<Office[]>([])
    const [selectedOffice, setSelectedOffice] = useState<Office | null>(null)

    const [isLoadingOffices, setIsLoadingOffices] = useState(true)
    const [isLoadingRooms, setIsLoadingRooms] = useState(false)

    const [error, setError] = useState<string | null>(null)
    const [isOfficeOpen, setIsOfficeOpen] = useState(false)
    const officeRef = useRef<HTMLDivElement>(null)

    const [bookings, setBookings] = useState<Booking[]>([])
    const [isLoadingBookings, setIsLoadingBookings] = useState(false)
    const [bookingError, setBookingError] = useState<string | null>(null)

    const [activeScope, setActiveScope] = useState<'upcoming' | 'past'>(
      'upcoming',
    )

    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const calendarRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node

        if (
          officeRef.current &&
          !officeRef.current.contains(target)
        ) {
          setIsOfficeOpen(false)
        }

        if (
          calendarRef.current &&
          !calendarRef.current.contains(target)
        ) {
          setIsCalendarOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [])

    const loadOffices = async () => {
      try {
        setIsLoadingOffices(true)
        setError(null)

        const data = await getOffices()

        setOffices(data)

        if (data.length > 0) {
          setSelectedOffice(data[0])
        }
      } catch {
        setError('Не удалось загрузить офисы')
      } finally {
        setIsLoadingOffices(false)
      }
    }


    useEffect(() => {
        loadOffices()
    }, [])

    const loadBookings = async () => {
      try {
        setIsLoadingBookings(true)
        setBookingError(null)

        const data = await getBookings({
          scope: activeScope,
          ...(selectedOffice
            ? { officeId: selectedOffice.id }
            : {}),
        })

        setBookings(data)
      } catch {
        setBookingError('Не удалось загрузить бронирования')
      } finally {
        setIsLoadingBookings(false)
      }
    }

    useEffect(() => {
      loadBookings()
    }, [selectedOffice, activeScope])

    const filteredBookings = bookings.filter((booking) => {
      if (!startDate || !endDate) {
        return true
      }

      const bookingStart = new Date(booking.startsAt)

      const normalizedEndDate = new Date(endDate)
      normalizedEndDate.setHours(23, 59, 59, 999)

      return (
        bookingStart >= startDate &&
        bookingStart <= normalizedEndDate
      )
    })

  return(
    <>
      <PageTitle title="Мои бронирования" />

      <Header initialSelected='bookings' />
      <section className="my-bookings">
        <div className="container">
          <div className="bookings-header">
            <h3 className="bookings-sec-title">Мои бронирования</h3>
            <div className="bookings-header-btns">

              <div className="office-selector bookings-office-selector" ref={officeRef}>
                <button
                  type="button"
                  className="office-selector-button"
                  onClick={() => setIsOfficeOpen(!isOfficeOpen)}
                  disabled={isLoadingOffices}
                >
                  <h2>
                    {isLoadingOffices
                      ? 'Загрузка...'
                      : selectedOffice?.name ?? 'Выберите офис'}
                  </h2>
                  <span className={`office-chevron ${isOfficeOpen ? 'open' : ''}`}>
                    V
                  </span>
                </button>

                {isOfficeOpen && (
                  <div className="dropdown-menu">
                    {offices.map((office) => (
                      <button
                        key={office.id}
                        type="button"
                        className={`dropdown-item office-dropdown-item${
                          selectedOffice?.id === office.id ? 'selected' : ''
                        }`}
                        onClick={() => {
                          setSelectedOffice(office)
                          setIsOfficeOpen(false)
                        }}
                      >
                        <div className="office-dropdown-header">
                          <strong>{office.name}</strong>
                          {selectedOffice?.id === office.id && <span className="checkmark">✓</span>}
                        </div>
                        <span className="office-dropdown-address">{office.address}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="bookings-calendar-wrapper"
                ref={calendarRef}
              >
                <button
                  type="button"
                  className="bookings-calendar"
                  onClick={() => setIsCalendarOpen((prev) => !prev)}
                >
                  <img src={calendar} alt="" />

                  <p>
                    {startDate && endDate
                      ? `${format(startDate, 'd MMMM yyyy', { locale: ru })} — ${format(
                          endDate,
                          'd MMMM yyyy',
                          { locale: ru },
                        )}`
                      : 'За все время'}
                  </p>
                </button>

                {isCalendarOpen && (
                  <div className="bookings-calendar-dropdown">
                    <DatePicker
                      selectsRange
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(dates) => {
                        const [start, end] = dates

                        setStartDate(start)
                        setEndDate(end)

                        if (start && end) {
                          setIsCalendarOpen(false)
                        }
                      }}
                      inline
                      locale="ru"
                    />

                    {(startDate || endDate) && (
                      <button
                        type="button"
                        className="clear-period-button"
                        onClick={() => {
                          setStartDate(null)
                          setEndDate(null)
                          setIsCalendarOpen(false)
                        }}
                      >
                        Сбросить период
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="bookings-tabs">
            <ul className="book-tabs">
              <li
                className={activeScope === 'upcoming' ? 'selected' : ''}
                onClick={() => setActiveScope('upcoming')}
              >
                Предстоящие
                {activeScope === 'upcoming' && ` (${filteredBookings.length})`}
              </li>

              <li
                className={activeScope === 'past' ? 'selected' : ''}
                onClick={() => setActiveScope('past')}
              >
                Прошедшие
              </li>
            </ul>
          </div>
          <div className="bookings-list">
            {(isLoadingBookings || isLoadingOffices) && (
              <>
                 <BookingCardSkeleton />
                 <BookingCardSkeleton />
               </>
            )}

            {bookingError && (
              <div className="bookings-error-banner">
                  <div className="bookings-error-icon alert-icon">
                      <img src={alert} alt="error" />
                  </div>
                  <h2 className="bookings-error-title">{bookingError}</h2>
                    <p className="bookings-error-desc">
                        Произошла ошибка при загрузке ваших бронирований
                    </p>
                    <button onClick={loadBookings} className="backto-rooms">
                        Попробовать снова
                    </button>
              </div>
            )}

            {!isLoadingBookings &&
              !bookingError &&
              filteredBookings.length === 0 && (
                <div className="bookings-error-banner">
                  <div className="bookings-error-icon">
                      <img src={calIcon} alt="calendar" />
                  </div>
                  <h2 className="bookings-error-title">Нет бронирований</h2>
                    <p className="bookings-error-desc">
                      {activeScope === 'upcoming'
                        ? 'У вас пока нет предстоящих бронирований'
                        : 'У вас пока нет прошедших бронирований'}
                        <br />
                        Перейдите в раздел переговорных, чтобы забронировать комнату.
                    </p>
                    <Link to={'/'} className="backto-rooms">
                        Перейти к переговорным
                    </Link>
                </div>
                
              )}

            {!isLoadingBookings &&
              !bookingError &&
              filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancelled={loadBookings}
                />
              ))}
          </div>
        </div>  
      </section>
    </>
  );
}