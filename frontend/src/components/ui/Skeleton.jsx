export function SkeletonLine({ width = 'w-full', height = 'h-4' }) {
  return (
    <div className={`${width} ${height} bg-gray-200 rounded-full animate-pulse`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
      <SkeletonLine width="w-1/3" height="h-5" />
      <SkeletonLine width="w-full" />
      <SkeletonLine width="w-full" />
      <SkeletonLine width="w-4/5" />
      <div className="pt-2 space-y-3">
        <SkeletonLine width="w-full" />
        <SkeletonLine width="w-3/4" />
        <SkeletonLine width="w-full" />
      </div>
    </div>
  )
}

export function SkeletonFlashcard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
          <SkeletonLine width="w-2/3" height="h-5" />
          <SkeletonLine width="w-full" />
          <SkeletonLine width="w-4/5" />
        </div>
      ))}
    </div>
  )
}