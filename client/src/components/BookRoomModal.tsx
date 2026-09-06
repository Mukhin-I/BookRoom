import React, { useState, useEffect, useRef, forwardRef } from 'react'
import { format, addMinutes } from 'date-fns'
import { ru } from 'date-fns/locale'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { fromZonedTime } from 'date-fns-tz'
import './BookRoomModal.css'
import type { Room } from '../types/api'
import calendarIcon from '../assets/calendar.svg'
import clockIcon from '../assets/clock.svg'

import { createBooking } from '../api/bookings'

registerLocale('ru', ru)

export interface BookingSuccessDetails {
  roomName: string
  dateStr: string
  timeRangeStr: string
}

interface BookRoomModalProps {
  isOpen: boolean
  onClose: () => void
  room: Room
  initialDate?: Date
  initialStartTime?: string
  onSuccess?: (details: BookingSuccessDetails) => void
}

const DURATION_OPTIONS = [
  { label: '15 минут', value: 15 },
  { label: '30 минут', value: 30 },
  { label: '45 минут', value: 45 },
  { label: '1 час', value: 60 },
  { label: '1 ч 15 мин', value: 75 },
  { label: '1 ч 30 мин', value: 90 },
  { label: '1 ч 45 мин', value: 105 },
  { label: '2 часа', value: 120 },
]

const CustomDateInput = forwardRef<
  HTMLButtonElement,
  { value?: string; onClick?: () => void }
>(({ value, onClick }, ref) => (
  <button
    type="button"
    className="modal-date-picker-button"
    onClick={onClick}
    ref={ref}
  >
    <img src={calendarIcon} alt="" />
    <span>{value}</span>
  </button>
))
CustomDateInput.displayName = 'CustomDateInput'

export default function BookRoomModal({
  isOpen,
  onClose,
  room,
  initialDate,
  initialStartTime = '15:00',
  onSuccess,
}: BookRoomModalProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState<Date>(() => initialDate ?? new Date())
  const [startTime, setStartTime] = useState(initialStartTime)
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [comment, setComment] = useState('')
  
  const [isDurationOpen, setIsDurationOpen] = useState(false)
  const durationRef = useRef<HTMLDivElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [hours, minutes] = startTime.split(':').map(Number)
  const startDateTime = new Date(date)
  startDateTime.setHours(hours || 0, minutes || 0, 0, 0)

  const maxEndDateTime = new Date(date)
  maxEndDateTime.setHours(20, 0, 0, 0)

  const endDateTime = addMinutes(startDateTime, durationMinutes)
  const endTimeStr = format(endDateTime, 'HH:mm')
  const isExceedingMaxTime = endDateTime > maxEndDateTime

  const createOfficeDateTime = (
    date: Date,
    time: string,
    timezone: string,
  ) => {
    const [hours, minutes] = time.split(':').map(Number)
    const dateString = format(date, 'yyyy-MM-dd')

    return fromZonedTime(
      `${dateString} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`,
      timezone,
    )
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        durationRef.current &&
        !durationRef.current.contains(event.target as Node)
      ) {
        setIsDurationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isExceedingMaxTime) {
      const validOptions = DURATION_OPTIONS.filter(
        (opt) => addMinutes(startDateTime, opt.value) <= maxEndDateTime
      )
      if (validOptions.length > 0) {
        setDurationMinutes(validOptions[validOptions.length - 1].value)
      }
    }
  }, [startTime, date])

  useEffect(() => {
    if (isOpen) {
      setDate(initialDate ?? new Date())
      setStartTime(initialStartTime)
      setSubmitError(null)
      setIsDurationOpen(false)
    }
  }, [isOpen, initialDate, initialStartTime])

  if (!isOpen) return null

  const formattedDay = format(startDateTime, 'EEEE', { locale: ru })
  const capitalizedDay =
    formattedDay.charAt(0).toUpperCase() + formattedDay.slice(1)
  const formattedDateStr = format(startDateTime, 'd MMMM', { locale: ru })

  const currentDurationOpt =
    DURATION_OPTIONS.find((opt) => opt.value === durationMinutes) || DURATION_OPTIONS[3]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || isExceedingMaxTime) return

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      const officeTimezone = room.office.timezone

      const startsAt = createOfficeDateTime(
        date,
        startTime,
        officeTimezone,
      )

      const endsAt = addMinutes(
        startsAt,
        durationMinutes,
      )

      await createBooking({
        roomId: room.id,
        title: title.trim(),
        comment: comment.trim() || null,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      })

      onSuccess?.({
        roomName: room.name,
        dateStr: formattedDateStr,
        timeRangeStr: `${startTime}-${endTimeStr}`,
      })
      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Не удалось забронировать комнату. Попробуйте снова.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Новое бронирование</h2>
          <p className="modal-subtitle">
            Переговорная: <strong className="room-name-highlight">{room.name}</strong> ({room.office.name}
            {room.floor ? `, ${room.floor} этаж` : ''})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="booking-title">
              Тема встречи <span className="required">*</span>
            </label>
            <input
              id="booking-title"
              type="text"
              className="modal-input"
              placeholder="Ваша тема встречи..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Дата</label>
              <DatePicker
                selected={date}
                onChange={(selectedDate) => {
                  if (selectedDate) {
                    setDate(selectedDate)
                  }
                }}
                locale="ru"
                dateFormat="d MMMM, EEE"
                minDate={new Date()}
                customInput={<CustomDateInput />}
              />
            </div>

            <div className="form-group">
              <label>Время начала</label>
              <div className="input-with-icon">
                <img src={clockIcon} alt="" />
                <input
                  type="time"
                  className="modal-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  min="09:00"
                  max="20:00"
                  step="900"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group" ref={durationRef}>
            <label>Продолжительность</label>
            <div
              className={`modal-select-field pointer ${isDurationOpen ? 'active' : ''}`}
              onClick={() => setIsDurationOpen(!isDurationOpen)}
            >
              <span>
                {currentDurationOpt.label} (до {endTimeStr})
              </span>
              <span className={`chevron ${isDurationOpen ? 'open' : ''}`}>⌄</span>
            </div>

            {isDurationOpen && (
              <div className="dropdown-menu">
                {DURATION_OPTIONS.map((opt) => {
                  const optEndTimeDate = addMinutes(startDateTime, opt.value)
                  const isDisabled = optEndTimeDate > maxEndDateTime
                  const optEndTime = format(optEndTimeDate, 'HH:mm')
                  const isSelected = durationMinutes === opt.value

                  return (
                    <div
                      key={opt.value}
                      className={`dropdown-item ${isSelected ? 'selected' : ''} ${
                        isDisabled ? 'disabled' : ''
                      }`}
                      onClick={() => {
                        if (isDisabled) return
                        setDurationMinutes(opt.value)
                        setIsDurationOpen(false)
                      }}
                    >
                      <span>
                        {opt.label}{' '}
                        <span className="duration-end-time">(до {optEndTime})</span>
                      </span>
                      {isSelected && !isDisabled && <span className="checkmark">✓</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Комментарий</label>
            <textarea
              className="modal-textarea"
              rows={3}
              placeholder="Дополнительная информация для участников встречи..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="info-banner">
            <span className="info-icon">ⓘ</span>
            <span>
              Бронирование на {capitalizedDay}, {formattedDateStr}, {startTime} - {endTimeStr} ({currentDurationOpt.label})
            </span>
          </div>

          {submitError && <div className="modal-error">{submitError}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !title.trim() || isExceedingMaxTime}
            >
              {isSubmitting ? 'Бронирование...' : 'Забронировать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}