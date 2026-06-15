import { formatDate, sameDay } from '../lib/helpers'
import MessageCard from './MessageCard'

export default function MessageFeed({ messages, isAdmin, loading, onReplied }) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-300">
          <div className="text-3xl mb-2 animate-pulse">⏳</div>
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-300">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-[15px] font-medium text-gray-400">No updates this week</p>
          <p className="text-sm text-gray-300 mt-1">Be the first to post an update</p>
        </div>
      </div>
    )
  }

  // Group by day — newest day first
  const groups = []
  let currentDay = null
  ;[...messages].reverse().forEach(msg => {
    const dayKey = new Date(msg.created_at).toDateString()
    if (dayKey !== currentDay) {
      groups.push({ dayKey, date: msg.created_at, items: [] })
      currentDay = dayKey
    }
    groups[groups.length - 1].items.push(msg)
  })

  return (
    <div className="flex-1 overflow-y-auto">
      {groups.map(group => (
        <div key={group.dayKey} className="px-4 pt-4 pb-2">
          {/* Day label */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-gray-100" />
            <span className={`text-[11px] font-bold uppercase tracking-widest px-2 ${
              sameDay(group.date, new Date()) ? 'text-brand-DEFAULT' : 'text-gray-300'
            }`}>
              {formatDate(group.date)}
            </span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {/* Cards — reversed so latest is at bottom within the day */}
          <div className="space-y-2.5">
            {[...group.items].reverse().map(msg => (
              <MessageCard
                key={msg.id}
                msg={msg}
                isAdmin={isAdmin}
                onReplied={onReplied}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="h-4" />
    </div>
  )
}