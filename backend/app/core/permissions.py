from fastapi import HTTPException, status

def verify_resource_ownership(resource_owner_id: str, current_user_id: str, resource_name: str = "Resource") -> None:
    if resource_owner_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. You do not have permission to access this {resource_name}."
        )
