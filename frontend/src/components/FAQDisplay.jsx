import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SkeletonCard } from './ui/Skeleton'

function FAQItem({ question, answer, index }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left
          hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-50 text-primary-500
            text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="font-medium text-gray-800 text-sm">{question}</span>
        </div>
        <ChevronDown
          className={`flex-shrink-0 w-4 h-4 text-gray-400 transition-transform duration-200
            ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 border-t border-gray-50">
          <p className="text-sm text-gray-600 leading-relaxed pl-10">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQDisplay({ faqs, isLoading }) {
  if (isLoading) return <SkeletonCard />

  if (!faqs || faqs.length === 0) return (
    <div className="text-center py-16 text-gray-400">
      <p>FAQs will appear here</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
      ))}
    </div>
  )
}