import './App.css'

import { Navigate, Route, Routes } from 'react-router-dom'

import Rooms from './pages/Rooms/Rooms'
import RoomDetails from './pages/RoomDetails/RoomDetails'
import Bookings from './pages/Bookings/Bookings'
import NotFound from './pages/NotFound/NotFound'
import { useRealtime } from './realtime/useRealtime'
import ConnectionStatus from '../../client/src/components/ConnectionStatus'

export default function App() {
  const {
    isConnected,
    isReconnecting,
  } = useRealtime()
  return (
    <>
      <ConnectionStatus
        isConnected={isConnected}
        isReconnecting={isReconnecting}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/rooms" replace />} />

        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:roomId" element={<RoomDetails />} />
        <Route path="/bookings" element={<Bookings />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
    
    
  )
}
