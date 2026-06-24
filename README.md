# ZoMet Membership

Aplikasi manajemen membership untuk gym, salon, kolam renang, dan usaha berbasis langganan. Dibangun dengan Next.js 14 + Supabase + Tailwind CSS.

## Fitur
- Dashboard statistik real-time
- Manajemen anggota + kartu member digital dengan QR code
- Check-in via kode/nama member
- Manajemen paket membership
- Pengaturan bisnis & notifikasi

## Setup Cepat

### 1. Install
```bash
npm install
```

### 2. Setup Supabase
1. Buat project di supabase.com
2. SQL Editor → jalankan `supabase/schema.sql`
3. Isi `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```
(nilai ada di Supabase → Settings → API)

### 3. Jalankan
```bash
npm run dev
```
Buka http://localhost:3000, daftar akun, dan mulai!

## Deploy
```bash
vercel --prod
```
