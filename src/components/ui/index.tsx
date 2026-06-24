import { getInitials, getAvatarColor } from '@/lib/utils'
import { MemberStatus } from '@/types'

// --- Avatar ---
export function Avatar({ name, size = 'md', photoUrl }: { name: string, size?: 'sm' | 'md' | 'lg', photoUrl?: string }) {
  const sizeClass = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-14 h-14 text-lg' }[size]
  if (photoUrl) {
    return <img src={photoUrl} alt={name} className={`${sizeClass} rounded-full object-cover`} />
  }
  return (
    <div className={`${sizeClass} ${getAvatarColor(name)} rounded-full flex items-center justify-center font-medium flex-shrink-0`}>
      {getInitials(name)}
    </div>
  )
}

// --- Status Badge ---
const statusConfig: Record<string, { label: string; className: string }> = {
  active:    { label: 'Aktif',      className: 'bg-green-100 text-green-800' },
  trial:     { label: 'Trial',      className: 'bg-amber-100 text-amber-800' },
  expired:   { label: 'Expired',    className: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Dibatalkan', className: 'bg-gray-100 text-gray-600' },
}

export function StatusBadge({ status }: { status?: MemberStatus | string }) {
  const cfg = statusConfig[status ?? ''] ?? { label: 'Tidak aktif', className: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

// --- Stat Card ---
export function StatCard({ label, value, sub, subColor }: { label: string; value: string | number; sub?: string; subColor?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="text-xs uppercase tracking-wide text-gray-400 font-medium">{label}</div>
      <div className="text-2xl font-medium text-gray-900 mt-1">{value}</div>
      {sub && <div className={`text-xs mt-0.5 ${subColor ?? 'text-gray-400'}`}>{sub}</div>}
    </div>
  )
}

// --- Card wrapper ---
export function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-xl p-4 ${className}`}>
      {children}
    </div>
  )
}

// --- Page header ---
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-lg font-medium text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// --- Loading spinner ---
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  )
}

// --- Empty state ---
export function Empty({ icon, title, desc }: { icon: React.ReactNode; title: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-gray-300 mb-3">{icon}</div>
      <div className="text-sm font-medium text-gray-500">{title}</div>
      {desc && <div className="text-xs text-gray-400 mt-1 max-w-xs">{desc}</div>}
    </div>
  )
}
