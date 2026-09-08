import {
  useEffect,
  useRef,
  useState,
} from 'react'

export interface RealtimeEvent {
  type: string
  occurredAt: string
  data: Record<string, unknown>
}

interface UseRealtimeOptions {
  onEvent?: (event: RealtimeEvent) => void
}

export function useRealtime({
  onEvent,
}: UseRealtimeOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null)

  const shouldReconnectRef = useRef(true)

  useEffect(() => {
    shouldReconnectRef.current = true

    function connect() {
      const ws = new WebSocket(
        'ws://localhost:3000/api/v1/ws',
      )

      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')

        setIsConnected(true)
        setIsReconnecting(false)
      }

      ws.onmessage = (message) => {
        try {
          const event: RealtimeEvent = JSON.parse(
            message.data,
          )

          onEvent?.(event)
        } catch {
          console.error(
            'Failed to parse WebSocket message',
          )
        }
      }

      ws.onerror = () => {
        console.error('WebSocket error')
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')

        setIsConnected(false)

        if (shouldReconnectRef.current) {
          setIsReconnecting(true)

          reconnectTimeoutRef.current = setTimeout(
            () => {
              console.log(
                'Trying to reconnect WebSocket...',
              )

              connect()
            },
            3000,
          )
        }
      }
    }

    connect()

    return () => {
      shouldReconnectRef.current = false

      if (reconnectTimeoutRef.current) {
        clearTimeout(
          reconnectTimeoutRef.current,
        )
      }

      wsRef.current?.close()
    }
  }, [onEvent])

  return {
    isConnected,
    isReconnecting,
  }
}