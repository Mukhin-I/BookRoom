import React, { useState, useEffect, useRef } from 'react';
import './Rooms.css';
import Header from '../../components/Header';
import calendar from '../../assets/calendar.svg';
import users from '../../assets/users.svg';
import clock from '../../assets/clock.svg';
import RoomCard from '../../components/RoomCard';

export default function Rooms() {
  // 1. ДОБАВЛЕНО: Состояние для времени старта (по умолчанию можно поставить 15:00 как на макете)
  const [startTime, setStartTime] = useState('15:00');

  const [isDurationOpen, setIsDurationOpen] = useState(false);
  const [duration, setDuration] = useState('1 час');
  const durationOptions = ['15 мин', '30 мин', '45 мин', '1 час', '1 ч 15 мин', '1 ч 30 мин', '1 ч 45 мин', '2 часа'];

  const [isCapacityOpen, setIsCapacityOpen] = useState(false);
  const [capacity, setCapacity] = useState('4 чел.');
  const capacityOptions = ['2 чел.', '4 чел.', '6 чел.', '8 чел.', '10 чел.', '12 чел.'];

  const durationRef = useRef(null);
  const capacityRef = useRef(null);

  const validateDuration = (startTime: string, durationStr: string): boolean => {
    // Если время еще не введено полностью, разрешаем все опции (возвращаем true)
    if (!startTime || !startTime.includes(':') || startTime.length < 5) return true;

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    
    if (isNaN(startHours) || isNaN(startMinutes)) return true;

    const startTotalMinutes = startHours * 60 + startMinutes;

    let durationMinutes = 0;

    const hoursMatch = durationStr.match(/(\d+)\s*(ч|час)/);
    if (hoursMatch) {
        durationMinutes += parseInt(hoursMatch[1], 10) * 60;
    }

    const minutesMatch = durationStr.match(/(\d+)\s*м/);
    if (minutesMatch) {
        durationMinutes += parseInt(minutesMatch[1], 10);
    }

    const endTotalMinutes = startTotalMinutes + durationMinutes;
    const limitTotalMinutes = 20 * 60; // 20:00

    return endTotalMinutes <= limitTotalMinutes;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (durationRef.current && !durationRef.current.contains(event.target)) setIsDurationOpen(false);
      if (capacityRef.current && !capacityRef.current.contains(event.target)) setIsCapacityOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="container">
        <Header />
        <div className="container">
          <div className="office-area-wrapper">
            <div className="office-selector">
              <h2>Офис Москва</h2>
            </div>
            <div className="office-address">
              <h4>ул. Лесная 7</h4>
              <span></span>
              <h4>Местное время: 14:35 MSK</h4>
            </div>
          </div>

          <div className="date-selector">
            <div className="date-selector-item">
              <h5>Дата</h5>
              <div className="date-selector-field">
                <img src={calendar} alt="calendar" />
                <p>24 Октября, Чт</p>
              </div>
            </div>

            <div className="date-selector-item">
              <h5>Время начала</h5>
              <div className="date-selector-field">
                <img src={clock} alt="clock" />
                <input 
                  type="text" 
                  placeholder="--:--" 
                  className="time-input" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  maxLength={5}
                /> 
              </div>
            </div>

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
                        onClick={() => { 
                          if (isValid) {
                            setDuration(opt); 
                            setIsDurationOpen(false); 
                          }
                        }}
                        
                        style={{ 
                          opacity: isValid ? 1 : 0.4, 
                          cursor: isValid ? 'pointer' : 'not-allowed' 
                        }}
                      >
                        {opt}
                        {duration === opt && <span className="checkmark">✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

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

          <section className="available-rooms">
            <h1 className="av-rooms-title">Доступные переговорные в этом офисе</h1>
            <div className="rooms">
              <RoomCard />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}