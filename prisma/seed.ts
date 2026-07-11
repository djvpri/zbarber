import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('admin123', 10)

  // Tenant utama (system)
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'barbershop-demo' },
    update: {},
    create: {
      name: 'Barbershop Demo',
      slug: 'barbershop-demo',
      email: 'demo@zbarber.id',
      phone: '081234567890',
      plan: 'pro',
      isDemo: true,
    },
  })

  // Owner user
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'demo@zbarber.id' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Owner Demo',
      email: 'demo@zbarber.id',
      password: hash,
      role: 'OWNER',
    },
  })

  console.log('Seed complete - login: demo@zbarber.id / admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
