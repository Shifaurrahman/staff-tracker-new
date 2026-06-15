import { useState } from 'react'
import { upsertReply } from '../lib/db'
import { getColor, formatTime } from '../lib/helpers'

export default function MessageCard({ msg, isAdmin, onReplied }) {
  const [replyOpen, setReplyOpen]   = useState(false)
  const [replyText, setReplyText]   = useState(msg.reply_text || '')
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)

  const c = getColor(msg.color_idx)

  async function handleReply() {
    const trimmed = replyText.trim()
    if (!trimmed) return
    setSaving(true)
    try {
      await upsertReply(msg.id, trimmed, msg.reply_id || null)
      setSaved(true)
      setTimeout(() => { setSaved(false); setReplyOpen(false) }, 1200)
      onReplied()
    } catch (e) {
      alert('Failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-slide-up">
      {/* Card header */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
          style={{ background: c.bg }}
        >
          {msg.staff_name.charAt(0).toUpperCase()}
        </span>
        <span
          className="text-xs font-bold px-2.5 py-0.5 rounded-full"
          style={{ background: c.light, color: c.bg }}
        >
          {msg.staff_name}
        </span>
        <span className="ml-auto text-[11px] text-gray-300 font-mono tabular-nums">
          {formatTime(msg.created_at)}
        </span>
      </div>

      {/* Message text */}
      <p className="text-[13.5px] text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
        {msg.text}
      </p>

      {/* Existing reply */}
      {msg.reply_text && !replyOpen && (
        <div className="mt-3 pt-3 border-t border-dashed border-gray-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-bold text-[#e07b2a] uppercase tracking-widest">Admin Reply</span>
            {isAdmin && (
              <button
                onClick={() => setReplyOpen(true)}
                className="text-[10px] text-gray-300 hover:text-[#e07b2a] ml-1 underline transition-colors"
              >
                edit
              </button>
            )}
          </div>
          <div className="text-[13px] text-gray-600 leading-snug bg-[#fff8f0] px-3 py-2 rounded-xl border-l-[3px] border-[#e07b2a] whitespace-pre-wrap">
            {msg.reply_text}
          </div>
        </div>
      )}

      {/* Admin reply form */}
      {isAdmin && !msg.reply_text && !replyOpen && (
        <button
          onClick={() => setReplyOpen(true)}
          className="mt-3 text-[11px] text-gray-300 hover:text-[#e07b2a] transition-colors flex items-center gap-1"
        >
          <span>✉</span> Reply
        </button>
      )}

      {isAdmin && replyOpen && (
        <div className="mt-3 pt-3 border-t border-dashed border-gray-100">
          <textarea
            autoFocus
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.metaKey || e.ctrlKey) && handleReply()}
            placeholder="Write a reply…"
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-[13px] resize-none outline-none focus:border-[#e07b2a] font-sans transition-all mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setReplyOpen(false); setReplyText(msg.reply_text || '') }}
              className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReply}
              disabled={saving || !replyText.trim()}
              className="flex-1 text-xs font-semibold text-white px-3 py-1.5 rounded-lg bg-[#e07b2a] hover:bg-[#c96d1e] transition-colors disabled:opacity-50"
            >
              {saved ? '✓ Sent!' : saving ? 'Sending…' : msg.reply_text ? 'Update Reply' : 'Send Reply'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}