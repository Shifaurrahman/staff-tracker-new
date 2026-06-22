import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchStaff, fetchMessages, fetchProjects, fetchStaffProfiles, fetchStaffProjects, subscribeToChanges } from './lib/db'
import { getWeekBounds } from './lib/helpers'
import { useIdentity } from './hooks/useIdentity'

import IdentityGate  from './components/IdentityGate'
import Header        from './components/Header'
import TabBar        from './components/TabBar'
import AddStaffModal from './components/AddStaffModal'
import MessageInput  from './components/MessageInput'
import WeekNav       from './components/WeekNav'
import MessageFeed   from './components/MessageFeed'
import ProjectsPage  from './pages/ProjectsPage'
import TeamPage      from './pages/TeamPage'

export default function App() {
  const { identity, setIdentity, clearIdentity, loaded } = useIdentity()

  const [staff,         setStaff]         = useState([])
  const [messages,      setMessages]      = useState([])
  const [projects,      setProjects]      = useState([])
  const [profiles,      setProfiles]      = useState([])
  const [staffProjects, setStaffProjects] = useState([])
  const [weekOffset,    setWeekOffset]    = useState(0)
  const [loading,       setLoading]       = useState(true)
  const [showAddStaff,  setShowAddStaff]  = useState(false)
  const [activeTab,     setActiveTab]     = useState('updates')
  const feedRef = useRef(null)

  // Load staff
  useEffect(() => {
    fetchStaff().then(setStaff).catch(console.error)
  }, [])

  // Load projects + profiles + staff-project assignments
  useEffect(() => {
    fetchProjects().then(setProjects).catch(console.error)
    fetchStaffProfiles().then(setProfiles).catch(console.error)
    fetchStaffProjects().then(setStaffProjects).catch(console.error)
  }, [])

  // Load messages for current week
  const loadMessages = useCallback(async () => {
    setLoading(true)
    try {
      const { start, end } = getWeekBounds(weekOffset)
      const data = await fetchMessages(start, end)
      setMessages(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [weekOffset])

  useEffect(() => { loadMessages() }, [loadMessages])

  useEffect(() => {
    const unsub = subscribeToChanges(() => loadMessages())
    return unsub
  }, [loadMessages])

  useEffect(() => {
    if (weekOffset === 0 && feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [messages, weekOffset])

  function handleWeekChange(delta) {
    const next = weekOffset + delta
    if (next > 0) return
    setWeekOffset(next)
  }

  function handleStaffAdded(newStaff) {
    setStaff(prev => [...prev, newStaff])
  }

  function handleStaffDeleted(staffId) {
    setStaff(prev => prev.filter(s => s.id !== staffId))
    if (identity?.id === staffId) clearIdentity()
  }

  function handleStaffUpdated(updatedStaff) {
    setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s))
  }

  function handleMessageDeleted(messageId) {
    setMessages(prev => prev.filter(m => m.id !== messageId))
  }

  function handleProfileSaved(savedProfile, staffId, newAssignedIds) {
    // Update profiles
    setProfiles(prev => {
      const exists = prev.find(p => p.staff_id === staffId)
      return exists
        ? prev.map(p => p.staff_id === staffId ? savedProfile : p)
        : [...prev, savedProfile]
    })
    // Update staff-project assignments
    setStaffProjects(prev => {
      const others = prev.filter(sp => sp.staff_id !== staffId)
      const newLinks = newAssignedIds.map(pid => ({ staff_id: staffId, project_id: pid }))
      return [...others, ...newLinks]
    })
  }

  if (!loaded) {
    return (
      <div className="fixed inset-0 bg-navy flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading…</div>
      </div>
    )
  }

  if (!identity) {
    return <IdentityGate staff={staff} onSelect={setIdentity} />
  }

  return (
    <div className="flex flex-col h-screen bg-[#f5f6fa] overflow-hidden">
      <Header
        identity={identity}
        onSwitchIdentity={clearIdentity}
        onAddStaff={() => setShowAddStaff(true)}
      />

      <TabBar activeTab={activeTab} onChange={setActiveTab} />

      {/* Updates tab */}
      {activeTab === 'updates' && (
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden md:flex flex-col w-[380px] min-w-[320px] border-r border-gray-200 bg-white overflow-y-auto">
            <MessageInput
              identity={identity}
              onSent={() => { setWeekOffset(0); loadMessages() }}
            />
            <div className="flex-1 p-5">
              <p className="text-xs text-gray-300 font-medium uppercase tracking-widest mb-3">This week</p>
              <WeekStatsPanel messages={messages} staff={staff} />
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <WeekNav
              weekOffset={weekOffset}
              onChangeWeek={handleWeekChange}
              count={messages.length}
            />
            <div className="md:hidden flex-shrink-0">
              <MessageInput
                identity={identity}
                onSent={() => { setWeekOffset(0); loadMessages() }}
              />
            </div>
            <div ref={feedRef} className="flex-1 overflow-y-auto">
              <MessageFeed
                messages={messages}
                isAdmin={identity.isAdmin}
                currentStaffId={identity.id}
                loading={loading}
                onReplied={loadMessages}
                onDeleted={handleMessageDeleted}
              />
            </div>
          </div>
        </div>
      )}

      {/* Projects tab */}
      {activeTab === 'projects' && (
        <div className="flex flex-1 overflow-hidden">
          <ProjectsPage
            projects={projects}
            isAdmin={identity.isAdmin}
            onProjectsChanged={setProjects}
          />
        </div>
      )}

      {/* Team tab */}
      {activeTab === 'team' && (
        <div className="flex flex-1 overflow-hidden">
          <TeamPage
            staff={staff}
            profiles={profiles}
            projects={projects}
            staffProjects={staffProjects}
            isAdmin={identity.isAdmin}
            onProfileSaved={handleProfileSaved}
          />
        </div>
      )}

      {showAddStaff && identity.isAdmin && (
        <AddStaffModal
          existingStaff={staff}
          onAdded={handleStaffAdded}
          onDeleted={handleStaffDeleted}
          onUpdated={handleStaffUpdated}
          onClose={() => setShowAddStaff(false)}
        />
      )}
    </div>
  )
}

function WeekStatsPanel({ messages, staff }) {
  if (!messages.length) return (
    <p className="text-xs text-gray-300 italic">No updates posted yet this week.</p>
  )
  const counts = {}
  messages.forEach(m => { counts[m.staff_name] = (counts[m.staff_name] || 0) + 1 })
  return (
    <div className="space-y-2">
      {Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
        <div key={name} className="flex items-center justify-between">
          <span className="text-sm text-gray-600 truncate">{name}</span>
          <span className="text-xs font-semibold text-brand-DEFAULT bg-brand-light px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
            {count} update{count > 1 ? 's' : ''}
          </span>
        </div>
      ))}
    </div>
  )
}