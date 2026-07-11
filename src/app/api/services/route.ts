import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tenantId = (session.user as any).tenantId

  const services = await prisma.service.findMany({
    where: { tenantId, isActive: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(services)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tenantId = (session.user as any).tenantId

  const { name, description, price, duration } = await req.json()
  if (!name || !price || !duration)
    return NextResponse.json({ error: 'Nama, harga, dan durasi wajib diisi' }, { status: 400 })

  const service = await prisma.service.create({
    data: { tenantId, name, description, price: Number(price), duration: Number(duration) },
  })
  return NextResponse.json(service)
}
