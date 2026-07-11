import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tenantId = (session.user as any).tenantId

  const q = req.nextUrl.searchParams.get('q') || ''
  const customers = await prisma.customer.findMany({
    where: {
      tenantId,
      ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { phone: { contains: q } }] } : {}),
    },
    orderBy: { name: 'asc' },
    take: 50,
  })
  return NextResponse.json(customers)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tenantId = (session.user as any).tenantId

  const { name, phone, email, notes } = await req.json()
  if (!name) return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 })

  const customer = await prisma.customer.create({
    data: { tenantId, name, phone, email, notes },
  })
  return NextResponse.json(customer)
}
