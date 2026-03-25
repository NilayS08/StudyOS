import ReactMarkdown from 'react-markdown'
import { SkeletonCard } from './ui/Skeleton'
import { FileText, Copy, CheckCheck } from 'lucide-react'
import { useState } from 'react'

export default function SummaryDisplay({ summary, isLoading }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) return <SkeletonCard />

  if (!summary) return (
    <div className="text-center py-16 text-gray-400">
      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>Your summary will appear here</p>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-800">Summary</h3>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary-500 transition-colors"
        >
          {copied
            ? <><CheckCheck className="w-4 h-4 text-green-500" /> Copied!</>
            : <><Copy className="w-4 h-4" /> Copy</>
          }
        </button>
      </div>

      {/* Markdown content */}
      <div className="px-6 py-5 prose prose-sm max-w-none
        prose-headings:text-primary-900 prose-headings:font-bold
        prose-p:text-gray-600 prose-p:leading-relaxed
        prose-li:text-gray-600 prose-strong:text-gray-800
        prose-h2:text-lg prose-h3:text-base">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
    </div>
  )
}