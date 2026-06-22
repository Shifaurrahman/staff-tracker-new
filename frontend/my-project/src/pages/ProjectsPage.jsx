import { useState } from 'react'
import { deleteProject } from '../lib/db'
import MarkdownRenderer from '../components/MarkdownRenderer'
import ProjectModal from '../components/ProjectModal'

const STATUS_STYLES = {
  'active':    { dot: '🟢', bg: 'bg-green-100',  text: 'text-green-700'  },
  'on-hold':   { dot: '🟡', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'completed': { dot: '✅', bg: 'bg-gray-100',   text: 'text-gray-500'   },
}

export default function ProjectsPage({ projects, isAdmin, onProjectsChanged }) {
  const [selected,    setSelected]    = useState(null)   // viewing detail
  const [editProject, setEditProject] = useState(null)   // null=closed, 'new'=create, obj=edit
  const [confirmDel,  setConfirmDel]  = useState(null)
  const [deleting,    setDeleting]    = useState(false)

  async function handleDelete(projectId) {
    setDeleting(true)
    try {
      await deleteProject(projectId)
      onProjectsChanged(prev => prev.filter(p => p.id !== projectId))
      if (selected?.id === projectId) setSelected(null)
      setConfirmDel(null)
    } catch (e) {
      alert('Failed: ' + e.message)
    } finally {
      setDeleting(false)
    }
  }

  function handleSaved(saved) {
    onProjectsChanged(prev => {
      const exists = prev.find(p => p.id === saved.id)
      return exists ? prev.map(p => p.id === saved.id ? saved : p) : [saved, ...prev]
    })
    setEditProject(null)
    setSelected(saved)
  }

  if (selected) {
    const s = STATUS_STYLES[selected.status] || STATUS_STYLES['active']
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-3xl mx-auto w-full">
        <button
          onClick={() => setSelected(null)}
          className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 transition-colors"
        >
          ← Back to Projects
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-xl font-bold text-gray-800">{selected.name}</h2>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${s.bg} ${s.text}`}>
              {s.dot} {selected.status}
            </span>
          </div>
          {selected.description && (
            <p className="text-sm text-gray-500 mb-4">{selected.description}</p>
          )}

          {isAdmin && (
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => setEditProject(selected)}
                className="text-xs px-3 py-1.5 rounded-lg bg-navy text-white hover:bg-navy-dark transition-colors font-medium"
              >
                ✏️ Edit
              </button>
              {confirmDel === selected.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Delete project?</span>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    disabled={deleting}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
                  >
                    {deleting ? '…' : 'Yes, delete'}
                  </button>
                  <button
                    onClick={() => setConfirmDel(null)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDel(selected.id)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors font-medium"
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Project Context</p>
            <MarkdownRenderer content={selected.context_md} />
          </div>
        </div>

        {editProject && (
          <ProjectModal
            project={editProject === 'new' ? null : editProject}
            onSaved={handleSaved}
            onClose={() => setEditProject(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800">Projects</h2>
        {isAdmin && (
          <button
            onClick={() => setEditProject('new')}
            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl bg-navy text-white hover:bg-navy-dark transition-colors font-medium"
          >
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <div className="text-5xl mb-3">📁</div>
          <p className="text-[15px] font-medium text-gray-400">No projects yet</p>
          {isAdmin && <p className="text-sm text-gray-300 mt-1">Click "+ New Project" to get started</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(p => {
            const s = STATUS_STYLES[p.status] || STATUS_STYLES['active']
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:border-navy/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 group-hover:text-navy transition-colors truncate">
                      {p.name}
                    </p>
                    {p.description && (
                      <p className="text-sm text-gray-400 mt-0.5 truncate">{p.description}</p>
                    )}
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${s.bg} ${s.text}`}>
                    {s.dot} {p.status}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {editProject && (
        <ProjectModal
          project={editProject === 'new' ? null : editProject}
          onSaved={handleSaved}
          onClose={() => setEditProject(null)}
        />
      )}
    </div>
  )
}