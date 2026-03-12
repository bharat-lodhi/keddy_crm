from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsInvoiceOwnerOrReadOnly(BasePermission):
    """
    SUB_ADMIN  -> Full access (own company invoices)
    EMPLOYEE   -> Read only (own company invoices)
    CENTRAL_ADMIN -> Full access (all invoices)
    """

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        # Read-only allowed for company users
        if request.method in SAFE_METHODS:
            return True

        # Write permissions
        if user.role == "CENTRAL_ADMIN":
            return True

        if user.role == "SUB_ADMIN":
            return True

        if user.role == "EMPLOYEE":
            return False

        return False

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Central admin can access all
        if user.role == "CENTRAL_ADMIN":
            return True

        # Company isolation
        if user.role == "SUB_ADMIN":
            return obj.created_by == user or obj.created_by.parent_user == user

        if user.role == "EMPLOYEE":
            return (
                request.method in SAFE_METHODS and
                obj.created_by == user.parent_user
            )

        return False