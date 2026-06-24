import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { MemberStatus } from '@/types'

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM yyyy', { locale: id })
}

export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM yyyy HH:mm', { locale: id })
}

export function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), 'HH:mm', { locale: id })
}

export function timeAgo(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: id })
}

export function getStatusColor(status: MemberStatus | undefined): string {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'trial': return 'bg-amber-100 text-amber-800'
    case 'expired': return 'bg-red-100 text-red-800'
    case 'cancelled': return 'bg-gray-100 text-gray-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

export function getStatusLabel(status: MemberStatus | undefined): string {
  switch (status) {
    case 'active': return 'Aktif'
    case 'trial': return 'Trial'
    case 'expired': return 'Expired'
    case 'cancelled': return 'Dibatalkan'
    default: return 'Tidak aktif'
  }
}

export function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export function getAvatarColor(name: string): string {
  const colors = [
    'bg-purple-100 text-purple-700',
    'bg-teal-100 text-teal-700',
    'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700',
    'bg-blue-100 text-blue-700',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

export function generateReceiptNumber(): string {
  const now = new Date()
  const ts = now.getFullYear().toString().slice(2) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `RCP-${ts}-${rand}`
}
