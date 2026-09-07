import './RoomDetailsCard.css'

import usersC from '../assets/users-c.svg'
import edit from '../assets/edit-3.svg'
import video from '../assets/video.svg'
import tv from '../assets/tv.svg'

import type { Room } from '../types/api'

interface RoomDetailsCardProps {
  room: Room | null
  isLoading: boolean
}

export default function RoomDetailsCard({
  room,
  isLoading,
}: RoomDetailsCardProps) {
  const featureIcons = [tv, edit, video]

  if (isLoading || !room) {
    return (
      <div className="room-details-card">
        <div className="skeleton" style={{ width: '160px', height: '24px', borderRadius: '6px', marginBottom: '12px' }} />
        <div className="skeleton" style={{ width: '240px', height: '16px', borderRadius: '4px', marginBottom: '24px' }} />

        <div className="room-features" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="skeleton" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
              <div className="skeleton" style={{ width: `${140 + (i * 20)}px`, height: '16px', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

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
          <img src={usersC} alt="capacity" />
          <p className="feature-desc">
            Вместимость: до {room.capacity} человек
          </p>
        </div>

        {room.features.map((feature, index) => (
          <div key={feature.code} className="feature-item">
            <img src={featureIcons[index]} alt={feature.name} />
            <p className="feature-desc">
              {feature.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}