import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Loader2, RefreshCw, Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ToolPageLayout({
  title,
  icon: Icon,
  iconColor = 'text-violet-500',
  iconBg = 'bg-violet-50',
  docName,
  isLoading,
  isError,
  onRetry,
  children,
  headerRight,
}) {
  const navigate = useNavigate()
  const { notebookId } = useParams()
  const { darkMode, toggleDarkMode } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-violet-500 dark:hover:text-violet-400 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
        <div className={`p-1.5 rounded-lg ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-800 dark:text-white">{title}</h1>
          {docName && <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">{docName}</p>}
        </div>
        <div className="flex-1" />
        {headerRight}
        <button onClick={toggleDarkMode}
          className="p-2 rounded-xl border border-gray-200 dark:border-gray-700
            hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center">
                <Icon className={`w-7 h-7 ${iconColor}`} />
              </div>
              <Loader2 className="absolute -top-1 -right-1 w-5 h-5 text-violet-500 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Generating {title}...</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This may take a few seconds</p>
            </div>
            <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full
                animate-[loading_2s_ease-in-out_infinite]" style={{
                  animation: 'loading 1.5s ease-in-out infinite',
                  backgroundSize: '200% 100%',
                }} />
            </div>
            <style>{`
              @keyframes loading {
                0% { width: 0%; margin-left: 0% }
                50% { width: 70%; margin-left: 15% }
                100% { width: 0%; margin-left: 100% }
              }
            `}</style>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
              <Icon className="w-7 h-7 text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Something went wrong</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Make sure the backend is running and try again.</p>
            </div>
            {onRetry && (
              <button onClick={onRetry}
                className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white
                  text-sm font-semibold rounded-xl hover:bg-violet-600 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
                Try Again
              </button>
            )}
          </div>
        )}

        {!isLoading && !isError && children}
      </main>
    </div>
  )
}