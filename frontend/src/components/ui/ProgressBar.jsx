import { useEffect, useState } from 'react'

export default function ProgressBar({ isLoading, label = 'Generating...' }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setProgress(0)
      return
    }

    setProgress(10)
    const intervals = [
      setTimeout(() => setProgress(30), 800),
      setTimeout(() => setProgress(55), 2000),
      setTimeout(() => setProgress(75), 4000),
      setTimeout(() => setProgress(90), 7000),
    ]
    return () => intervals.forEach(clearTimeout)
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-gray-500">
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-primary-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          {label}
        </span>
        <span className="font-medium text-primary-500">{progress}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full bg-primary-500 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}