import React, { useState, useEffect, useRef, forwardRef } from 'react';
import './Rooms.css';
import Header from '../../components/Header';
import calendarIcon from '../../assets/calendar.svg';
import users from '../../assets/users.svg';
import clock from '../../assets/clock.svg';
import alert from '../../assets/alert-triangle.svg';
import searchX from '../../assets/search-x.svg';
import building from '../../assets/building.svg';
import RoomCard from '../../components/RoomCard';
import RoomCardSkeleton from '../../components/RoomCardSkeleton';
import ToastNotification from '../../components/ToastNotification'
import PageTitle from '../../components/PageTitle'

import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ru } from 'date-fns/locale';
import { addDays, format } from 'date-fns';

import type { Office, Room } from '../../types/api'
import { getOffices } from '../../api/offices'
import { getRooms } from '../../api/rooms'

import { useSearchParams } from 'react-router-dom'

registerLocale('ru', ru);

const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <div className="date-selector-field pointer" onClick={onClick} ref={ref}>
    <img src={calendarIcon} alt="calendar" />
    <p className="capitalize-first">{value}</p>
  </div>
));

export default function Rooms() {
  const [startTime, setStartTime] = useState('15:00');
  
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isDurationOpen, setIsDurationOpen] = useState(false);
  const [duration, setDuration] = useState('1 час');
  const durationOptions = ['15 мин', '30 мин', '45 мин', '1 час', '1 ч 15 мин', '1 ч 30 мин', '1 ч 45 мин', '2 часа'];

  const [isCapacityOpen, setIsCapacityOpen] = useState(false);
  const [capacity, setCapacity] = useState('4 чел.');
  const capacityOptions = ['2 чел.', '4 чел.', '6 чел.', '8 чел.', '10 чел.', '12 чел.'];

  const durationRef = useRef(null);
  const capacityRef = useRef(null);

  const [isOfficeOpen, setIsOfficeOpen] = useState(false)
  const officeRef = useRef<HTMLDivElement>(null)

  const [toast, setToast] = useState<{
    title: string
    message: string
  } | null>(null)

  const [searchParams] = useSearchParams()
  const officeIdFromUrl = searchParams.get('officeId')

  const validateDuration = (startTime: string, durationStr: string): boolean => {
    if (!startTime || !startTime.includes(':') || startTime.length < 5) return true;
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    if (isNaN(startHours) || isNaN(startMinutes)) return true;
    const startTotalMinutes = startHours * 60 + startMinutes;
    let durationMinutes = 0;
    const hoursMatch = durationStr.match(/(\d+)\s*(ч|час)/);
    if (hoursMatch) durationMinutes += parseInt(hoursMatch[1], 10) * 60;
    const minutesMatch = durationStr.match(/(\d+)\s*м/);
    if (minutesMatch) durationMinutes += parseInt(minutesMatch[1], 10);
    return (startTotalMinutes + durationMinutes) <= 20 * 60;
  };

  const getBookingInterval = () => {
    const [hours, minutes] = startTime.split(':').map(Number)

    const from = new Date(selectedDate)

    from.setHours(hours, minutes, 0, 0)

    const durationMinutes = getDurationMinutes(duration)

    const to = new Date(from)
    to.setMinutes(to.getMinutes() + durationMinutes)

    return {
      from: from.toISOString(),
      to: to.toISOString(),
    }
  }


  // дропдауны
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      if (
        durationRef.current &&
        !durationRef.current.contains(target)
      ) {
        setIsDurationOpen(false)
      }

      if (
        capacityRef.current &&
        !capacityRef.current.contains(target)
      ) {
        setIsCapacityOpen(false)
      }

      if (
        officeRef.current &&
        !officeRef.current.contains(target)
      ) {
        setIsOfficeOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])


//   api
    const [offices, setOffices] = useState<Office[]>([])
    const [selectedOffice, setSelectedOffice] = useState<Office | null>(null)

    const [rooms, setRooms] = useState<Room[]>([])

    const [isLoadingOffices, setIsLoadingOffices] = useState(true)
    const [isLoadingRooms, setIsLoadingRooms] = useState(false)

    const [error, setError] = useState<string | null>(null)

    const loadOffices = async () => {
      try {
        setIsLoadingOffices(true)
        setError(null)

        const data = await getOffices()

        setOffices(data)
        
        if (officeIdFromUrl) {
          const office = data.find(
            (office) => office.id === officeIdFromUrl,
          )

          if (office) {
            setSelectedOffice(office)
          }
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

    const isValidTime = (time: string) => {
      const match = /^([01]\d|20):([0-5]\d)$/.exec(time)

      if (!match) {
        return false
      }

      const [hours, minutes] = time.split(':').map(Number)

      if (minutes % 15 !== 0) {
        return false
      }

      return hours >= 9 && hours < 20
    }

  const resetFilters = () => {
    setSelectedDate(new Date())
    setStartTime('15:00')
    setDuration('1 час')
    setCapacity('4 чел.')
  }


  const loadRooms = async () => {
    if (!selectedOffice) {
      return
    }

    if (!isValidTime(startTime)) {
      return
    }

    try {
      setIsLoadingRooms(true)
      setError(null)

      const { from, to } = getBookingInterval()

      const data = await getRooms({
        officeId: selectedOffice.id,
        minCapacity: getCapacityNumber(capacity),
        from,
        to,
      })

      setRooms(data)
    } catch {
      setError('Не удалось загрузить переговорные')
    } finally {
      setIsLoadingRooms(false)
    }
  }


  useEffect(() => {
    loadRooms()
  }, [
    selectedOffice,
    selectedDate,
    startTime,
    duration,
    capacity,
  ])

  const getDurationMinutes = (duration: string): number => {
    const durationMap: Record<string, number> = {
      '15 мин': 15,
      '30 мин': 30,
      '45 мин': 45,
      '1 час': 60,
      '1 ч 15 мин': 75,
      '1 ч 30 мин': 90,
      '1 ч 45 мин': 105,
      '2 часа': 120,
    }

    return durationMap[duration]
  }

  const getCapacityNumber = (capacity: string): number => {
    return Number.parseInt(capacity, 10)
  }


  return (
    <>
      <PageTitle title="Переговорные" />

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
          <div className="office-area-wrapper">
            <div className="office-selector" ref={officeRef}>
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
                      className={`dropdown-item office-dropdown-item ${
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
            <div className="office-address">
              <h4>
                {selectedOffice?.address ?? 'Адрес не выбран'}
              </h4>
              <span></span>
              <h4>
                Местное время: {selectedOffice ? selectedOffice.timezone : '--:--'}
              </h4>
            </div>
          </div>

          <div className="date-selector">
            
            {/* дата с календарем */}
            <div className="date-selector-item date-picker-container">
              <h5>Дата</h5>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                locale="ru"
                dateFormat="d MMMM, EE"
                minDate={new Date()} 
                maxDate={addDays(new Date(), 30)}
                customInput={<CustomDateInput />}
                renderCustomHeader={({
                  date,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
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
                {/* Текст под календарем */}
                <div className="calendar-footer-text">
                  Ограничение: не более 30 дней вперёд.
                </div>
              </DatePicker>
            </div>
                
                {/* начало брони */}
            <div className="date-selector-item">
              <h5>Время начала</h5>
              <div className="date-selector-field">
                <img src={clock} alt="clock" />
                <input 
                  type="time" 
                  placeholder="--:--" 
                  className="time-input" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  maxLength={5}
                /> 
              </div>
            </div>

                {/* длительность */}
            <div className="date-selector-item" ref={durationRef}>
              <h5>Длительность</h5>
              <div 
                className={`date-selector-field pointer ${isDurationOpen ? 'active' : ''}`} 
                onClick={() => setIsDurationOpen(!isDurationOpen)}
              >
                <p>{duration}</p>
                <span className="chevron">⌄</span>
              </div>
              {isDurationOpen && (
                <div className="dropdown-menu">
                  {durationOptions.map((opt) => {
                    const isValid = validateDuration(startTime, opt);
                    return (
                      <div 
                        key={opt} 
                        className={`dropdown-item ${duration === opt ? 'selected' : ''} ${!isValid ? 'disabled' : ''}`}
                        onClick={() => { if (isValid) { setDuration(opt); setIsDurationOpen(false); } }}
                        style={{ opacity: isValid ? 1 : 0.4, cursor: isValid ? 'pointer' : 'not-allowed' }}
                      >
                        {opt}
                        {duration === opt && <span className="checkmark">✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Вместимость */}
            <div className="date-selector-item" ref={capacityRef}>
              <h5>Вместимость</h5>
              <div 
                className={`date-selector-field pointer ${isCapacityOpen ? 'active' : ''}`} 
                onClick={() => setIsCapacityOpen(!isCapacityOpen)}
              >
                <img src={users} alt="users" />
                <p>Мин. {capacity}</p>
                <span className="chevron">⌄</span>
              </div>
              {isCapacityOpen && (
                <div className="dropdown-menu">
                  {capacityOptions.map((opt) => (
                    <div 
                      key={opt} 
                      className={`dropdown-item ${capacity === opt ? 'selected' : ''}`}
                      onClick={() => { setCapacity(opt); setIsCapacityOpen(false); }}
                    >
                      {opt}
                      {capacity === opt && <span className="checkmark">✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        
              {/* карточки переговорок */}
          <section className="available-rooms">
            { selectedOffice && !error && (
              <h1 className="av-rooms-title">
                {isLoadingRooms ? 'Загрузка переговорных...' : 'Доступные переговорные в этом офисе'}
              </h1>
            )}
            <div className="rooms">
                {(isLoadingRooms || isLoadingOffices) && (
                  [...Array(4)].map((_, index) => (
                    <RoomCardSkeleton key={index} />
                  ))
                )}

                {!error && !selectedOffice && (
                  <>
                    <div className="error-banner">
                      <div className="alert-triangle no-office">
                        <img src={building} alt="no office" />
                      </div>
                      <h3 className="error-title">Выберите офис</h3>
                      <p className="error-desc">Для просмотра доступных переговорных сначала выберите офис из списка выше</p>
                    </div>
                  </>
                )}

                {error && (
                    <div className="error-banner">
                      <div className="alert-triangle">
                        <img src={alert} alt="error" />
                      </div>
                      <h3 className="error-title">{error}</h3>
                      <p className="error-desc">Произошла ошибка при загрузке списка переговорных</p>
                      <button className="reload-rooms" onClick={loadOffices}>Попробовать снова</button>
                    </div>
                )}

                {selectedOffice &&
                !isLoadingRooms && 
                !isLoadingOffices &&
                    !error &&
                    rooms.length === 0 && (
                        <div className="error-banner">
                          <div className="alert-triangle not-found-triangle">
                            <img src={searchX} alt="no results found" />
                          </div>
                          <h3 className="error-title">Нет доступных переговорных</h3>
                          <p className="error-desc">Попробуйте изменить параметры фильтрации или выбрать другой офис</p>
                          <button className="reload-rooms" onClick={resetFilters}>Сбросить фильтры</button>
                        </div>
                )}

                {!isLoadingRooms &&
                    !error &&
                    rooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onBookingSuccess={({ roomName, dateStr, timeRangeStr }) => {
                        loadRooms()

                        setToast({
                          title: 'Бронирование создано',
                          message: `Комната ${roomName}, ${dateStr}, ${timeRangeStr}`,
                        })
                      }}
                    />
                    ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}