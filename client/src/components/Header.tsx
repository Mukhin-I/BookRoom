import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Header.css'
import logo from '../assets/logo-badge.svg'

export type TabType = 'rooms' | 'bookings'

interface HeaderProps {
  initialSelected?: TabType
  onTabChange?: (tab: TabType) => void
}

function getInitials(username: string): string {
  return username
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function Header({
  initialSelected = 'rooms',
  onTabChange,
}: HeaderProps) {
  const username = 'Константин К.'
  const [selected, setSelected] = useState<TabType>(initialSelected)

  const handleSelect = (tab: TabType) => {
    setSelected(tab)
    onTabChange?.(tab)
  }

  return (
    <header>
      <div className="container">
        <div className="header-wrapper">
          <Link to="/">
            <div className="logo-wrapper">
              <img src={logo} alt="logo" />
              <h2>BookRoom</h2>
            </div>
          </Link>

          <ul className="menu">
            <Link to={'/'}>
                <li
                    className={selected === 'rooms' ? 'selected' : ''}
                    onClick={() => handleSelect('rooms')}
                    >
                    Переговорные
                </li>
            </Link>
            
            <Link to={'/bookings'}>
                <li
                    className={selected === 'bookings' ? 'selected' : ''}
                    onClick={() => handleSelect('bookings')}
                    >
                    Мои бронирования
                </li>
            </Link>
          </ul>

          <div className="user-profile">
            <h4 className="username">{username}</h4>
            <div className="avatar">{getInitials(username)}</div>
          </div>
        </div>
      </div>
    </header>
  )
}