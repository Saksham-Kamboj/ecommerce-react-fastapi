export interface Address {
  id: string
  user_id: string
  title: string
  address_line1: string
  address_line2?: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface AddressCreate {
  title?: string
  address_line1: string
  address_line2?: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default?: boolean
}

export type AddressUpdate = Partial<AddressCreate>
