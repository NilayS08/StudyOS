import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain } from 'lucide-react'
import FileUpload from '../components/FileUpload'
import { uploadDocument } from '../api/apiService'

const DIFFICULTY_OPTIONS = ['Basic', 'Intermediate', 'Advanced']

export default function UploadPage() {
  const [file, setFile]             = useState(null)
  const [difficulty, setDifficulty] = useState('Intermediate')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const navigate                    = useNavigate()

  const handleSubmit = async () => {
    if (!file) { setError('Please select a file first.'); return }
    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('difficulty', difficulty)

      const res = await uploadDocument(formData)

      // Navigate to results page with the returned doc_id
      navigate(`/results/${res.data.doc_id}`, {
        state: {
          filename:   res.data.filename,
          wordCount:  res.data.word_count,
          difficulty,
        }
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary-500 rounded-2xl shadow-lg">
              <Brain className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary-900">Smart Revision Generator</h1>
          <p className="text-gray-500 mt-2 text-lg">
            Upload your notes and get summaries, flashcards, FAQs and mock questions instantly
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">

          {/* File Upload */}
          <FileUpload onFileSelect={setFile} />

          {/* Difficulty Selector */}
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-3">Difficulty Level</p>
            <div className="flex gap-3">
              {DIFFICULTY_OPTIONS.map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`
                    flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-150
                    ${difficulty === level
                      ? 'border-primary-500 bg-primary-500 text-white shadow-md'
                      : 'border-gray-200 text-gray-500 hover:border-primary-300'
                    }
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className={`
              w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200
              ${file && !loading
                ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Uploading...
              </span>
            ) : 'Generate Revision Kit ✨'}
          </button>
        </div>
      </div>
    </div>
  )
}