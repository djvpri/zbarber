'use client'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [stats, setStats] = useState({ today: 0, done: 0, pending: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    fetch(`/api/appointments?date=${today}`)
      .then(r => r.json())
      .then((data: any[]) => {
        setStats({
          today: data.length,
          done: data.filter((a: any) => a.status === 'DONE').length,
          pending: data.filter((a: any) => ['PENDING','CONFIRMED','IN_PROGRESS'].includes(a.status)).length,
          revenue: data.filter((a: any) => a.payment).reduce((sum: number, a: any) => sum + (a.payment?.amount || 0), 0),
        })
      }).finally(() => setLoading(false))
  }, [])

  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')
  if (loading) return <div className="p-6 text-gray-400">Memuat...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard ZBarber</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Appointment Hari Ini', value: stats.today, color: 'bg-blue-50 text-blue-700' },
          { label: 'Selesai', value: stats.done, color: 'bg-green-50 text-green-700' },
          { label: 'Menunggu', value: stats.pending, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Pendapatan Hari Ini', value: fmt(stats.revenue), color: 'bg-purple-50 text-purple-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <div className="text-sm opacity-70">{s.label}</div>
            <div className="text-2xl font-bold mt-1">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
