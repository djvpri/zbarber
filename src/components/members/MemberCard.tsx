'use client'
import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { MemberWithStatus } from '@/types'
import { formatDate } from '@/lib/utils'

interface MemberCardProps {
  member: MemberWithStatus
  businessName?: string
}

export default function MemberCard({ member, businessName = 'ZoMet Gym' }: MemberCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && member.member_code) {
      QRCode.toCanvas(canvasRef.current, member.member_code, {
        width: 80,
        margin: 1,
        color: { dark: '#3C3489', light: '#FFFFFF' },
      })
    }
  }, [member.member_code])

  const planColor = member.status === 'active'
    ? 'from-purple-700 to-purple-900'
    : member.status === 'trial'
    ? 'from-amber-600 to-amber-800'
    : 'from-gray-500 to-gray-700'

  return (
    <div className={`w-80 bg-gradient-to-br ${planColor} rounded-2xl p-6 text-white relative overflow-hidden select-none`}>
      {/* Decorative circle */}
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/5" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5" />

      <div className="relative z-10">
        <div className="text-xs tracking-widest uppercase opacity-60 mb-5">{businessName}</div>

        <div className="flex items-start justify-between">
          <div>
            <div className="text-xl font-medium leading-tight">{member.full_name}</div>
            <div className="text-xs opacity-50 mt-1 tracking-widest">{member.member_code}</div>
          </div>
          <canvas ref={canvasRef} className="rounded-lg" style={{ width: 60, height: 60 }} />
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-white/10">
          <div>
            <div className="text-xs opacity-50">Paket</div>
            <div className="text-sm font-medium">{member.plan_name ?? '—'}</div>
          </div>
          {member.end_date && (
            <div className="text-right">
              <div className="text-xs opacity-50">Berlaku s/d</div>
              <div className="text-sm font-medium">{formatDate(member.end_date)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
