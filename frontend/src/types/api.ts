export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface Pagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedApiResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination: Pagination
}
