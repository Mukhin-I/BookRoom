import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi, afterEach } from 'vitest'

import {
  useRealtime,
  type RealtimeEvent,
} from './useRealtime'


class MockWebSocket {
  static instances: MockWebSocket[] = []

  url: string

  onopen: (() => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: (() => void) | null = null
  onclose: (() => void) | null = null

  close = vi.fn()

  constructor(url: string) {
    this.url = url

    MockWebSocket.instances.push(this)
  }
}


vi.stubGlobal('WebSocket', MockWebSocket)


describe('useRealtime', () => {
  afterEach(() => {
    MockWebSocket.instances = []
    vi.clearAllMocks()
  })


  it('соединяется к WebSocket', () => {
    const onEvent = vi.fn()

    renderHook(() =>
      useRealtime({
        onEvent,
      }),
    )

    expect(
      MockWebSocket.instances,
    ).toHaveLength(1)

    expect(
      MockWebSocket.instances[0].url,
    ).toBe('ws://localhost:3000/api/v1/ws')
  })


  it('вызывает onEvent когда пришло валидное сообщение от WebSocket', () => {
    const onEvent = vi.fn()

    renderHook(() =>
      useRealtime({
        onEvent,
      }),
    )

    const socket = MockWebSocket.instances[0]

    const event: RealtimeEvent = {
      type: 'booking.created',
      occurredAt: '2026-09-08T12:00:00.000Z',
      data: {
        booking: {
          roomId: 'room-1',
        },
      },
    }

    socket.onmessage?.({
      data: JSON.stringify(event),
    } as MessageEvent)

    expect(onEvent).toHaveBeenCalledTimes(1)

    expect(onEvent).toHaveBeenCalledWith(event)
  })


  it('не вызывает onEvent когда получен неправильный JSON', () => {
    const onEvent = vi.fn()

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    renderHook(() =>
      useRealtime({
        onEvent,
      }),
    )

    const socket = MockWebSocket.instances[0]

    socket.onmessage?.({
      data: 'invalid json',
    } as MessageEvent)

    expect(onEvent).not.toHaveBeenCalled()

    expect(
      consoleErrorSpy,
    ).toHaveBeenCalledWith(
      'Failed to parse WebSocket message',
    )

    consoleErrorSpy.mockRestore()
  })


  it('закрытие WebSocket когда компонент размонтируется', () => {
    const onEvent = vi.fn()

    const { unmount } = renderHook(() =>
      useRealtime({
        onEvent,
      }),
    )

    const socket = MockWebSocket.instances[0]

    unmount()

    expect(socket.close).toHaveBeenCalledTimes(1)
  })
})