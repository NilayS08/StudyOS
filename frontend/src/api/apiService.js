import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

// Attach JWT to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const uploadDocument  = (formData)      => API.post('/api/upload', formData)
export const getSummary      = (docId, level)  => API.post('/api/summarize', { doc_id: docId, difficulty: level })
export const getFlashcards   = (docId)         => API.post('/api/flashcards', { doc_id: docId })
export const getFAQs         = (docId)         => API.post('/api/faq', { doc_id: docId })
export const getMockQuiz     = (docId, type)   => API.post('/api/mock-quiz', { doc_id: docId, question_type: type })
export const getHistory      = ()              => API.get('/api/history')
export const submitFeedback  = (data)          => API.post('/api/feedback', data)
export const getMetrics      = ()              => API.get('/api/metrics')
export const login           = (creds)         => API.post('/api/login', creds)
export const register        = (creds)         => API.post('/api/register', creds)