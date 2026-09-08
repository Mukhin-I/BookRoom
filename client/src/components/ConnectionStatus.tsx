import './ConnectionStatus.css'
import warningIcon from '../assets/warning-icon.svg'

interface ConnectionStatusProps {
    isConnected: boolean
    isReconnecting: boolean
}

export default function ConnectionStatus({
    isConnected,
    isReconnecting,
}: ConnectionStatusProps) {
    if (isConnected || !isReconnecting) {
        return null
    }

    return (
        <div className="connection-banner">
            <div className="connection-inner">
                <img src={warningIcon} alt="info" />
                <p className="connection-text">Соединение потеряно. Переподключение...</p>
            </div>
        </div>
    )
}