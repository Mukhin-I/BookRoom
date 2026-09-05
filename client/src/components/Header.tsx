import './Header.css'
import logo from '../assets/logo-badge.svg'

function getInitials(username: string): string {
  return username
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function Header() {
    const username = "Константин К."
  return (
    <>
        <header>
            <div className="container">
                <div className="header-wrapper">
                    <div className="logo-wrapper">
                        <img src={logo} alt="logo" />
                        <h2>BookRoom</h2>
                    </div>

                    <ul className="menu">
                        <li className="selected">Переговорные</li>
                        <li>Мои бронирования</li>
                    </ul>

                    <div className="user-profile">
                        <h4 className="username">{username}</h4>
                        <div className="avatar">{getInitials(username)}</div>
                    </div>
                </div>
            </div>
        </header>
    </>
  )
}