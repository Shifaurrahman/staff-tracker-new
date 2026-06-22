import { useState } from 'react'
import { upsertStaffProfile, assignStaffProject, removeStaffProject } from '../lib/db'
import { getColor } from '../lib/helpers'

export default function StaffProfileModal({ member, profile, projects, assignedProjectIds, onSaved, onClose }) {
  const [bioMd,    setBioMd]    = useState(profile?.bio_md || '')
  const [assigned, setAssigned] = useState(new Set(assignedProjectIds))
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  const c = getColor(member.color_idx)

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setBioMd(ev.target.result)
    reader.readAsText(file)
  }

  function toggleProject(projectId) {
    setAssigned(prev => {
      const next = new Set(prev)
      next.has(projectId) ? next.delete(projectId) : next.add(projectId)
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      // Save bio
      const savedProfile = await upsertStaffProfile(member.id, bioMd)

      // Sync project assignments
      const toAdd    = [...assigned].filter(id => !assignedProjectIds.includes(id))
      const toRemove = assignedProjectIds.filter(id => !assigned.has(id))
      await Promise.all([
        ...toAdd.map(id => assignStaffProject(member.id, id)),
        ...toRemove.map(id => removeStaffProject(member.id, id)),
      ])

      onSaved(savedProfile, [...assigned])
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-scale-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: c.bg }}
          >
            {member.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <h3 className="font-semibold text-gray-800">{member.name}</h3>
            <p className="text-xs text-gray-400">Edit profile & project assignments</p>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="overflow-y-auto flex-1 space-y-4 pr-1">
          {/* Project assignments */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">Assigned Projects</label>
            {projects.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No projects created yet.</p>
            ) : (
              <div className="space-y-1.5">
                {projects.map(p => (
                  <label key={p.id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assigned.has(p.id)}
                      onChange={() => toggleProject(p.id)}
                      className="w-4 h-4 rounded accent-navy"
                    />
                    <span className="text-sm text-gray-700">{p.name}</span>
                    <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      p.status === 'active'    ? 'bg-green-100 text-green-700' :
                      p.status === 'on-hold'   ? 'bg-yellow-100 text-yellow-700' :
                                                 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.status}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Bio markdown */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500">Staff Profile (Markdown)</label>
              <label className="text-xs text-brand-DEFAULT hover:text-brand-dark cursor-pointer font-medium">
                📎 Upload .md file
                <input type="file" accept=".md,.txt" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            <textarea
              value={bioMd}
              onChange={e => setBioMd(e.target.value)}
              placeholder="Write staff details in markdown... skills, role, notes, etc."
              rows={10}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono outline-none focus:border-navy transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}