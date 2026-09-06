import './Bookings.css'
import Header from '../../components/Header'
import React, { useState, useEffect, useRef } from 'react';

import type { Office } from '../../types/api'
import { getOffices } from '../../api/offices'

import calendar from '../../assets/calendar.svg'

import BookingCard from '../../components/BookingCard'
import { Book } from 'lucide-react';

export default function Bookings() {
  const [offices, setOffices] = useState<Office[]>([])
    const [selectedOffice, setSelectedOffice] = useState<Office | null>(null)

    const [isLoadingOffices, setIsLoadingOffices] = useState(true)
    const [isLoadingRooms, setIsLoadingRooms] = useState(false)

    const [error, setError] = useState<string | null>(null)
    const [isOfficeOpen, setIsOfficeOpen] = useState(false)
    const officeRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          const target = event.target as Node
    
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

    const loadOffices = async () => {
      try {
        setIsLoadingOffices(true)
        setError(null)

        const data = await getOffices()

        setOffices(data)
      } catch {
        setError('Не удалось загрузить офисы')
      } finally {
        setIsLoadingOffices(false)
      }
    }


    useEffect(() => {
        loadOffices()
    }, [])

  return(
    <>
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

              <div className="bookings-calendar">
                    <img src={calendar} alt="calendar" />
                    <p>За все время</p>
              </div>

            </div>
          </div>

          <div className="bookings-tabs">
              <ul className="book-tabs">
                <li className="selected">Предстоящие</li>
                <li>Прошедшие</li>
              </ul>
          </div>
          <div className="bookings-list">
                <BookingCard />
          </div>
        </div>  
      </section>
    </>
  );
}