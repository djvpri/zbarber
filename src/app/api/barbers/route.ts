import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tenantId = (session.user as any).tenantId

  const barbers = await prisma.barber.findMany({
    where: { tenantId, isActive: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(barbers)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tenantId = (session.user as any).tenantId

  const { name, phone, photo } = await req.json()
  if (!name) return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 })

  const barber = await prisma.barber.create({
    data: { tenantId, name, phone, photo },
  })
  return NextResponse.json(barber)
}
