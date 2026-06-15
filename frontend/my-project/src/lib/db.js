import { supabase } from './supabase'

// ── Staff ──────────────────────────────────────────────────────────────────
export async function fetchStaff() {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function addStaff(name, colorIdx) {
  const { data, error } = await supabase
    .from('staff')
    .insert({ name: name.trim(), color_idx: colorIdx })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Messages ───────────────────────────────────────────────────────────────
export async function fetchMessages(weekStart, weekEnd) {
  const { data, error } = await supabase
    .from('messages_full')
    .select('*')
    .gte('created_at', weekStart)
    .lte('created_at', weekEnd)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function postMessage(staffId, text) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ staff_id: staffId, text: text.trim() })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Replies ────────────────────────────────────────────────────────────────
export async function upsertReply(messageId, text, existingReplyId) {
  if (existingReplyId) {
    const { data, error } = await supabase
      .from('replies')
      .update({ text: text.trim(), updated_at: new Date().toISOString() })
      .eq('id', existingReplyId)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('replies')
      .insert({ message_id: messageId, text: text.trim() })
      .select()
      .single()
    if (error) throw error
    return data
  }
}

// ── Realtime subscription ─────────────────────────────────────────────────
export function subscribeToChanges(callback) {
  const channel = supabase
    .channel('db-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'replies' },  callback)
    .subscribe()
  return () => supabase.removeChannel(channel)
}