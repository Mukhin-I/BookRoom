import './BookingCard.css'
import doorOpen from '../assets/door-open.svg'

export default function BookingCard() {
    return(
        <>
            <div className="booking-card">
                <div className="booking-card-left">

                    <div className="booking-date-badge">
                        <p className="booking-month">октябрь</p>
                        <span className="booking-day">24</span>
                    </div>
                    <div className="booking-card-info">
                        <h2 className="booking-title">Daily Sync: Разработка & Продукт</h2>
                        <div className="booking-bottom-info">
                            <div className="booking-office">
                                <img src={doorOpen} alt="office" />
                                <p className="booking-office-title">Эверест</p>
                            </div>
                            <span className="booking-bottom-sep"></span>
                            <p className="booking-bottom-rest">4 этаж</p>
                            <span className="booking-bottom-sep"></span>
                            <p className="booking-bottom-rest">15:00 - 16:00 MSK</p>
                        </div>
                    </div>
                </div>
                <button className="cancel-booking">Отменить</button>
            </div>
        </>
    );
}