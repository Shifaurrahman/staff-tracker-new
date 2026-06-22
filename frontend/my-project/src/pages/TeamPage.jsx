import { useState } from 'react'
import { getColor } from '../lib/helpers'
import MarkdownRenderer from '../components/MarkdownRenderer'
import StaffProfileModal from '../components/StaffProfileModal'

export default function TeamPage({
  staff, profiles, projects, staffProjects,
  isAdmin, onProfileSaved
}) {
  const [selected,   setSelected]   = useState(null)
  const [editMember, setEditMember] = useState(null)

  // helper: get profile for a staff member
  function getProfile(staffId) {
    return profiles.find(p => p.staff_id === staffId) || null
  }

  // helper: get assigned project ids for a staff member
  function getAssignedIds(staffId) {
    return staffProjects.filter(sp => sp.staff_id === staffId).map(sp => sp.project_id)
  }

  // helper: get assigned project objects
  function getAssignedProjects(staffId) {
    const ids = getAssignedIds(staffId)
    return projects.filter(p => ids.includes(p.id))
  }

  const visibleStaff = staff.filter(s => s.name !== 'Team Lead')

  if (selected) {
    const profile          = getProfile(selected.id)
    const assignedProjects = getAssignedProjects(selected.id)
    const c                = getColor(selected.color_idx)

    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-3xl mx-auto w-full">
        <button
          onClick={() => setSelected(null)}
          className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 transition-colors"
        >
          ← Back to Team
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {/* Member header */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
              style={{ background: c.bg }}
            >
              {selected.name.charAt(0).toUpperCase()}
            </span>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{selected.name}</h2>
              <p className="text-sm text-gray-400">
                {assignedProjects.length > 0
                  ? assignedProjects.map(p => p.name).join(', ')
                  : 'No projects assigned'}
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setEditMember(selected)}
                className="text-xs px-3 py-1.5 rounded-lg bg-navy text-white hover:bg-navy-dark transition-colors font-medium"
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {/* Assigned projects chips */}
          {assignedProjects.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {assignedProjects.map(p => (
                <span key={p.id} className="text-xs bg-brand-light text-brand-DEFAULT font-medium px-3 py-1 rounded-full">
                  📁 {p.name}
                </span>
              ))}
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Profile</p>
            <MarkdownRenderer content={profile?.bio_md || ''} />
          </div>
        </div>

        {editMember && (
          <StaffProfileModal
            member={editMember}
            profile={getProfile(editMember.id)}
            projects={projects}
            assignedProjectIds={getAssignedIds(editMember.id)}
            onSaved={(savedProfile, newAssignedIds) => {
              onProfileSaved(savedProfile, editMember.id, newAssignedIds)
              setEditMember(null)
            }}
            onClose={() => setEditMember(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800">Team</h2>
      </div>

      {visibleStaff.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <div className="text-5xl mb-3">👥</div>
          <p className="text-[15px] font-medium text-gray-400">No team members yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visibleStaff.map(s => {
            const c                = getColor(s.color_idx)
            const assignedProjects = getAssignedProjects(s.id)

            return (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:border-navy/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: c.bg }}
                  >
                    {s.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-semibold text-gray-800 group-hover:text-navy transition-colors">
                    {s.name}
                  </span>
                </div>
                {assignedProjects.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {assignedProjects.map(p => (
                      <span key={p.id} className="text-[11px] bg-brand-light text-brand-DEFAULT font-medium px-2 py-0.5 rounded-full">
                        {p.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-300 italic">No projects assigned</p>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}