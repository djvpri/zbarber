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
const PAYMENT_LABEL: Record<string, string> = {
  CASH: 'Tunai', QRIS: 'QRIS', TRANSFER: 'Transfer',
}

export default function AppointmentsPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [printAppt, setPrintAppt] = useState<any>(null)

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

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #struk-print, #struk-print * { visibility: visible !important; }
          #struk-print {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            padding: 24px !important;
            background: white !important;
          }
        }
      `}</style>

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
                {a.status === 'DONE' && (
                  <div className="mt-3 pt-3 border-t">
                    <button
                      onClick={() => setPrintAppt(a)}
                      className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-lg flex items-center gap-1"
                    >
                      <i className="bi bi-printer" /> Cetak Struk
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {printAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div id="struk-print" className="p-6 font-mono text-sm">
              <div className="text-center mb-4">
                <div className="text-lg font-bold tracking-wide flex items-center justify-center gap-2">
                  <i className="bi bi-scissors" /> ZBarber
                </div>
                <div className="text-xs text-gray-500 mt-1">Barbershop Professional</div>
                <div className="border-t border-dashed border-gray-300 my-3" />
              </div>

              <div className="space-y-1 text-xs mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">No. Struk</span>
                  <span className="font-medium">#{printAppt.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tanggal</span>
                  <span>{new Date(printAppt.scheduledAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jam</span>
                  <span>{new Date(printAppt.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 my-3" />

              <div className="space-y-1 text-xs mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pelanggan</span>
                  <span className="font-medium">{printAppt.customer?.name}</span>
                </div>
                {printAppt.customer?.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Telepon</span>
                    <span>{printAppt.customer.phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Barber</span>
                  <span>{printAppt.barber?.name}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 my-3" />

              <div className="space-y-1 text-xs mb-3">
                {printAppt.items?.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span>{it.service?.name}</span>
                    <span>{fmt(it.price)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-300 my-3" />

              <div className="space-y-1 text-xs mb-3">
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL</span>
                  <span>{fmt(printAppt.totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bayar via</span>
                  <span>{PAYMENT_LABEL[printAppt.payment?.method] ?? printAppt.payment?.method ?? '-'}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 my-3" />

              <div className="text-center text-xs text-gray-500">
                <p>Terima kasih atas kunjungannya!</p>
                <p>Sampai jumpa kembali</p>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-5">
              <button
                onClick={handlePrint}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <i className="bi bi-printer" /> Cetak
              </button>
              <button
                onClick={() => setPrintAppt(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
