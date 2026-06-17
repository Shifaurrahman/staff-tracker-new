import { useState } from 'react'
import { getColor, ADMIN_PASSWORD } from '../lib/helpers'
import { addStaff, verifyPasscode } from '../lib/db'

export default function IdentityGate({ staff, onSelect }) {
  const [adminTab, setAdminTab]     = useState(false)
  const [password, setPassword]     = useState('')
  const [pwError, setPwError]       = useState(false)
  const [searching, setSearching]   = useState('')
  const [loading, setLoading]       = useState(false)

  // Passcode step
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [passcode, setPasscode]           = useState('')
  const [passcodeError, setPasscodeError] = useState(false)
  const [verifying, setVerifying]         = useState(false)

  const filtered = staff.filter(s =>
    s.name !== 'Team Lead' &&
    s.name.toLowerCase().includes(searching.toLowerCase())
  )

  function handleSelectStaff(s) {
    setSelectedStaff(s)
    setPasscode('')
    setPasscodeError(false)
  }

  async function handlePasscodeSubmit() {
    if (passcode.length !== 5) return
    setVerifying(true)
    try {
      const ok = await verifyPasscode(selectedStaff.id, passcode)
      if (!ok) {
        setPasscodeError(true)
        setPasscode('')
      } else {
        onSelect({
          id: selectedStaff.id,
          name: selectedStaff.name,
          color_idx: selectedStaff.color_idx,
          isAdmin: false,
        })
      }
    } catch (e) {
      setPasscodeError(true)
      setPasscode('')
    } finally {
      setVerifying(false)
    }
  }

  async function handleAdminLogin() {
    if (password !== ADMIN_PASSWORD) {
      setPwError(true)
      setPassword('')
      return
    }
    setLoading(true)
    try {
      let teamLead = staff.find(s => s.name === 'Team Lead')
      if (!teamLead) {
        teamLead = await addStaff('Team Lead', 4)
      }
      onSelect({
        id: teamLead.id,
        name: 'Team Lead',
        color_idx: teamLead.color_idx,
        isAdmin: true,
      })
    } catch (e) {
      setPwError(true)
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-navy flex flex-col items-center justify-center z-50 p-4">
      {/* Title */}
      <div className="mb-8 text-center animate-fade-in">
        <div className="text-4xl mb-3">📋</div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Staff Daily Updates</h1>
        <p className="text-white/50 text-sm mt-1">Arva Tech · Who are you today?</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">

        {/* ── Passcode step ── */}
        {selectedStaff ? (
          <div className="p-5">
            <button
              onClick={() => setSelectedStaff(null)}
              className="text-xs text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 transition-colors"
            >
              ← Back
            </button>

            <div className="flex items-center gap-3 mb-5">
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: getColor(selectedStaff.color_idx).bg }}
              >
                {selectedStaff.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{selectedStaff.name}</p>
                <p className="text-xs text-gray-400">Enter your 5-digit passcode</p>
              </div>
            </div>

            {passcodeError && (
              <p className="text-red-500 text-xs mb-3 bg-red-50 px-3 py-2 rounded-lg">
                ✕ Wrong passcode. Try again.
              </p>
            )}

            <input
              autoFocus
              type="password"
              inputMode="numeric"
              maxLength={5}
              value={passcode}
              onChange={e => {
                setPasscode(e.target.value.replace(/\D/g, '').slice(0, 5))
                setPasscodeError(false)
              }}
              onKeyDown={e => e.key === 'Enter' && handlePasscodeSubmit()}
              placeholder="_ _ _ _ _"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-center tracking-[0.4em] outline-none focus:border-brand-DEFAULT focus:ring-2 focus:ring-brand-light mb-3 transition-all font-mono"
            />
            <button
              onClick={handlePasscodeSubmit}
              disabled={verifying || passcode.length !== 5}
              className="w-full py-2.5 bg-navy hover:bg-navy-dark text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {verifying ? 'Verifying…' : 'Continue'}
            </button>
          </div>

        ) : (
          <>
            {/* ── Tabs ── */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setAdminTab(false)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  !adminTab ? 'text-navy border-b-2 border-navy' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                👤 I'm a Team Member
              </button>
              <button
                onClick={() => setAdminTab(true)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  adminTab ? 'text-coral-DEFAULT border-b-2 border-coral-DEFAULT' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                🔐 Team Lead
              </button>
            </div>

            {!adminTab ? (
              <div className="p-4">
                <input
                  type="text"
                  value={searching}
                  onChange={e => setSearching(e.target.value)}
                  placeholder="Search your name..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-DEFAULT focus:ring-2 focus:ring-brand-light mb-3 transition-all"
                />
                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-0.5">
                  {filtered.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-6">No team members found</p>
                  ) : (
                    filtered.map(s => {
                      const c = getColor(s.color_idx)
                      return (
                        <button
                          key={s.id}
                          onClick={() => handleSelectStaff(s)}
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
                          <span className="ml-auto text-gray-300 text-xs">→</span>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4">
                <p className="text-xs text-gray-400 mb-3">Enter Team Lead password to continue</p>
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
                  placeholder="Team Lead password"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-coral-DEFAULT focus:ring-2 mb-3 transition-all"
                />
                <button
                  onClick={handleAdminLogin}
                  disabled={loading}
                  className="w-full py-2.5 bg-[#e07b2a] hover:bg-[#c96d1e] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
                >
                  {loading ? 'Signing in…' : 'Enter as Team Lead'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <p className="text-white/30 text-xs mt-6">
        Contact Team Lead if your name isn't listed
      </p>
    </div>
  )
}