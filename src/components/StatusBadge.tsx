import { ConnectionStatus } from '../hooks/useDeviceChannel'

type StatusBadgeProps = {
  status: ConnectionStatus
}

const statusConfig: Record<ConnectionStatus, { label: string; color: string; pulse: boolean }> = {
  disconnected: { label: 'Disconnected', color: 'bg-gray-500', pulse: false },
  connecting: { label: 'Connecting...', color: 'bg-yellow-500', pulse: true },
  connected: { label: 'Connected', color: 'bg-green-500', pulse: true },
  error: { label: 'Error', color: 'bg-red-500', pulse: false },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`w-3 h-3 rounded-full ${config.color}`} />
        {config.pulse && (
          <div className={`absolute inset-0 w-3 h-3 rounded-full ${config.color} animate-ping opacity-75`} />
        )}
      </div>
      <span className="text-sm font-medium text-muted-foreground">{config.label}</span>
    </div>
  )
}
