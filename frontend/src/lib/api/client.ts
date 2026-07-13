// API response types matching the FastAPI backend
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: Pagination;
}

const API_BASE = "/api/v1";

interface ApiOptions extends RequestInit {
  data?: unknown;
}

/**
 * A common API client wrapper for fetch.
 * Automatically handles JSON parsing, Authorization headers, and error throwing.
 */
export async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  const { data, headers: customHeaders, ...customConfig } = options;

  const token = localStorage.getItem("token");

  const headers = new Headers(customHeaders);
  
  // Set JSON content type if data is provided and it's not FormData
  if (data && !(data instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Attach auth token if available
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const config: RequestInit = {
    method: data ? "POST" : "GET", // Default to POST if there is data, otherwise GET
    headers,
    ...customConfig,
  };

  if (data) {
    config.body = data instanceof FormData ? data : JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  let result;
  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    // If backend returns 401, you might want to emit an event or clear token
    if (response.status === 401) {
      // localStorage.removeItem("token");
      // Optionally trigger a page reload or global state update to force re-login
    }
    
    throw new Error(result?.message || result?.detail || `Request failed with status ${response.status}`);
  }

  return result as ApiResponse<T>;
}
