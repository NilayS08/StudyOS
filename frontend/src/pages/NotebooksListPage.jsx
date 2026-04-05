import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotebooks } from '../context/NotebookContext'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Plus, Trash2, Clock, FileText, Edit2, Check, X, Moon, Sun, LogOut } from 'lucide-react'

// ── Notebook card ────────────────────────────────────────────────────────
function NotebookCard({ notebook, onOpen, onDelete, onRename }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(notebook.name)

  const confirmRename = () => {
    if (name.trim()) onRename(notebook.id, name.trim())
    setEditing(false)
  }

  const timeAgo = (ts) => {
    const diff = Date.now() - ts
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div
      className="group relative bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700
        hover:shadow-lg hover:shadow-violet-50 dark:hover:shadow-violet-950
        transition-all duration-200 cursor-pointer"
      onClick={() => !editing && onOpen(notebook.id)}
    >
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r
        from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-violet-50 dark:bg-violet-900/30 rounded-xl
          group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 transition-colors">
          <BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}>
          <button onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
              text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(notebook.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30
              text-gray-400 hover:text-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="flex items-center gap-2 mb-3" onClick={e => e.stopPropagation()}>
          <input value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && confirmRename()}
            className="flex-1 text-sm font-semibold border border-violet-300 rounded-lg px-2 py-1
              outline-none focus:ring-2 focus:ring-violet-200 dark:bg-gray-800
              dark:border-violet-700 dark:text-white"
            autoFocus />
          <button onClick={confirmRename} className="text-green-500 hover:text-green-600">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => { setName(notebook.name); setEditing(false) }}
            className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 text-sm leading-snug line-clamp-2">
          {notebook.name}
        </h3>
      )}

      <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <FileText className="w-3 h-3" />
          {notebook.documents.length} source{notebook.documents.length !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo(notebook.createdAt)}
        </span>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function NotebooksListPage() {
  const { notebooks, createNotebook, deleteNotebook, renameNotebook } = useNotebooks()
  const { user, logout, darkMode, toggleDarkMode } = useAuth()
  const navigate = useNavigate()

  const handleNew = () => {
    const nb = createNotebook()
    navigate(`/notebook/${nb.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Top nav */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800
        px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600
            flex items-center justify-center shadow-sm">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">StudyOS</span>
        </div>

        {/* Right side: dark mode + user + logout */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700
              hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User avatar + name */}
          {user && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl
              bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              {user.picture ? (
                <img src={user.picture} alt={user.name}
                  className="w-6 h-6 rounded-full ring-2 ring-violet-200 dark:ring-violet-800" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center
                  text-white text-xs font-bold">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                {user.name?.split(' ')[0]}
              </span>
            </div>
          )}

          {/* Logout */}
          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
              text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400
              hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-700
              hover:border-red-200 dark:hover:border-red-800 transition-all">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {user ? `Welcome back, ${user.name?.split(' ')[0]} 👋` : 'Your Notebooks'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Upload documents, chat with your sources, and generate study materials.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Create new */}
          <button onClick={handleNew}
            className="flex flex-col items-center justify-center gap-3 p-6
              border-2 border-dashed border-violet-200 dark:border-violet-800 rounded-2xl
              hover:border-violet-400 dark:hover:border-violet-600
              hover:bg-violet-50 dark:hover:bg-violet-900/20
              transition-all duration-200
              text-violet-500 dark:text-violet-400 hover:text-violet-600
              min-h-[160px] group">
            <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/30
              group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold">New Notebook</span>
          </button>

          {notebooks.map(nb => (
            <NotebookCard
              key={nb.id}
              notebook={nb}
              onOpen={(id) => navigate(`/notebook/${id}`)}
              onDelete={deleteNotebook}
              onRename={renameNotebook}
            />
          ))}
        </div>

        {notebooks.length === 0 && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-600">
            <p className="text-sm">Create your first notebook to get started →</p>
          </div>
        )}
      </main>
    </div>
  )
}