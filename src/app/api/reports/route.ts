export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTenant } from '@/lib/tenant'

export async function GET() {
  const tenantId = await requireTenant()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalAppointments, totalRevenue, totalCustomers, revenueThisMonth] = await Promise.all([
    prisma.appointment.count({ where: { tenantId, status: 'DONE' } }),
    prisma.payment.aggregate({ where: { tenantId }, _sum: { amount: true } }),
    prisma.customer.count({ where: { tenantId } }),
    prisma.payment.aggregate({
      where: { tenantId, paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
  ])

  return NextResponse.json({
    totalAppointments,
    totalRevenue: Number(totalRevenue._sum.amount || 0),
    totalCustomers,
    revenueThisMonth: Number(revenueThisMonth._sum.amount || 0),
  })
}
