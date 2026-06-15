import { getColor } from '../lib/helpers'

export default function Header({ identity, onSwitchIdentity, onAddStaff }) {
  const c = getColor(identity.color_idx)

  return (
    <header className="bg-navy text-white h-14 flex items-center justify-between px-4 md:px-6 flex-shrink-0 shadow-lg z-10">
      <div className="flex items-center gap-2.5">
        <span className="text-lg">📋</span>
        <h1 className="text-[15px] font-semibold tracking-wide hidden sm:block">Staff Daily Updates</h1>
        <h1 className="text-[15px] font-semibold tracking-wide sm:hidden">Updates</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Admin: add staff button */}
        {identity.isAdmin && (
          <button
            onClick={onAddStaff}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-colors font-medium"
          >
            <span>+</span>
            <span className="hidden sm:inline">Add Staff</span>
          </button>
        )}

        {/* Identity chip */}
        <button
          onClick={onSwitchIdentity}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
          title="Switch identity"
        >
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            style={{ background: c.bg }}
          >
            {identity.name.charAt(0).toUpperCase()}
          </span>
          <span className="text-xs font-medium max-w-[80px] truncate">
            {identity.isAdmin ? '🔐 Admin' : identity.name}
          </span>
          <span className="text-white/40 text-[10px]">▾</span>
        </button>
      </div>
    </header>
  )
}