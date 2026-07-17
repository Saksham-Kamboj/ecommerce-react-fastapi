from typing import Generic, TypeVar, Any
from pydantic import BaseModel, Field

T = TypeVar("T")

class Pagination(BaseModel):
    currentPage: int
    totalPages: int
    totalItems: int
    itemsPerPage: int
    hasNextPage: bool
    hasPrevPage: bool

class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str
    data: T | None = None

import math

class PaginatedApiResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str
    data: list[T]
    pagination: Pagination

def paginate(items: list[T], total_items: int, skip: int=0, limit: int=0, message: str = "Retrieved successfully") -> PaginatedApiResponse[T]:
    current_page = (skip // limit) + 1 if limit > 0 else 1
    total_pages = math.ceil(total_items / limit) if limit > 0 else 1
    
    return PaginatedApiResponse(
        message=message,
        data=items,
        pagination=Pagination(
            currentPage=current_page,
            totalPages=total_pages,
            totalItems=total_items,
            itemsPerPage=limit,
            hasNextPage=current_page < total_pages,
            hasPrevPage=current_page > 1
        )
    )
