export type MemberStatus = 'active' | 'expired' | 'trial' | 'cancelled'
export type PaymentMethod = 'cash' | 'qris' | 'transfer' | 'other'
export type CheckinMethod = 'qr' | 'manual' | 'barcode'
export type Gender = 'L' | 'P'

export interface Business {
  id: string
  owner_id: string
  name: string
  category: string
  phone?: string
  address?: string
  logo_url?: string
  created_at: string
}

export interface Plan {
  id: string
  business_id: string
  name: string
  price: number
  duration_days: number
  description?: string
  features: string[]
  is_active: boolean
  is_featured: boolean
  created_at: string
}

export interface Member {
  id: string
  business_id: string
  member_code: string
  full_name: string
  phone?: string
  email?: string
  date_of_birth?: string
  gender?: Gender
  address?: string
  photo_url?: string
  emergency_contact?: string
  notes?: string
  created_at: string
}

export interface Subscription {
  id: string
  member_id: string
  plan_id: string
  business_id: string
  start_date: string
  end_date: string
  status: MemberStatus
  payment_method: PaymentMethod
  payment_status: 'paid' | 'pending' | 'failed'
  amount_paid?: number
  receipt_number?: string
  notes?: string
  created_at: string
  plan?: Plan
}

export interface Checkin {
  id: string
  member_id: string
  business_id: string
  subscription_id?: string
  checked_in_at: string
  method: CheckinMethod
  notes?: string
  member?: Member
}

export interface MemberWithStatus extends Member {
  subscription_id?: string
  start_date?: string
  end_date?: string
  status?: MemberStatus
  plan_name?: string
  plan_price?: number
  days_remaining?: number
  total_checkins?: number
  last_checkin?: string
}

export interface DashboardStats {
  totalMembers: number
  activeMembers: number
  expiringSoon: number
  todayCheckins: number
  monthlyRevenue: number
  newThisMonth: number
}
