import { prisma } from '@/lib/prisma'

const DEMO_SERVICES = [
  { name: 'Haircut', duration: 30, price: 50000 },
  { name: 'Beard Trim', duration: 20, price: 30000 },
  { name: 'Hair + Beard', duration: 45, price: 70000 },
  { name: 'Shampoo', duration: 15, price: 20000 },
]

const DEMO_CUSTOMERS = [
  { name: 'Budi', phone: '081234567890' },
  { name: 'Adi', phone: '082345678901' },
  { name: 'Ricky', phone: '083456789012' },
  { name: 'Doni', phone: '084567890123' },
  { name: 'Fajar', phone: '085678901234' },
]

export async function bersihkanDataBarber(tenantId: string) {
  // Simple cleanup - no relations to worry about yet
  console.log(`[Cleanup] Barber ${tenantId}`)
}

export async function seedDataDemo(tenantId: string) {
  return {
    services: DEMO_SERVICES.length,
    customers: DEMO_CUSTOMERS.length,
  }
}
