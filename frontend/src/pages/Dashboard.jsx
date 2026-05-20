import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import API from '../utils/api'

const StatCard = ({ label, value, color, icon }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
)

export default function Dashboard() {
  const { id } = useParams()
  const [stats, setStats] = useState(null)
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, projRes] = await Promise.all([
          API.get(`/dashboard?projectId=${id}`),
          API.get(`/projects/${id}`)
        ])
        setStats(dashRes.data)
        setProject(projRes.data)
      } catch {
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  )

  const completionRate = stats.totalTasks
    ? Math.round((stats.tasksByStatus.done / stats.totalTasks) * 100)
    : 0

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/projects" className="hover:text-indigo-600">Projects</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link to={`/projects/${id}`} className="hover:text-indigo-600">{project?.name}</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">Dashboard</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Project Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">{project?.name} — overview of tasks and team</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Tasks"
          value={stats.totalTasks}
          color="bg-indigo-50"
          icon={<svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard
          label="Completed"
          value={stats.tasksByStatus.done}
          color="bg-green-50"
          icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
        />
        <StatCard
          label="Overdue"
          value={stats.overdueTasks}
          color="bg-red-50"
          icon={<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Team Members"
          value={stats.totalMembers}
          color="bg-purple-50"
          icon={<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Status */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-5">Tasks by Status</h3>
          <div className="space-y-4">
            {[
              { label: 'To Do', key: 'todo', color: 'bg-gray-400' },
              { label: 'In Progress', key: 'inprogress', color: 'bg-blue-500' },
              { label: 'Done', key: 'done', color: 'bg-green-500' }
            ].map(({ label, key, color }) => {
              const count = stats.tasksByStatus[key]
              const pct = stats.totalTasks ? Math.round((count / stats.totalTasks) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium text-gray-900">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Completion Rate */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overall Completion</span>
              <span className="text-lg font-bold text-gray-900">{completionRate}%</span>
            </div>
          </div>
        </div>

        {/* Tasks per User */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-5">Tasks per Member</h3>
          {stats.tasksByUser.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No assigned tasks yet</div>
          ) : (
            <div className="space-y-3">
              {stats.tasksByUser.map((item) => (
                <div key={item.user._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm shrink-0">
                    {item.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.user.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">Total: <strong>{item.total}</strong></span>
                      <span className="text-xs text-green-600">Done: <strong>{item.done}</strong></span>
                      <span className="text-xs text-blue-600">Active: <strong>{item.inprogress}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
