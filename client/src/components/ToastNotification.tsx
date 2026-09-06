import React, { useEffect } from 'react'
import './ToastNotification.css'

interface ToastNotificationProps {
  title: string
  message: string
  onClose: () => void
  duration?: number
}

export default function ToastNotification({
  title,
  message,
  onClose,
  duration = 5000,
}: ToastNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div className="toast-notification">
      <div className="toast-icon">
        <span>✓</span>
      </div>
      <div className="toast-content">
        <h4 className="toast-title">{title}</h4>
        <p className="toast-message">{message}</p>
      </div>
      <button type="button" className="toast-close" onClick={onClose}>
        ✕
      </button>
    </div>
  )
}