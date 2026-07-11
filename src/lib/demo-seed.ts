import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const DEMO_SERVICES = [
  { name: 'Potong Rambut', duration: 30, price: 35000 },
  { name: 'Cukur Jenggot', duration: 20, price: 25000 },
  { name: 'Potong + Jenggot', duration: 45, price: 55000 },
  { name: 'Keramas', duration: 15, price: 20000 },
  { name: 'Creambath', duration: 45, price: 50000 },
  { name: 'Cat Rambut', duration: 60, price: 100000 },
]

const DEMO_BARBERS = [
  { name: 'Eko Barber' },
  { name: 'Rafi Stylist' },
  { name: 'Deni Cukur' },
]

const DEMO_CUSTOMERS = [
  { name: 'Budi Santoso', phone: '081234567890' },
  { name: 'Adi Prasetyo', phone: '082345678901' },
  { name: 'Ricky Firmansyah', phone: '083456789012' },
  { name: 'Doni Wahyu', phone: '084567890123' },
  { name: 'Fajar Nugroho', phone: '085678901234' },
  { name: 'Hendra Kusuma', phone: '086789012345' },
  { name: 'Iwan Setiawan', phone: '087890123456' },
  { name: 'Joko Susilo', phone: '088901234567' },
]

export async function bersihkanDataBarber(tenantId: string) {
  await prisma.payment.deleteMany({ where: { tenantId } })
  await prisma.appointmentItem.deleteMany({
    where: { appointment: { tenantId } }
  })
  await prisma.appointment.deleteMany({ where: { tenantId } })
  await prisma.customer.deleteMany({ where: { tenantId } })
  await prisma.barber.deleteMany({ where: { tenantId } })
  await prisma.service.deleteMany({ where: { tenantId } })
}

export async function seedDataDemo(tenantId: string) {
  const hash = await bcrypt.hash('demo1234', 10)

  // Services
  const services = await Promise.all(
    DEMO_SERVICES.map(s => prisma.service.create({ data: { tenantId, ...s } }))
  )

  // Barbers
  const barbers = await Promise.all(
    DEMO_BARBERS.map(b => prisma.barber.create({ data: { tenantId, ...b } }))
  )

  // Customers
  const customers = await Promise.all(
    DEMO_CUSTOMERS.map(c => prisma.customer.create({ data: { tenantId, ...c } }))
  )

  // Pastikan user kasir demo ada
  const existingUser = await prisma.user.findFirst({ where: { tenantId, role: 'STAFF' } })
  if (!existingUser) {
    await prisma.user.create({
      data: {
        tenantId,
        name: 'Staff Demo',
        email: `staff.${tenantId}@zbarber.demo`,
        password: hash,
        role: 'STAFF',
      }
    })
  }

  // Riwayat appointment 14 hari
  function acak(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  function pilihAcak<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  const METODE = ['CASH', 'QRIS', 'TRANSFER'] as const
  const sekarang = new Date()

  for (let h = 13; h >= 0; h--) {
    const jumlah = acak(3, 10)
    for (let i = 0; i < jumlah; i++) {
      const waktu = new Date(sekarang)
      waktu.setDate(waktu.getDate() - h)
      waktu.setHours(acak(9, 20), acak(0, 59), 0, 0)

      const layananDipilih = [pilihAcak(services)]
      if (Math.random() > 0.6) layananDipilih.push(pilihAcak(services.filter(s => s.id !== layananDipilih[0].id)))
      const totalPrice = layananDipilih.reduce((sum, s) => sum + s.price, 0)

      const appt = await prisma.appointment.create({
        data: {
          tenantId,
          customerId: pilihAcak(customers).id,
          barberId: pilihAcak(barbers).id,
          scheduledAt: waktu,
          status: 'DONE',
          totalPrice,
          items: {
            create: layananDipilih.map(s => ({
              serviceId: s.id,
              price: s.price,
              duration: s.duration,
            }))
          }
        }
      })

      await prisma.payment.create({
        data: {
          tenantId,
          appointmentId: appt.id,
          amount: totalPrice,
          method: pilihAcak([...METODE]),
          paidAt: waktu,
        }
      })
    }
  }

  return { services: services.length, barbers: barbers.length, customers: customers.length }
}
