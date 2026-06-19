import { Link } from 'react-router-dom'

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionTo }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && (
        <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-5">
          <Icon size={36} className="text-primary-400" />
        </div>
      )}
      <h2 className="text-xl font-bold text-gray-700 mb-2">{title}</h2>
      {description && <p className="text-gray-500 text-sm mb-6 max-w-xs">{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
