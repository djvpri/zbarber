'use client'
import { useEffect, useState } from 'react'

export default function BarberPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/barbers')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6 text-gray-400">Memuat...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Barber</h1>
      {data.length === 0 ? (
        <div className="text-center text-gray-400 py-12">Belum ada barber terdaftar</div>
      ) : (
        <div className="grid gap-3">
          {data.map((item: any) => (
            <div key={item.id} className="bg-white rounded-xl border p-4">
              <div className="font-semibold">{item.name}</div>
              {item.phone && <div className="text-sm text-gray-500">{item.phone}</div>}
              {item.price && <div className="text-sm text-indigo-600 font-medium">Rp {item.price.toLocaleString('id-ID')} · {item.duration} menit</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
