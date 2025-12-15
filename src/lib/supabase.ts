import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

export type TelemetryEvent = {
  stream: string
  client_ts: number
  payload: Record<string, unknown>
  device_id?: string
  received_at?: number
}

export type DeviceCommand = {
  id: string
  device_id: string
  name: string
  params: Record<string, unknown>
  server_ts_ms: number
}

export type CommandResult = {
  id: string
  ok: boolean
  result: Record<string, unknown>
  device_ts_ms: number
  command_server_ts_ms: number
}
