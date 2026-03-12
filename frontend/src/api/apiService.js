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

export const uploadDocument  = (formData)      => API.post('/upload', formData)
export const getSummary      = (docId, level)  => API.post('/summarize', { doc_id: docId, difficulty: level })
export const getFlashcards   = (docId)         => API.post('/flashcards', { doc_id: docId })
export const getFAQs         = (docId)         => API.post('/faq', { doc_id: docId })
export const getMockQuiz     = (docId, type)   => API.post('/mock-quiz', { doc_id: docId, question_type: type })
export const getHistory      = ()              => API.get('/history')
export const submitFeedback  = (data)          => API.post('/feedback', data)
export const getMetrics      = ()              => API.get('/metrics')
export const login           = (creds)         => API.post('/login', creds)
export const register        = (creds)         => API.post('/register', creds)