export interface PaymentCreate {
  order_id: string
}

export interface PaymentCreateOut {
  order_id: string
  razorpay_order_id: string
  amount: number
  currency: string
  key_id: string
}

export interface PaymentVerify {
  order_id: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface PaymentOut {
  id: string
  order_id: string
  user_id: string
  amount: number
  currency: string
  provider: string
  provider_order_id: string
  provider_payment_id: string | null
  status: string
  created_at: string
  updated_at: string
}
