import { useParams, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSummary, getFlashcards, getFAQs } from '../api/apiService'
import ResultsTabs from '../components/ResultsTabs'
import ProgressBar from '../components/ui/ProgressBar'
import { FileText, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ResultsPage() {
  const { docId }  = useParams()
  const { state }  = useLocation()
  const difficulty = state?.difficulty || 'Intermediate'
  const filename   = state?.filename   || 'Document'
  const wordCount  = state?.wordCount  || 0

  // React Query — each tab fetches independently and caches its result
  const summaryQuery = useQuery({
    queryKey: ['summary', docId],
    queryFn:  () => getSummary(docId, difficulty).then(r => r.data),
    staleTime: Infinity,   // never refetch automatically
  })

  const flashcardsQuery = useQuery({
    queryKey: ['flashcards', docId],
    queryFn:  () => getFlashcards(docId).then(r => r.data),
    staleTime: Infinity,
  })

  const faqsQuery = useQuery({
    queryKey: ['faqs', docId],
    queryFn:  () => getFAQs(docId).then(r => r.data),
    staleTime: Infinity,
  })

  const anyLoading = summaryQuery.isLoading || flashcardsQuery.isLoading || faqsQuery.isLoading

  const data = {
    summary:    summaryQuery.data?.summary,
    flashcards: flashcardsQuery.data?.flashcards,
    faqs:       faqsQuery.data?.faqs,
  }

  const loadingStates = {
    summary:    summaryQuery.isLoading,
    flashcards: flashcardsQuery.isLoading,
    faqs:       faqsQuery.isLoading,
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400
          hover:text-primary-500 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Upload
        </Link>

        {/* Document info card */}
        <div className="bg-white rounded-2xl shadow-sm px-6 py-4 flex items-center gap-4">
          <div className="p-3 bg-primary-50 rounded-xl">
            <FileText className="w-6 h-6 text-primary-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">{filename}</p>
            <p className="text-sm text-gray-400">{wordCount.toLocaleString()} words · {difficulty}</p>
          </div>
          <span className="text-xs font-medium px-3 py-1 bg-green-50 text-green-600 rounded-full">
            Ready
          </span>
        </div>

        {/* Progress bar — shows while any query is loading */}
        <ProgressBar
          isLoading={anyLoading}
          label="Generating your revision kit..."
        />

        {/* Error state */}
        {(summaryQuery.isError || flashcardsQuery.isError || faqsQuery.isError) && (
          <div className="bg-red-50 text-red-600 rounded-2xl px-5 py-4 text-sm">
            Something went wrong generating your content. Make sure the backend is running and try again.
          </div>
        )}

        {/* Results tabs */}
        <ResultsTabs data={data} loadingStates={loadingStates} />
      </div>
    </div>
  )
}