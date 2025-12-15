import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase, TelemetryEvent, CommandResult, DeviceCommand } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export type DeviceChannelState = {
  status: ConnectionStatus
  telemetry: TelemetryEvent[]
  commandResults: CommandResult[]
  lastEvent: TelemetryEvent | null
  lastSeen: number | null
  latencyMs: number | null
  error: string | null
}

const MAX_TELEMETRY_HISTORY = 100

export function useDeviceChannel(deviceId: string | null) {
  const [state, setState] = useState<DeviceChannelState>({
    status: 'disconnected',
    telemetry: [],
    commandResults: [],
    lastEvent: null,
    lastSeen: null,
    latencyMs: null,
    error: null,
  })

  const channelRef = useRef<RealtimeChannel | null>(null)

  const sendCommand = useCallback(async (name: string, params: Record<string, unknown> = {}) => {
    if (!deviceId || !channelRef.current) {
      console.error('Cannot send command: no device connected')
      return null
    }

    const command: DeviceCommand = {
      id: crypto.randomUUID(),
      device_id: deviceId,
      name,
      params,
      server_ts_ms: Date.now(),
    }

    const result = await channelRef.current.send({
      type: 'broadcast',
      event: 'command',
      payload: command,
    })

    console.log('Command sent:', command, 'Result:', result)
    return command
  }, [deviceId])

  const clearTelemetry = useCallback(() => {
    setState(prev => ({
      ...prev,
      telemetry: [],
      commandResults: [],
    }))
  }, [])

  useEffect(() => {
    if (!deviceId) {
      setState(prev => ({ ...prev, status: 'disconnected' }))
      return
    }

    const channelName = `device:${deviceId}`
    console.log(`Subscribing to channel: ${channelName}`)

    setState(prev => ({ ...prev, status: 'connecting', error: null }))

    const channel = supabase.channel(channelName)

    channel
      .on('broadcast', { event: 'ingest' }, ({ payload }) => {
        const event = payload as TelemetryEvent
        const now = Date.now()
        const latency = event.client_ts ? now - event.client_ts : null

        setState(prev => ({
          ...prev,
          lastEvent: event,
          lastSeen: now,
          latencyMs: latency,
          telemetry: [
            { ...event, received_at: now },
            ...prev.telemetry.slice(0, MAX_TELEMETRY_HISTORY - 1),
          ],
        }))
      })
      .on('broadcast', { event: 'command_result' }, ({ payload }) => {
        const result = payload as CommandResult
        console.log('Command result received:', result)

        setState(prev => ({
          ...prev,
          commandResults: [result, ...prev.commandResults.slice(0, 49)],
        }))
      })
      .subscribe((status) => {
        console.log(`Channel ${channelName} status:`, status)
        
        if (status === 'SUBSCRIBED') {
          setState(prev => ({ ...prev, status: 'connected', error: null }))
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setState(prev => ({ 
            ...prev, 
            status: 'error',
            error: `Channel ${status.toLowerCase()}`
          }))
        }
      })

    channelRef.current = channel

    return () => {
      console.log(`Unsubscribing from channel: ${channelName}`)
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [deviceId])

  return {
    ...state,
    sendCommand,
    clearTelemetry,
  }
}
