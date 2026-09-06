import React, { useState, useEffect, forwardRef } from 'react'
import { format, addMinutes } from 'date-fns'
import { ru } from 'date-fns/locale'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './BookRoomModal.css'
import type { Room } from '../types/api'
import calendarIcon from '../assets/calendar.svg'
import clockIcon from '../assets/clock.svg'

registerLocale('ru', ru)

interface BookRoomModalProps {
  isOpen: boolean
  onClose: () => void
  room: Room
  initialDate?: Date
  initialStartTime?: string
  onSuccess?: () => void
}

const DURATION_OPTIONS = [
  { label: '15 минут', value: 15 },
  { label: '30 минут', value: 30 },
  { label: '45 минут', value: 45 },
  { label: '1 час', value: 60 },
  { label: '1 ч 30 мин', value: 90 },
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

    <span>
      {value}
    </span>
  </button>
))

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
        setDate(initialDate ?? new Date())
        setStartTime(initialStartTime)
        setSubmitError(null)
    }
}, [isOpen, initialDate, initialStartTime])

  if (!isOpen) return null

  // расчет времени окончания
  const [hours, minutes] = startTime.split(':').map(Number)
  const startDateTime = new Date(date)
  startDateTime.setHours(hours || 0, minutes || 0, 0, 0)
  
  const endDateTime = addMinutes(startDateTime, durationMinutes)
  const endTimeStr = format(endDateTime, 'HH:mm')

  // форматирование даты для плашки с подтверждением
  const formattedDay = format(startDateTime, 'EEEE', { locale: ru })
  const capitalizedDay = formattedDay.charAt(0).toUpperCase() + formattedDay.slice(1)
  const formattedDateStr = format(startDateTime, 'd MMMM', { locale: ru })

  const durationLabel = DURATION_OPTIONS.find((opt) => opt.value === durationMinutes)?.label || `${durationMinutes} мин`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      // TODO: Вызов вашего API функции бронирования
      // await createBooking({
      //   roomId: room.id,
      //   title,
      //   from: startDateTime.toISOString(),
      //   to: endDateTime.toISOString(),
      //   comment,
      // })

      onSuccess?.()
      onClose()
    } catch {
      setSubmitError('Не удалось забронировать комнату. Попробуйте снова.')
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
          {/* тема */}
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

          {/* дата и время начала */}
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

          {/* продолжительность */}
          <div className="form-group">
            <label>Продолжительность</label>
            <div className="select-wrapper">
              <select
                className="modal-select"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} (до {format(addMinutes(startDateTime, opt.value), 'HH:mm')})
                  </option>
                ))}
              </select>
              <span className="select-chevron">⌄</span>
            </div>
          </div>

          {/* комментарий */}
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

          {/* информационная плашка */}
          <div className="info-banner">
            <span className="info-icon">ⓘ</span>
            <span>
              Бронирование на {capitalizedDay}, {formattedDateStr}, {startTime} - {endTimeStr} ({durationLabel})
            </span>
          </div>

          {submitError && <div className="modal-error">{submitError}</div>}

          {/* кнопки */}
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
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? 'Бронирование...' : 'Забронировать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}