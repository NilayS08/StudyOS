export default function Badge({ children, color = 'primary' }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-600`}>
      {children}
    </span>
  )
}
