import { supabase } from './supabase'

const READING_COLUMNS = 'id, vital_id, value, measured_at, source, note'
const PROFILE_COLUMNS = 'full_name, crew_id, mission_name, mission_start_date, notify_alerts, notify_reminders'
const MAX_READINGS = 5000

function toReading(row) {
  return {
    id: row.id,
    vitalId: row.vital_id,
    value: Number(row.value),
    time: Date.parse(row.measured_at),
    source: row.source,
    note: row.note,
  }
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function updateProfile(userId, patch) {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('user_id', userId)
    .select(PROFILE_COLUMNS)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function fetchReadings() {
  const { data, error } = await supabase
    .from('health_readings')
    .select(READING_COLUMNS)
    .order('measured_at', { ascending: false })
    .limit(MAX_READINGS)
  if (error) throw error
  return data.map(toReading)
}

export async function insertReadings(rows) {
  const { error } = await supabase.from('health_readings').insert(rows)
  if (error) throw error
}

export async function deleteReading(id) {
  const { error } = await supabase.from('health_readings').delete().eq('id', id)
  if (error) throw error
}

export async function deleteSimulatedReadings() {
  const { error } = await supabase.from('health_readings').delete().eq('source', 'simulated')
  if (error) throw error
}
