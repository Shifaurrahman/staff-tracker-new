import { useState } from 'react'
import { addStaff, deleteStaff } from '../lib/db'
import { STAFF_COLORS, getColor } from '../lib/helpers'

export default function AddStaffModal({ existingStaff, onAdded, onDeleted, onClose }) {
  const [name, setName]         = useState('')
  const [error, setError]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmId, setConfirmId]   = useState(null)

  const nextColorIdx = existingStaff.length % STAFF_COLORS.length

  async function handleAdd() {
    const trimmed = name.trim()
    if (!trimmed) return
    const dup = existingStaff.some(s => s.name.toLowerCase() === trimmed.toLowerCase())
    if (dup) { setError('Name already exists.'); return }

    setSaving(true)
    try {
      const staff = await addStaff(trimmed, nextColorIdx)
      onAdded(staff)
      setName('')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(staffId) {
    setDeletingId(staffId)
    try {
      await deleteStaff(staffId)
      onDeleted(staffId)
      setConfirmId(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setDeletingId(null)
    }
  }

  const visibleStaff = existingStaff.filter(s => s.name !== 'Team Lead')

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
        <h3 className="font-semibold text-gray-800 mb-1">Manage Team Members</h3>
        <p className="text-xs text-gray-400 mb-4">Only Team Lead can add or remove members.</p>

        {error && (
          <p className="text-red-500 text-xs mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-2 mb-5">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="New team member name"
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-DEFAULT transition-all"
          />
          <button
            onClick={handleAdd}
            disabled={saving || !name.trim()}
            className="px-4 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-dark transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {saving ? 'Adding…' : '+ Add'}
          </button>
        </div>

        {visibleStaff.length > 0 && (
          <div className="mb-5">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">
              Current Members
            </p>
            <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {visibleStaff.map(s => {
                const c = getColor(s.color_idx)
                const isConfirming = confirmId === s.id
                const isDeleting   = deletingId === s.id

                return (
                  <li key={s.id} className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 group">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                      style={{ background: c.bg }}
                    >
                      {s.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="flex-1 text-sm text-gray-700 truncate">{s.name}</span>

                    {isConfirming ? (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[11px] text-gray-400">Remove?</span>
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={isDeleting}
                          className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-[11px] font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? '…' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-2.5 py-1 rounded-lg bg-gray-200 text-gray-600 text-[11px] font-semibold hover:bg-gray-300 transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(s.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
                        title="Remove member"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )
}