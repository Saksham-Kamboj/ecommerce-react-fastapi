export interface PaymentCreate {
  shipping_address_id: string
  shipping_name: string
  shipping_phone?: string | null
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
