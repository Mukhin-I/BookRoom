import './RoomDetailsCard.css'

import usersC from '../assets/users-c.svg'
import video from '../assets/video.svg'
import edit from '../assets/edit-3.svg'
import tv from '../assets/tv.svg'

import type { Room } from '../types/api'

interface RoomDetailsCardProps {
  room: Room
}

export default function RoomDetailsCard({
  room,
}: RoomDetailsCardProps) {

  const featureIcons = [
    tv,
    edit,
    video,
  ]

  return (
    <div className="room-details-card">

      <h2 className="room-card-name">
        {room.name}
      </h2>

      <p className="room-card-office-address">
        {room.office.name} · {room.office.address}
      </p>

      <div className="room-features">

        <div className="feature-item">
          <img
            src={usersC}
            alt="capacity"
          />

          <p className="feature-desc">
            Вместимость: до {room.capacity} человек
          </p>
        </div>

        {room.features.map((feature, index) => (
          <div
            key={feature.code}
            className="feature-item"
          >
            <img
              src={featureIcons[index]}
              alt={feature.name}
            />

            <p className="feature-desc">
              {feature.name}
            </p>
          </div>
        ))}

      </div>
    </div>
  )
}