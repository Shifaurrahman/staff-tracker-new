import { formatWeekLabel } from '../lib/helpers'

export default function WeekNav({ weekOffset, onChangeWeek, count }) {
  // Compute label
  const now  = new Date()
  const day  = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon  = new Date(now)
  mon.setDate(now.getDate() + diff + weekOffset * 7)
  mon.setHours(0,0,0,0)
  const sun  = new Date(mon); sun.setDate(mon.getDate() + 6)
  const label = formatWeekLabel({ mon, sun })

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChangeWeek(-1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all text-base"
        >
          ‹
        </button>
        <span className="text-[13px] font-semibold text-gray-700">{label}</span>
        <button
          onClick={() => onChangeWeek(1)}
          disabled={weekOffset >= 0}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all text-base disabled:opacity-25 disabled:cursor-default"
        >
          ›
        </button>
      </div>
      <span className="text-[11px] text-gray-400 font-medium">
        {count > 0 ? `${count} message${count > 1 ? 's' : ''}` : 'No messages'}
      </span>
    </div>
  )
}