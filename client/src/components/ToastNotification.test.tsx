import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, afterEach } from 'vitest'

import ToastNotification from './ToastNotification'

describe('ToastNotification', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders title and message', () => {
    render(
      <ToastNotification
        title="Бронирование создано"
        message="Комната 101, 7 сентября, 15:00-16:00"
        onClose={vi.fn()}
      />,
    )

    expect(
      screen.getByText('Бронирование создано'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Комната 101, 7 сентября, 15:00-16:00'),
    ).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()

    render(
      <ToastNotification
        title="Бронирование создано"
        message="Комната 101"
        onClose={onClose}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: '✕',
      }),
    )

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose automatically after duration', () => {
    vi.useFakeTimers()

    const onClose = vi.fn()

    render(
      <ToastNotification
        title="Бронирование создано"
        message="Комната 101"
        onClose={onClose}
        duration={3000}
      />,
    )

    expect(onClose).not.toHaveBeenCalled()

    vi.advanceTimersByTime(3000)

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})