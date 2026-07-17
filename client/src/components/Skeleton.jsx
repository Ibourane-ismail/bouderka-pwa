const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
)

export const SkeletonText = ({ className = '' }) => (
  <div className={`skeleton-text ${className}`} />
)

export const SkeletonTitle = ({ className = '' }) => (
  <div className={`skeleton-title ${className}`} />
)

export const SkeletonCard = ({ className = '' }) => (
  <div className={`skeleton-card ${className}`} />
)

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <SkeletonText className="flex-1" />
        <SkeletonText className="w-1/4" />
        <SkeletonText className="w-1/4" />
      </div>
    ))}
  </div>
)

export default Skeleton
