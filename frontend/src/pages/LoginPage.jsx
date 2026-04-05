import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { BookOpen, Sparkles, FileText, Layers, HelpCircle, PenSquare } from 'lucide-react'

const FEATURES = [
  { icon: FileText,   label: 'AI Summaries',  desc: 'Structured summaries at any difficulty' },
  { icon: Layers,     label: 'Flashcards',    desc: 'Interactive flip cards from your notes' },
  { icon: HelpCircle, label: 'FAQ Generator', desc: 'Anticipate exam questions automatically' },
  { icon: PenSquare,  label: 'Mock Quizzes',  desc: 'MCQ, short & essay questions on demand' },
]

export default function LoginPage() {
  const { isAuthenticated, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50
      dark:from-gray-950 dark:via-violet-950 dark:to-indigo-950
      flex items-center justify-center px-4">

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">

        {/* ── Left: branding ── */}
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600
              flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">StudyOS</span>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              Study smarter,<br />
              <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                not harder.
              </span>
            </h1>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              Upload your lecture notes and let AI generate summaries, flashcards, FAQs and mock quizzes in seconds.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800
                  rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: login card ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800
          rounded-3xl shadow-xl dark:shadow-gray-900 p-8 space-y-6">

          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-900/40
              flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-violet-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Sign in to access your notebooks and study materials
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <span className="text-xs text-gray-400">Continue with</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>

          {/* Google SSO button */}
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5
              bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700
              rounded-2xl font-semibold text-gray-700 dark:text-gray-200
              hover:border-violet-400 dark:hover:border-violet-500
              hover:bg-violet-50 dark:hover:bg-violet-900/20
              transition-all duration-200 shadow-sm hover:shadow-md group">
            {/* Google G logo SVG */}
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-center text-xs text-gray-400 dark:text-gray-600">
            By signing in you agree to our Terms of Service and Privacy Policy.
            Your data is never shared with third parties.
          </p>
        </div>
      </div>
    </div>
  )
}