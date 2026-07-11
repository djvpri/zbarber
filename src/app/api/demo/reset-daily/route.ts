export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { seedDataDemo } from '@/lib/demo-seed'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const secret = process.env.DEMO_RESET_SECRET
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const expiredDemos = await prisma.tenant.findMany({
      where: { isDemo: true, demoExpiresAt: { lt: new Date() } },
    })

    if (expiredDemos.length === 0) {
      return NextResponse.json({ message: 'No expired demos', reset: 0 })
    }

    let resetCount = 0
    for (const tenant of expiredDemos) {
      try {
        await seedDataDemo(tenant.id)
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { demoExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) },
        })
        resetCount++
      } catch (err: unknown) {
        console.error(`[DemoReset] ${tenant.name}:`, err)
      }
    }

    return NextResponse.json({ success: true, reset: resetCount, total: expiredDemos.length })
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'zbarber-demo-reset' })
}
