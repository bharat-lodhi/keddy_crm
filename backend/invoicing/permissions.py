from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsInvoiceOwnerOrReadOnly(BasePermission):
    """
    CENTRAL_ADMIN -> Full access (all invoices)
    SUB_ADMIN     -> Full access (own company)
    ACCOUNTANT    -> Full access (own company)
    EMPLOYEE      -> Read only (own company)
    """

    def get_company_root(self, user):
        if user.role == "SUB_ADMIN":
            return user
        
        if user.role in ["ACCOUNTANT", "EMPLOYEE"] and user.parent_user:
            return user.parent_user
        
        return None

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        # ✅ Read allowed for all logged-in users
        if request.method in SAFE_METHODS:
            return True

        # ✅ Write access
        if user.role in ["CENTRAL_ADMIN", "SUB_ADMIN", "ACCOUNTANT"]:
            return True

        # ❌ Employee cannot write
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user

        # ✅ CENTRAL ADMIN → full access
        if user.role == "CENTRAL_ADMIN":
            return True

        company_root = self.get_company_root(user)

        if not company_root:
            return False

        # 🔥 Invoice belongs to same company?
        is_same_company = (
            obj.created_by == company_root or
            obj.created_by.parent_user == company_root
        )

        if not is_same_company:
            return False

        # ✅ SUB_ADMIN / ACCOUNTANT → full access
        if user.role in ["SUB_ADMIN", "ACCOUNTANT"]:
            return True

        # 👀 EMPLOYEE → read only
        if user.role == "EMPLOYEE":
            return request.method in SAFE_METHODS

        return False







# from rest_framework.permissions import BasePermission, SAFE_METHODS


# class IsInvoiceOwnerOrReadOnly(BasePermission):
#     """
#     SUB_ADMIN  -> Full access (own company invoices)
#     EMPLOYEE   -> Read only (own company invoices)
#     CENTRAL_ADMIN -> Full access (all invoices)
#     """

#     def has_permission(self, request, view):
#         user = request.user

#         if not user.is_authenticated:
#             return False

#         # Read-only allowed for company users
#         if request.method in SAFE_METHODS:
#             return True

#         # Write permissions
#         if user.role == "CENTRAL_ADMIN":
#             return True

#         if user.role == "SUB_ADMIN":
#             return True

#         if user.role == "EMPLOYEE":
#             return False

#         return False

#     def has_object_permission(self, request, view, obj):
#         user = request.user

#         # Central admin can access all
#         if user.role == "CENTRAL_ADMIN":
#             return True

#         # Company isolation
#         if user.role == "SUB_ADMIN":
#             return obj.created_by == user or obj.created_by.parent_user == user

#         if user.role == "EMPLOYEE":
#             return (
#                 request.method in SAFE_METHODS and
#                 obj.created_by == user.parent_user
#             )

#         return False