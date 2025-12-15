import { useState, useCallback } from 'react'
import { Radio } from 'lucide-react'
import { useDeviceChannel } from './hooks/useDeviceChannel'
import { DeviceSelector } from './components/DeviceSelector'
import { StatsCards } from './components/StatsCards'
import { TelemetryFeed } from './components/TelemetryFeed'
import { CommandPanel } from './components/CommandPanel'

export default function App() {
  const [deviceId, setDeviceId] = useState<string>('mac_test')
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null)

  const {
    status,
    telemetry,
    commandResults,
    lastSeen,
    latencyMs,
    error,
    sendCommand,
    clearTelemetry,
  } = useDeviceChannel(activeDeviceId)

  const handleConnect = useCallback(() => {
    setActiveDeviceId(deviceId)
  }, [deviceId])

  const handleDisconnect = useCallback(() => {
    setActiveDeviceId(null)
  }, [])

  const isConnected = status === 'connected'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Radio className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SoloConnector</h1>
              <p className="text-sm text-muted-foreground">Real-time Device Monitor</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Connection */}
        <DeviceSelector
          deviceId={deviceId}
          status={status}
          onDeviceChange={setDeviceId}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
            <p className="font-medium">Connection Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Stats */}
        <StatsCards
          telemetry={telemetry}
          latencyMs={latencyMs}
          lastSeen={lastSeen}
          isConnected={isConnected}
        />

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 400px)', minHeight: '400px' }}>
          {/* Telemetry Feed - 2 columns */}
          <div className="lg:col-span-2">
            <TelemetryFeed
              telemetry={telemetry}
              lastSeen={lastSeen}
              latencyMs={latencyMs}
              onClear={clearTelemetry}
            />
          </div>

          {/* Command Panel - 1 column */}
          <div>
            <CommandPanel
              isConnected={isConnected}
              commandResults={commandResults}
              onSendCommand={sendCommand}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          SoloConnector Dashboard • Supabase Realtime • {activeDeviceId ? `Monitoring: ${activeDeviceId}` : 'Not connected'}
        </div>
      </footer>
    </div>
  )
}
