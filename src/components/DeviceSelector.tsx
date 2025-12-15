import { useState } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { ConnectionStatus } from '../hooks/useDeviceChannel'
import { StatusBadge } from './StatusBadge'

type DeviceSelectorProps = {
  deviceId: string
  status: ConnectionStatus
  onDeviceChange: (deviceId: string) => void
  onConnect: () => void
  onDisconnect: () => void
}

export function DeviceSelector({
  deviceId,
  status,
  onDeviceChange,
  onConnect,
  onDisconnect,
}: DeviceSelectorProps) {
  const [inputValue, setInputValue] = useState(deviceId)
  const isConnected = status === 'connected'
  const isConnecting = status === 'connecting'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onDeviceChange(inputValue.trim())
      onConnect()
    }
  }

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Device Connection</h2>
        <StatusBadge status={status} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter device ID (e.g., mac_test)"
          disabled={isConnected || isConnecting}
          className="flex-1 px-4 py-2 bg-background border border-border rounded-lg 
                     text-foreground placeholder:text-muted-foreground
                     focus:outline-none focus:ring-2 focus:ring-primary/50
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        {isConnected ? (
          <button
            type="button"
            onClick={onDisconnect}
            className="px-4 py-2 bg-destructive text-white rounded-lg font-medium
                       hover:bg-destructive/90 transition-colors flex items-center gap-2"
          >
            <WifiOff className="w-4 h-4" />
            Disconnect
          </button>
        ) : (
          <button
            type="submit"
            disabled={!inputValue.trim() || isConnecting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium
                       hover:bg-primary/90 transition-colors flex items-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wifi className="w-4 h-4" />
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        )}
      </form>
    </div>
  )
}
