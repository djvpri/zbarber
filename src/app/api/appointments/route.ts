import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tenantId = (session.user as any).tenantId

  const date = req.nextUrl.searchParams.get('date') // YYYY-MM-DD
  const status = req.nextUrl.searchParams.get('status')

  const start = date ? new Date(date + 'T00:00:00') : undefined
  const end = date ? new Date(date + 'T23:59:59') : undefined

  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      ...(start && end ? { scheduledAt: { gte: start, lte: end } } : {}),
      ...(status ? { status: status as any } : {}),
    },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      barber: { select: { id: true, name: true } },
      items: { include: { service: { select: { id: true, name: true } } } },
      payment: true,
    },
    orderBy: { scheduledAt: 'asc' },
  })
  return NextResponse.json(appointments)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tenantId = (session.user as any).tenantId

  const { customerId, barberId, scheduledAt, serviceIds, notes } = await req.json()
  if (!customerId || !barberId || !scheduledAt || !serviceIds?.length)
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })

  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds }, tenantId },
  })
  const totalPrice = services.reduce((sum, s) => sum + s.price, 0)

  const appointment = await prisma.appointment.create({
    data: {
      tenantId,
      customerId,
      barberId,
      scheduledAt: new Date(scheduledAt),
      notes,
      totalPrice,
      items: {
        create: services.map(s => ({
          serviceId: s.id,
          price: s.price,
          duration: s.duration,
        })),
      },
    },
    include: {
      customer: true,
      barber: true,
      items: { include: { service: true } },
    },
  })
  return NextResponse.json(appointment)
}
