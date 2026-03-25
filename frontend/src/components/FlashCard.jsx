import { useState } from 'react'
import { SkeletonFlashcard } from './ui/Skeleton'
import { RotateCcw } from 'lucide-react'

function SingleCard({ term, definition }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="cursor-pointer h-48"
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-white rounded-2xl shadow-sm border border-gray-100
            flex flex-col items-center justify-center p-6 text-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-xs font-semibold text-primary-400 uppercase tracking-widest mb-3">Term</p>
          <p className="text-lg font-bold text-gray-800">{term}</p>
          <p className="text-xs text-gray-400 mt-4">Click to reveal definition</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-primary-500 rounded-2xl shadow-sm
            flex flex-col items-center justify-center p-6 text-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <p className="text-xs font-semibold text-primary-100 uppercase tracking-widest mb-3">Definition</p>
          <p className="text-base text-white leading-relaxed">{definition}</p>
        </div>
      </div>
    </div>
  )
}

export default function FlashCards({ cards, isLoading }) {
  const [allFlipped, setAllFlipped] = useState(false)

  if (isLoading) return <SkeletonFlashcard />

  if (!cards || cards.length === 0) return (
    <div className="text-center py-16 text-gray-400">
      <p>Flashcards will appear here</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{cards.length} flashcards · click any card to flip</p>
        <button
          onClick={() => setAllFlipped(!allFlipped)}
          className="flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-600 font-medium"
        >
          <RotateCcw className="w-4 h-4" /> Reset all
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <SingleCard key={i} term={card.term} definition={card.definition} />
        ))}
      </div>
    </div>
  )
}