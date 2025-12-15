import { Activity, Clock, Zap, Radio } from 'lucide-react'
import { TelemetryEvent } from '../lib/supabase'

type StatsCardsProps = {
  telemetry: TelemetryEvent[]
  latencyMs: number | null
  lastSeen: number | null
  isConnected: boolean
}

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 5) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.floor(minutes / 60)}h ago`
}

export function StatsCards({ telemetry, latencyMs, lastSeen, isConnected }: StatsCardsProps) {
  // Calculate events per minute (last 60 seconds)
  const now = Date.now()
  const oneMinuteAgo = now - 60000
  const recentEvents = telemetry.filter(e => (e.received_at || e.client_ts) > oneMinuteAgo)
  const eventsPerMinute = recentEvents.length

  // Get unique streams
  const uniqueStreams = new Set(telemetry.map(e => e.stream)).size

  const stats = [
    {
      label: 'Status',
      value: isConnected ? 'Online' : 'Offline',
      icon: Radio,
      color: isConnected ? 'text-green-500' : 'text-gray-500',
    },
    {
      label: 'Latency',
      value: latencyMs !== null ? `${latencyMs}ms` : '—',
      icon: Zap,
      color: latencyMs !== null 
        ? (latencyMs < 100 ? 'text-green-500' : latencyMs < 500 ? 'text-yellow-500' : 'text-red-500')
        : 'text-muted-foreground',
    },
    {
      label: 'Events/min',
      value: eventsPerMinute.toString(),
      icon: Activity,
      color: 'text-primary',
    },
    {
      label: 'Last Event',
      value: lastSeen ? formatRelativeTime(lastSeen) : '—',
      icon: Clock,
      color: 'text-muted-foreground',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card rounded-lg border border-border p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
      
      {uniqueStreams > 0 && (
        <div className="col-span-2 lg:col-span-4 text-xs text-muted-foreground">
          Tracking {uniqueStreams} stream{uniqueStreams !== 1 ? 's' : ''}: {
            [...new Set(telemetry.map(e => e.stream))].join(', ')
          }
        </div>
      )}
    </div>
  )
}
