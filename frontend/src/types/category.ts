export interface CategoryBase {
  name: string
  slug: string
}

export type CategoryCreate = CategoryBase

export interface CategoryUpdate {
  name?: string | null
  slug?: string | null
}

export interface CategoryOut extends CategoryBase {
  id: string
  created_at: string
  updated_at: string
}
