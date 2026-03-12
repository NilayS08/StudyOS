import { Link } from 'react-router-dom'
import { Brain } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <Brain className="w-6 h-6 text-primary-500" />
        <span className="font-bold text-primary-900">Smart Revision Generator</span>
      </Link>
      <div className="flex gap-4 text-sm font-medium text-gray-500">
        <Link to="/history" className="hover:text-primary-500">History</Link>
        <Link to="/metrics" className="hover:text-primary-500">Metrics</Link>
      </div>
    </nav>
  )
}