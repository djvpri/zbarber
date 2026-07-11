export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { seedDataDemo } from '@/lib/demo-seed'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const secret = process.env.DEMO_RESET_SECRET
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let tenant = await prisma.tenant.findUnique({ where: { slug: 'demo' } })
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: 'Demo Barbershop',
          slug: 'demo',
          email: 'demo@zomet.my.id',
          plan: 'demo',
          isDemo: true,
          demoExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        },
      })
    } else {
      tenant = await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          isDemo: true,
          demoExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        },
      })
    }

    let user = await prisma.user.findFirst({
      where: { email: 'demo@zomet.my.id', tenantId: tenant.id },
    })
    if (!user) {
      const passwordHash = await hash('demo123', 12)
      user = await prisma.user.create({
        data: {
          name: 'Demo Barbershop',
          email: 'demo@zomet.my.id',
          password: passwordHash,
          role: 'owner',
          tenantId: tenant.id,
          isActive: true,
        },
      })
    }

    const result = await seedDataDemo(tenant.id)
    return NextResponse.json({
      success: true,
      tenant: { id: tenant.id, slug: tenant.slug },
      user: { id: user.id, email: user.email },
      ...result,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
