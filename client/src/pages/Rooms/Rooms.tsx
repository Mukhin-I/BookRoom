import './Rooms.css'
import Header from '../../components/Header'
import calendar from '../../assets/calendar.svg'
import users from '../../assets/users.svg'
import clock from '../../assets/clock.svg'
import RoomCard from '../../components/RoomCard'

export default function Rooms() {
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
                        <h5>Время</h5>
                        <div className="date-selector-field">
                            <img src={clock} alt="calendar" />
                            <p>15:00</p>
                        </div>
                    </div>
                    <div className="date-selector-item">
                        <h5>Длительность</h5>
                        <div className="date-selector-field">
                            {/* <img src={clock} alt="calendar" /> */}
                            <p>1 час</p>
                        </div>
                    </div>
                    <div className="date-selector-item">
                        <h5>Вместимость</h5>
                        <div className="date-selector-field">
                            <img src={users} alt="calendar" />
                            <p>Мин. 4 чел</p>
                        </div>
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
  )
}