export type DiscountType = "percentage" | "fixed"

export interface CouponBase {
  code: string
  discount_type: DiscountType
  discount_value: number
  min_order_value?: number | null
  max_discount?: number | null
  is_active: boolean
  usage_limit?: number | null
  valid_from?: string | null
  valid_until?: string | null
}

export interface CouponOut extends CouponBase {
  id: string
  usage_count: number
  created_at: string
  updated_at: string
}

export type CouponCreate = CouponBase

export interface CouponUpdate {
  code?: string
  discount_type?: DiscountType
  discount_value?: number
  min_order_value?: number | null
  max_discount?: number | null
  is_active?: boolean
  usage_limit?: number | null
  valid_from?: string | null
  valid_until?: string | null
}

export interface CouponValidateRequest {
  code: string
  cart_total: number
}

export interface CouponValidateResponse {
  is_valid: boolean
  discount_amount: number
  message?: string
  coupon?: CouponOut
}
