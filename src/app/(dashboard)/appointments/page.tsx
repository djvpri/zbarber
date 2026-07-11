'use client'
import { useEffect, useState } from 'react'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Menunggu', CONFIRMED: 'Dikonfirmasi',
  IN_PROGRESS: 'Sedang Diproses', DONE: 'Selesai', CANCELLED: 'Dibatalkan',
}
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  DONE: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
}

export default function AppointmentsPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetch(`/api/appointments?date=${date}`)
      .then(r => r.json())
      .then(setAppointments)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [date])

  const updateStatus = async (id: string, status: string, paymentMethod?: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, paymentMethod }),
    })
    load()
  }

  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Appointment</h1>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />
      </div>
      {loading ? (
        <div className="text-gray-400">Memuat...</div>
      ) : appointments.length === 0 ? (
        <div className="text-center text-gray-400 py-12">Tidak ada appointment untuk tanggal ini</div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a: any) => (
            <div key={a.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{a.customer?.name}</div>
                  <div className="text-sm text-gray-500">{a.customer?.phone}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Barber: {a.barber?.name} · {new Date(a.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm mt-1">
                    {a.items?.map((it: any) => it.service?.name).join(', ')}
                  </div>
                  <div className="text-sm font-semibold text-indigo-600 mt-1">{fmt(a.totalPrice)}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[a.status]}`}>
                  {STATUS_LABEL[a.status]}
                </span>
              </div>
              {a.status !== 'DONE' && a.status !== 'CANCELLED' && (
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  {a.status === 'PENDING' && (
                    <button onClick={() => updateStatus(a.id, 'CONFIRMED')}
                      className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg">Konfirmasi</button>
                  )}
                  {a.status === 'CONFIRMED' && (
                    <button onClick={() => updateStatus(a.id, 'IN_PROGRESS')}
                      className="text-xs px-3 py-1 bg-purple-600 text-white rounded-lg">Mulai</button>
                  )}
                  {a.status === 'IN_PROGRESS' && (
                    <button onClick={() => updateStatus(a.id, 'DONE', 'CASH')}
                      className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg">Selesai (Tunai)</button>
                  )}
                  {a.status === 'IN_PROGRESS' && (
                    <button onClick={() => updateStatus(a.id, 'DONE', 'QRIS')}
                      className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg">Selesai (QRIS)</button>
                  )}
                  <button onClick={() => updateStatus(a.id, 'CANCELLED')}
                    className="text-xs px-3 py-1 bg-gray-200 text-gray-600 rounded-lg">Batal</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
