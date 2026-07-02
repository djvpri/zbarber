# ZBarber — Manajemen Barbershop & Membership

Aplikasi manajemen barbershop (anggota, layanan, kapster, janji temu, absensi,
pembayaran, produk) untuk ekosistem Zomet. **Fork dari base ZGym** — arsitektur,
auth (NextAuth v5), multi-tenant (`tenantId`), dan mekanisme SSO identik dengan
ZGym, hanya domain & istilah disesuaikan untuk barbershop.

## Stack
Next.js 14 · React 18 · Prisma + PostgreSQL · NextAuth v5 (SSO dari Z One) ·
Tailwind. Deploy: Railway (Nixpacks, `next start`).

## Adaptasi dari ZGym
- Slug SSO `zgym` → `zbarber` (auth cek `payload.app !== 'zbarber'`)
- Brand ZGym → ZBarber; istilah: Kelas→Layanan, Instruktur→Kapster,
  Personal Training→Janji Temu, Gym→Barbershop
- Keamanan: hapus fallback `CROSS_APP_SECRET` hardcode (fail-fast via lib/secrets)
- Model & rute Prisma tetap sama dengan ZGym (base identik, stabil)

## Setup lokal
```bash
npm install                 # prisma generate jalan otomatis (postinstall)
cp .env.example .env         # isi DATABASE_URL, CROSS_APP_SECRET, NEXTAUTH_*
npx prisma db push           # buat schema di DB (sekali)
npm run dev
```

## Deploy Railway
1. Service baru dari repo ini + PostgreSQL.
2. Env: `DATABASE_URL`, `CROSS_APP_SECRET` (samakan dengan Z One), `NEXTAUTH_SECRET`,
   `AUTH_SECRET`, `NEXTAUTH_URL=https://zbarber.zomet.my.id`, `AUTH_TRUST_HOST=true`.
3. Jalankan `npx prisma db push` sekali pada DB baru (schema belum ada migrations folder).
4. Daftarkan di Z One: tambah slug `zbarber` di `seed-apps.js` + `SSO_ENABLED_SLUGS`,
   arahkan `zbarber.zomet.my.id` ke Railway, jalankan `node scripts/seed-apps.js` di Z One.
