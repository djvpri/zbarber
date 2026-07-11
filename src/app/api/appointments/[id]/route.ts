import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tenantId = (session.user as any).tenantId

  const { status, paymentMethod } = await req.json()

  const appointment = await prisma.appointment.findFirst({
    where: { id: params.id, tenantId },
  })
  if (!appointment) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: { status },
  })

  // Jika selesai dan ada metode bayar, buat payment
  if (status === 'DONE' && paymentMethod) {
    await prisma.payment.upsert({
      where: { appointmentId: params.id },
      update: { method: paymentMethod },
      create: {
        tenantId,
        appointmentId: params.id,
        amount: appointment.totalPrice,
        method: paymentMethod,
      },
    })
  }

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tenantId = (session.user as any).tenantId

  await prisma.appointment.updateMany({
    where: { id: params.id, tenantId },
    data: { status: 'CANCELLED' },
  })
  return NextResponse.json({ ok: true })
}
