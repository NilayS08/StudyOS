import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotebookProvider } from './context/NotebookContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage        from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import NotebooksListPage from './pages/NotebooksListPage'
import NotebookPage     from './pages/NotebookPage'
import SummaryPage      from './pages/SummaryPage'
import FlashcardsPage   from './pages/FlashcardsPage'
import FAQPage          from './pages/FAQPage'
import QuizPage         from './pages/QuizPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotebookProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login"         element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute><NotebooksListPage /></ProtectedRoute>
              }/>
              <Route path="/notebook/:notebookId" element={
                <ProtectedRoute><NotebookPage /></ProtectedRoute>
              }/>
              <Route path="/notebook/:notebookId/summary" element={
                <ProtectedRoute><SummaryPage /></ProtectedRoute>
              }/>
              <Route path="/notebook/:notebookId/flashcards" element={
                <ProtectedRoute><FlashcardsPage /></ProtectedRoute>
              }/>
              <Route path="/notebook/:notebookId/faq" element={
                <ProtectedRoute><FAQPage /></ProtectedRoute>
              }/>
              <Route path="/notebook/:notebookId/quiz" element={
                <ProtectedRoute><QuizPage /></ProtectedRoute>
              }/>

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </NotebookProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}