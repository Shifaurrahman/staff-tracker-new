import { useState } from 'react'
import { getColor, ADMIN_PASSWORD } from '../lib/helpers'

export default function IdentityGate({ staff, onSelect }) {
  const [adminTab, setAdminTab]     = useState(false)
  const [password, setPassword]     = useState('')
  const [pwError, setPwError]       = useState(false)
  const [searching, setSearching]   = useState('')

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(searching.toLowerCase())
  )

  function selectStaff(s) {
    onSelect({ id: s.id, name: s.name, color_idx: s.color_idx, isAdmin: false })
  }

  function handleAdminLogin() {
    if (password === ADMIN_PASSWORD) {
      onSelect({ id: 'admin', name: 'Admin', color_idx: 4, isAdmin: true })
    } else {
      setPwError(true)
      setPassword('')
    }
  }

  return (
    <div className="fixed inset-0 bg-navy flex flex-col items-center justify-center z-50 p-4">
      {/* Logo / Title */}
      <div className="mb-8 text-center animate-fade-in">
        <div className="text-4xl mb-3">📋</div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Staff Daily Updates</h1>
        <p className="text-white/50 text-sm mt-1">Arva Tech · Who are you today?</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setAdminTab(false)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              !adminTab ? 'text-navy border-b-2 border-navy' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            👤 I'm staff
          </button>
          <button
            onClick={() => setAdminTab(true)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              adminTab ? 'text-coral-DEFAULT border-b-2 border-coral-DEFAULT' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            🔐 Admin
          </button>
        </div>

        {!adminTab ? (
          <div className="p-4">
            {/* Search */}
            <input
              type="text"
              value={searching}
              onChange={e => setSearching(e.target.value)}
              placeholder="Search your name..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-DEFAULT focus:ring-2 focus:ring-brand-light mb-3 transition-all"
            />

            {/* Staff list */}
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-0.5">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-6">No staff found</p>
              ) : (
                filtered.map(s => {
                  const c = getColor(s.color_idx)
                  return (
                    <button
                      key={s.id}
                      onClick={() => selectStaff(s)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                    >
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: c.bg }}
                      >
                        {s.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        {s.name}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <p className="text-xs text-gray-400 mb-3">Enter admin password to continue</p>
            {pwError && (
              <p className="text-red-500 text-xs mb-2 bg-red-50 px-3 py-2 rounded-lg">
                ✕ Wrong password. Try again.
              </p>
            )}
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setPwError(false) }}
              onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
              placeholder="Admin password"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-coral-DEFAULT focus:ring-2 mb-3 transition-all"
            />
            <button
              onClick={handleAdminLogin}
              className="w-full py-2.5 bg-[#e07b2a] hover:bg-[#c96d1e] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Enter as Admin
            </button>
          </div>
        )}
      </div>

      <p className="text-white/30 text-xs mt-6">
        Contact admin if your name isn't listed
      </p>
    </div>
  )
}