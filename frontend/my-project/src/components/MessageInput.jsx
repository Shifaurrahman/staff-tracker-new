import { useState } from 'react'
import { postMessage } from '../lib/db'
import { getColor, todayLabel } from '../lib/helpers'

export default function MessageInput({ identity, onSent }) {
  const [text, setText]       = useState('')
  const [sending, setSending] = useState(false)
  const c = getColor(identity.color_idx)

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed) return

    setSending(true)
    try {
      await postMessage(identity.id, trimmed)
      setText('')
      onSent()
    } catch (e) {
      alert('Failed to send: ' + e.message)
    } finally {
      setSending(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend()
  }

  return (
    <div className="bg-white border-b border-gray-100 p-4 flex-shrink-0">
      {/* Today badge */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
          style={{ background: c.bg }}
        >
          {identity.name.charAt(0).toUpperCase()}
        </span>
        <span className="text-xs font-medium text-gray-500">{identity.name}</span>
        <span className="ml-auto text-[11px] text-gray-300">{todayLabel()}</span>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder="What did you work on? Share updates, blockers, or highlights…"
        rows={3}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13.5px] text-gray-700 resize-none outline-none focus:border-brand-DEFAULT focus:ring-2 focus:ring-brand-light transition-all bg-gray-50 focus:bg-white font-sans leading-relaxed"
      />

      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-gray-300 hidden sm:block">⌘+Enter to send</span>
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="ml-auto flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: sending || !text.trim() ? '#a0aec0' : c.bg }}
        >
          {sending ? (
            <span className="flex items-center gap-1.5"><Spinner /> Sending…</span>
          ) : (
            <>Post Update</>
          )}
        </button>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  )
}