import './RoomCardSkeleton.css';

export default function RoomCardSkeleton() {
  return (
    <div className="room-card">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-floor"></div>

      <div className="skeleton-details">
        <div className="skeleton-detail-item">
          <div className="skeleton skeleton-icon"></div>
          <div className="skeleton skeleton-text"></div>
        </div>
        <div className="skeleton-detail-item">
          <div className="skeleton skeleton-icon"></div>
          <div className="skeleton skeleton-text short"></div>
        </div>
      </div>

      <div className="skeleton skeleton-availability"></div>

      <div className="skeleton-buttons">
        <div className="skeleton skeleton-btn"></div>
        <div className="skeleton skeleton-btn"></div>
      </div>
    </div>
  );
}