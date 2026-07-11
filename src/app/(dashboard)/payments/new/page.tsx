'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewPaymentPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<any[]>([])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    fetch(`/api/appointments?date=${today}&status=IN_PROGRESS`)
      .then(r => r.json()).then(setAppointments)
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pembayaran</h1>
      <p className="text-gray-500 text-sm">Gunakan halaman Appointment untuk menyelesaikan pembayaran.</p>
      <button onClick={() => router.push('/appointments')}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
        Ke Halaman Appointment
      </button>
    </div>
  )
}
