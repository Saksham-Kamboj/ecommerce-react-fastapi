import uuid
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.models.user import User
from app.api import deps
from app.schemas.address import AddressCreate, AddressOut, AddressUpdate
from app.schemas.response import ApiResponse

router = APIRouter()


@router.get("/", response_model=ApiResponse[List[AddressOut]])
def read_user_addresses(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve user addresses.
    """
    addresses = crud.address.get_by_user(db, user_id=current_user.id)
    return ApiResponse(message="Addresses retrieved successfully", data=addresses)


@router.post("/", response_model=ApiResponse[AddressOut], status_code=status.HTTP_201_CREATED)
def create_address(
    *,
    db: Session = Depends(deps.get_db),
    address_in: AddressCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new address for the current user.
    """
    # Check if this is the first address, if so, make it default
    existing_addresses = crud.address.get_by_user(db, user_id=current_user.id)
    if not existing_addresses:
        address_in.is_default = True

    address = crud.address.create_with_user(
        db=db, obj_in=address_in, user_id=current_user.id
    )
    
    if address_in.is_default and existing_addresses:
        crud.address.set_default(db=db, db_obj=address)
        
    return ApiResponse(message="Address created successfully", data=address)


@router.put("/{address_id}", response_model=ApiResponse[AddressOut])
def update_address(
    *,
    db: Session = Depends(deps.get_db),
    address_id: uuid.UUID,
    address_in: AddressUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update an address.
    """
    address = crud.address.get(db=db, id=address_id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    if address.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    address = crud.address.update(db=db, db_obj=address, obj_in=address_in)
    
    if address_in.is_default:
        crud.address.set_default(db=db, db_obj=address)
        
    return ApiResponse(message="Address updated successfully", data=address)


@router.delete("/{address_id}", response_model=ApiResponse[None])
def delete_address(
    *,
    db: Session = Depends(deps.get_db),
    address_id: uuid.UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete an address.
    """
    address = crud.address.get(db=db, id=address_id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    if address.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    crud.address.remove(db=db, id=address_id)
    
    # If the deleted address was the default, make another one default if it exists
    if address.is_default:
        remaining_addresses = crud.address.get_by_user(db, user_id=current_user.id)
        if remaining_addresses:
            crud.address.set_default(db=db, db_obj=remaining_addresses[0])
            
    return ApiResponse(message="Address deleted successfully", data=None)


@router.patch("/{address_id}/default", response_model=ApiResponse[AddressOut])
def set_default_address(
    *,
    db: Session = Depends(deps.get_db),
    address_id: uuid.UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Set an address as default.
    """
    address = crud.address.get(db=db, id=address_id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    if address.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    address = crud.address.set_default(db=db, db_obj=address)
    return ApiResponse(message="Address set as default", data=address)
