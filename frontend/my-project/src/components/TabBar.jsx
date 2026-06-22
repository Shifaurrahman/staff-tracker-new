export default function TabBar({ activeTab, onChange }) {
    const tabs = [
      { id: 'updates',  label: 'Updates',  icon: '📋' },
      { id: 'projects', label: 'Projects', icon: '📁' },
      { id: 'team',     label: 'Team',     icon: '👥' },
    ]
  
    return (
      <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    )
  }