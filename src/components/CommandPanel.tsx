import { useState } from 'react'
import { Send, Terminal, CheckCircle, XCircle } from 'lucide-react'
import { CommandResult } from '../lib/supabase'

type CommandPanelProps = {
  isConnected: boolean
  commandResults: CommandResult[]
  onSendCommand: (name: string, params: Record<string, unknown>) => Promise<unknown>
}

const PRESET_COMMANDS = [
  { name: 'ping', params: {}, label: 'Ping' },
  { name: 'status', params: {}, label: 'Get Status' },
  { name: 'restart', params: {}, label: 'Restart' },
]

export function CommandPanel({ isConnected, commandResults, onSendCommand }: CommandPanelProps) {
  const [commandName, setCommandName] = useState('')
  const [commandParams, setCommandParams] = useState('{}')
  const [sending, setSending] = useState(false)
  const [paramsError, setParamsError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!commandName.trim()) return

    let params: Record<string, unknown> = {}
    try {
      params = JSON.parse(commandParams)
      setParamsError(null)
    } catch {
      setParamsError('Invalid JSON')
      return
    }

    setSending(true)
    await onSendCommand(commandName.trim(), params)
    setSending(false)
  }

  const handlePresetCommand = async (name: string, params: Record<string, unknown>) => {
    setSending(true)
    await onSendCommand(name, params)
    setSending(false)
  }

  return (
    <div className="bg-card rounded-lg border border-border flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Terminal className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Commands</h2>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex gap-2 mb-4">
          {PRESET_COMMANDS.map((cmd) => (
            <button
              key={cmd.name}
              onClick={() => handlePresetCommand(cmd.name, cmd.params)}
              disabled={!isConnected || sending}
              className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-sm
                         hover:bg-secondary/80 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cmd.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={commandName}
            onChange={(e) => setCommandName(e.target.value)}
            placeholder="Command name"
            disabled={!isConnected}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg 
                       text-foreground placeholder:text-muted-foreground text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/50
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          <div>
            <textarea
              value={commandParams}
              onChange={(e) => {
                setCommandParams(e.target.value)
                setParamsError(null)
              }}
              placeholder='{"key": "value"}'
              disabled={!isConnected}
              rows={2}
              className={`w-full px-3 py-2 bg-background border rounded-lg 
                         text-foreground placeholder:text-muted-foreground text-sm font-mono
                         focus:outline-none focus:ring-2 focus:ring-primary/50
                         disabled:opacity-50 disabled:cursor-not-allowed resize-none
                         ${paramsError ? 'border-destructive' : 'border-border'}`}
            />
            {paramsError && (
              <p className="text-xs text-destructive mt-1">{paramsError}</p>
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={!isConnected || !commandName.trim() || sending}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium
                       hover:bg-primary/90 transition-colors flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send Command'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Results ({commandResults.length})
        </h3>
        
        {commandResults.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No command results yet
          </p>
        ) : (
          <div className="space-y-2">
            {commandResults.map((result, index) => (
              <div
                key={`${result.id}-${index}`}
                className={`p-3 rounded-lg border ${
                  result.ok 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {result.ok ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-xs font-mono text-muted-foreground">
                      {result.id.slice(0, 8)}...
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {result.device_ts_ms - result.command_server_ts_ms}ms roundtrip
                  </span>
                </div>
                <pre className="text-xs font-mono text-foreground bg-background/50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
