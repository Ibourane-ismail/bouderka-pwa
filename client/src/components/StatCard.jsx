const StatCard = ({ title, value, subtitle, icon, trend, className = '' }) => (
  <div className={`stat-card ${className}`}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      {icon && (
        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      )}
    </div>
    <p className="text-3xl font-extrabold tracking-tight text-gray-900">{value}</p>
    {subtitle && (
      <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
    )}
    {trend && (
      <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          {trend > 0
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          }
        </svg>
        {Math.abs(trend)}%
      </div>
    )}
  </div>
)

export default StatCard
