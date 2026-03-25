import { useState } from 'react'
import { FileText, Layers, HelpCircle, PenSquare } from 'lucide-react'
import SummaryDisplay from './SummaryDisplay'
import FlashCards from './FlashCard'
import FAQDisplay from './FAQDisplay'
import { SkeletonCard } from './ui/Skeleton'

const TABS = [
  { id: 'summary',    label: 'Summary',    icon: FileText   },
  { id: 'flashcards', label: 'Flashcards', icon: Layers     },
  { id: 'faqs',       label: 'FAQs',       icon: HelpCircle },
  { id: 'quiz',       label: 'Mock Quiz',  icon: PenSquare  },
]

export default function ResultsTabs({ data, loadingStates }) {
  const [activeTab, setActiveTab] = useState('summary')

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 px-3
              rounded-xl text-sm font-semibold transition-all duration-200
              ${activeTab === id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'summary' && (
          <SummaryDisplay
            summary={data?.summary}
            isLoading={loadingStates?.summary}
          />
        )}
        {activeTab === 'flashcards' && (
          <FlashCards
            cards={data?.flashcards}
            isLoading={loadingStates?.flashcards}
          />
        )}
        {activeTab === 'faqs' && (
          <FAQDisplay
            faqs={data?.faqs}
            isLoading={loadingStates?.faqs}
          />
        )}
        {activeTab === 'quiz' && (
          <div className="text-center py-16 text-gray-400">
            <PenSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Mock Quiz coming in Day 4!</p>
          </div>
        )}
      </div>
    </div>
  )
}