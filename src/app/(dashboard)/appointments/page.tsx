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

const EMPTY_FORM = { customerId: '', barberId: '', date: '', time: '09:00', serviceIds: [] as string[], notes: '' }

export default function AppointmentsPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [printAppt, setPrintAppt] = useState<any>(null)

  // new appointment modal
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [customers, setCustomers] = useState<any[]>([])
  const [barbers, setBarbers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const load = () => {
    setLoading(true)
    fetch(`/api/appointments?date=${date}`)
      .then(r => r.json())
      .then(setAppointments)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [date])

  const openNew = async () => {
    setForm({ ...EMPTY_FORM, date })
    setCustomerSearch('')
    setFormError('')
    setShowNew(true)
    const [c, b, s] = await Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/barbers').then(r => r.json()),
      fetch('/api/services').then(r => r.json()),
    ])
    setCustomers(Array.isArray(c) ? c : [])
    setBarbers(Array.isArray(b) ? b : [])
    setServices(Array.isArray(s) ? s : [])
  }

  const toggleService = (id: string) => {
    setForm(f => ({
      ...f,
      serviceIds: f.serviceIds.includes(id)
        ? f.serviceIds.filter(x => x !== id)
        : [...f.serviceIds, id],
    }))
  }

  const submitNew = async () => {
    if (!form.customerId) return setFormError('Pilih pelanggan')
    if (!form.barberId) return setFormError('Pilih barber')
    if (!form.serviceIds.length) return setFormError('Pilih minimal 1 layanan')
    if (!form.date || !form.time) return setFormError('Isi tanggal dan jam')
    setFormError('')
    setSaving(true)
    try {
      const scheduledAt = new Date(`${form.date}T${form.time}:00`).toISOString()
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: form.customerId,
          barberId: form.barberId,
          scheduledAt,
          serviceIds: form.serviceIds,
          notes: form.notes,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setFormError(d.error || 'Gagal menyimpan')
        return
      }
      setShowNew(false)
      setDate(form.date)
      load()
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id: string, status: string, paymentMethod?: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, paymentMethod }),
    })
    load()
  }

  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.phone || '').includes(customerSearch)
  )

  const selectedCustomer = customers.find(c => c.id === form.customerId)
  const selectedServices = services.filter(s => form.serviceIds.includes(s.id))
  const totalEstimasi = selectedServices.reduce((sum, s) => sum + s.price, 0)

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
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"
            >
              <i className="bi bi-plus-lg" /> Buat Appointment
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-400">Memuat...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <i className="bi bi-calendar-x text-4xl block mb-2" />
            Tidak ada appointment untuk tanggal ini
          </div>
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

      {/* Modal Buat Appointment */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <i className="bi bi-calendar-plus text-indigo-600" /> Buat Appointment
              </h2>
              <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600">
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Pelanggan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pelanggan <span className="text-red-500">*</span>
                </label>
                {selectedCustomer ? (
                  <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
                    <div>
                      <div className="text-sm font-medium">{selectedCustomer.name}</div>
                      {selectedCustomer.phone && <div className="text-xs text-gray-500">{selectedCustomer.phone}</div>}
                    </div>
                    <button onClick={() => { setForm(f => ({ ...f, customerId: '' })); setCustomerSearch('') }}
                      className="text-gray-400 hover:text-gray-600 text-xs">
                      <i className="bi bi-x-circle" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="Cari nama atau nomor HP..."
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    {customerSearch && (
                      <div className="border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-sm">
                        {filteredCustomers.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-400">Tidak ditemukan</div>
                        ) : filteredCustomers.map(c => (
                          <button key={c.id}
                            onClick={() => { setForm(f => ({ ...f, customerId: c.id })); setCustomerSearch('') }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 border-b last:border-0">
                            <div className="font-medium">{c.name}</div>
                            {c.phone && <div className="text-xs text-gray-500">{c.phone}</div>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Barber */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barber <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.barberId}
                  onChange={e => setForm(f => ({ ...f, barberId: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">-- Pilih Barber --</option>
                  {barbers.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Tanggal & Jam */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              {/* Layanan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Layanan <span className="text-red-500">*</span>
                </label>
                <div className="border rounded-lg overflow-hidden">
                  {services.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-gray-400">Memuat layanan...</div>
                  ) : services.map(s => (
                    <label key={s.id}
                      className={`flex items-center justify-between px-3 py-2 cursor-pointer border-b last:border-0 hover:bg-gray-50 ${form.serviceIds.includes(s.id) ? 'bg-indigo-50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={form.serviceIds.includes(s.id)}
                          onChange={() => toggleService(s.id)}
                          className="accent-indigo-600"
                        />
                        <div>
                          <div className="text-sm font-medium">{s.name}</div>
                          <div className="text-xs text-gray-500">{s.duration} menit</div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-indigo-600">{fmt(s.price)}</span>
                    </label>
                  ))}
                </div>
                {selectedServices.length > 0 && (
                  <div className="flex justify-between items-center mt-2 px-1 text-sm font-semibold">
                    <span className="text-gray-600">{selectedServices.length} layanan dipilih</span>
                    <span className="text-indigo-700">{fmt(totalEstimasi)}</span>
                  </div>
                )}
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Catatan tambahan (opsional)"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>

              {formError && (
                <div className="text-sm text-red-600 flex items-center gap-1">
                  <i className="bi bi-exclamation-circle" /> {formError}
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={submitNew}
                disabled={saving}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <><i className="bi bi-arrow-repeat animate-spin" /> Menyimpan...</> : <><i className="bi bi-check-lg" /> Simpan</>}
              </button>
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cetak Struk */}
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
                onClick={() => window.print()}
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
