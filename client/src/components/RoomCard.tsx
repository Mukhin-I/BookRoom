import './RoomCard.css'
import users from '../assets/users.svg'
import clock from '../assets/clock.svg'

export default function RoomCard() {
    return(
        <>
            <div className="room-card">
                <h2 className="room-title">Эверест</h2>
                <p className="room-floor">4 этаж</p>
                <div className="room-details-prev">
                    <div className="room-details-prev-item">
                        <img src={users} alt="capacity" />
                        <p className="details-prev-desc">Вместимость: до 12 человек</p>
                    </div>
                    <div className="room-details-prev-item">
                        <img src={clock} alt="time" />
                        <p className="details-prev-desc">Занята до 15:30</p>
                    </div>
                </div>
                <div className="room-availability unavailable">
                    <span></span>
                    <p className="room-av-text">Недоступно на выбранное время</p>
                </div>

                <div className="room-buttons">
                    <p className="goto-room-details">Подробнее</p>
                    <p className="book-room book-unavailable">Забронировать</p>
                </div>
            </div>
        </>
    );
}