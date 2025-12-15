import { Activity, Trash2 } from 'lucide-react'
import { TelemetryEvent } from '../lib/supabase'

type TelemetryFeedProps = {
  telemetry: TelemetryEvent[]
  lastSeen: number | null
  latencyMs: number | null
  onClear: () => void
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  })
}

function formatPayload(payload: Record<string, unknown>): string {
  return JSON.stringify(payload, null, 2)
}

export function TelemetryFeed({ telemetry, lastSeen, latencyMs, onClear }: TelemetryFeedProps) {
  return (
    <div className="bg-card rounded-lg border border-border flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Live Telemetry</h2>
          <span className="text-sm text-muted-foreground">
            ({telemetry.length} events)
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {latencyMs !== null && (
            <div className="text-sm">
              <span className="text-muted-foreground">Latency: </span>
              <span className={`font-mono font-medium ${
                latencyMs < 100 ? 'text-green-500' : 
                latencyMs < 500 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {latencyMs}ms
              </span>
            </div>
          )}
          
          {lastSeen && (
            <div className="text-sm text-muted-foreground">
              Last: {formatTimestamp(lastSeen)}
            </div>
          )}
          
          <button
            onClick={onClear}
            disabled={telemetry.length === 0}
            className="p-2 text-muted-foreground hover:text-foreground 
                       hover:bg-secondary rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear telemetry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
        {telemetry.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Activity className="w-12 h-12 mb-3 opacity-30" />
            <p>Waiting for telemetry data...</p>
            <p className="text-sm mt-1">Events will appear here in real-time</p>
          </div>
        ) : (
          telemetry.map((event, index) => (
            <div
              key={`${event.client_ts}-${index}`}
              className={`p-3 rounded-lg border transition-all ${
                index === 0 
                  ? 'bg-primary/10 border-primary/30 animate-pulse' 
                  : 'bg-secondary/50 border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded">
                    {event.stream}
                  </span>
                  {event.device_id && (
                    <span className="text-xs text-muted-foreground">
                      {event.device_id}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatTimestamp(event.client_ts)}
                </span>
              </div>
              <pre className="text-sm text-foreground font-mono bg-background/50 p-2 rounded overflow-x-auto">
                {formatPayload(event.payload)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
