export type OrderStatus =
  "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"

export interface OrderCreate {
  shipping_address_id: string
  shipping_name: string
  shipping_phone?: string | null
  notes?: string | null
}

export interface OrderItemOut {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  product: {
    id: string
    name: string
    description: string | null
    price: number
    stock_quantity: number
    is_active: boolean
    image_url: string | null
  }
}

export interface PaymentSummary {
  id: string
  status: "created" | "captured" | "failed" | "cancelled"
  amount: number
  currency: string
  provider: string
  provider_order_id: string
  provider_payment_id: string | null
  created_at: string
}

export interface OrderOut {
  id: string
  user_id: string
  status: OrderStatus
  total_amount: number
  shipping_name: string
  shipping_phone: string | null
  shipping_address_line1: string
  shipping_address_line2: string | null
  shipping_city: string
  shipping_state: string
  shipping_postal_code: string
  shipping_country: string
  notes: string | null
  items: OrderItemOut[]
  payment: PaymentSummary | null // latest payment only — not an array
  created_at: string
  updated_at: string
}
