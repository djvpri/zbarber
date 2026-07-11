'use client'
import { useEffect, useState } from 'react'

export default function ReportsPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/reports').then(r => r.json()).then(setData)
  }, [])

  const fmt = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Laporan</h1>
      {!data ? <div className="text-gray-400">Memuat...</div> : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <div className="text-sm text-gray-500">Total Appointment</div>
            <div className="text-2xl font-bold">{data.totalAppointments || 0}</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-sm text-gray-500">Total Pendapatan</div>
            <div className="text-2xl font-bold">{fmt(data.totalRevenue)}</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-sm text-gray-500">Total Pelanggan</div>
            <div className="text-2xl font-bold">{data.totalCustomers || 0}</div>
          </div>
        </div>
      )}
    </div>
  )
}
