import type { ShippingAddress } from "./order"

export interface PaymentCreate {
  shipping_address?: ShippingAddress
  notes?: string | null
  order_id?: string
}

export interface PaymentCreateOut {
  razorpay_order_id: string
  amount: number
  currency: string
  key_id: string
}

export interface PaymentVerify {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  order_id?: string
}
