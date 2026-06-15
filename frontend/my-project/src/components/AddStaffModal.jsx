import { useState } from 'react'
import { addStaff } from '../lib/db'
import { STAFF_COLORS } from '../lib/helpers'

export default function AddStaffModal({ existingStaff, onAdded, onClose }) {
  const [name, setName]     = useState('')
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)

  // auto-pick next color
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
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
        <h3 className="font-semibold text-gray-800 mb-1">Add Staff Member</h3>
        <p className="text-xs text-gray-400 mb-4">Only admins can add new staff.</p>

        {error && <p className="text-red-500 text-xs mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <input
          autoFocus
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Full name"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-DEFAULT mb-4 transition-all"
        />

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={saving || !name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Adding…' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}