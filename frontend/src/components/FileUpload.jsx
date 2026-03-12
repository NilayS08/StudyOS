import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, X, CheckCircle } from 'lucide-react'

const ALLOWED_TYPES = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
}
const MAX_SIZE_MB = 20

export default function FileUpload({ onFileSelect }) {
  const [isDragging, setIsDragging]   = useState(false)
  const [file, setFile]               = useState(null)
  const [error, setError]             = useState('')
  const inputRef                      = useRef(null)

  const validateAndSet = useCallback((selectedFile) => {
    setError('')

    if (!selectedFile) return

    if (!ALLOWED_TYPES[selectedFile.type]) {
      setError('Unsupported file type. Please upload a PDF, DOCX, or PPTX.')
      return
    }

    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`)
      return
    }

    setFile(selectedFile)
    onFileSelect(selectedFile)
  }, [onFileSelect])

  // ── Drag events ────────────────────────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false) }
  const onDrop      = (e) => {
    e.preventDefault()
    setIsDragging(false)
    validateAndSet(e.dataTransfer.files[0])
  }

  const onInputChange = (e) => validateAndSet(e.target.files[0])

  const removeFile = (e) => {
    e.stopPropagation()
    setFile(null)
    setError('')
    onFileSelect(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const formatSize = (bytes) => {
    if (bytes < 1024)       return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase()
    const colors = { pdf: 'text-red-500', docx: 'text-blue-500', pptx: 'text-orange-500' }
    return colors[ext] || 'text-gray-500'
  }

  return (
    <div className="w-full">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200
          ${file
            ? 'border-primary-500 bg-primary-50 cursor-default'
            : 'cursor-pointer hover:border-primary-400 hover:bg-primary-50'
          }
          ${isDragging
            ? 'border-primary-500 bg-primary-50 scale-[1.02]'
            : 'border-gray-300 bg-white'
          }
          ${error ? 'border-red-400 bg-red-50' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.pptx"
          onChange={onInputChange}
          className="hidden"
        />

        {/* ── No file selected ── */}
        {!file && (
          <div className="flex flex-col items-center gap-4">
            <div className={`
              p-4 rounded-full transition-colors duration-200
              ${isDragging ? 'bg-primary-100' : 'bg-gray-100'}
            `}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                {isDragging ? 'Drop it here!' : 'Drag & drop your file here'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                or <span className="text-primary-500 font-medium underline">click to browse</span>
              </p>
            </div>
            <div className="flex gap-2 mt-1">
              {['PDF', 'DOCX', 'PPTX'].map((type) => (
                <span key={type} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-500">
                  {type}
                </span>
              ))}
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-500">
                Max 20MB
              </span>
            </div>
          </div>
        )}

        {/* ── File selected ── */}
        {file && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className={`w-10 h-10 flex-shrink-0 ${getFileIcon(file.name)}`} />
              <div className="text-left">
                <p className="font-semibold text-gray-800 truncate max-w-xs">{file.name}</p>
                <p className="text-sm text-gray-400">{formatSize(file.size)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <button
                onClick={removeFile}
                className="p-1 hover:bg-red-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Error message ── */}
      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
          <X className="w-4 h-4" /> {error}
        </p>
      )}
    </div>
  )
}