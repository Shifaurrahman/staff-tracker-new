import { useState } from 'react'
import { createProject, updateProject } from '../lib/db'

export default function ProjectModal({ project, onSaved, onClose }) {
  const isEdit = !!project
  const [name,        setName]        = useState(project?.name        || '')
  const [description, setDescription] = useState(project?.description || '')
  const [contextMd,   setContextMd]   = useState(project?.context_md  || '')
  const [status,      setStatus]      = useState(project?.status      || 'active')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  async function handleSave() {
    if (!name.trim()) { setError('Project name is required.'); return }
    setSaving(true)
    try {
      let saved
      if (isEdit) {
        saved = await updateProject(project.id, { name, description, context_md: contextMd, status })
      } else {
        saved = await createProject({ name, description, context_md: contextMd, status })
      }
      onSaved(saved)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setContextMd(ev.target.result)
    reader.readAsText(file)
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-scale-in flex flex-col max-h-[90vh]">
        <h3 className="font-semibold text-gray-800 mb-4">
          {isEdit ? 'Edit Project' : 'Create New Project'}
        </h3>

        {error && <p className="text-red-500 text-xs mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="overflow-y-auto flex-1 space-y-4 pr-1">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Project Name *</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="e.g. Staff Tracker v2"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-navy transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Short Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="One-line summary"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-navy transition-all"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-navy transition-all bg-white"
            >
              <option value="active">🟢 Active</option>
              <option value="on-hold">🟡 On Hold</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>

          {/* Context MD */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500">Project Context (Markdown)</label>
              <label className="text-xs text-brand-DEFAULT hover:text-brand-dark cursor-pointer font-medium">
                📎 Upload .md file
                <input type="file" accept=".md,.txt" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            <textarea
              value={contextMd}
              onChange={e => setContextMd(e.target.value)}
              placeholder="Write project context in markdown... or upload a .md file above"
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
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  )
}