from rest_framework.permissions import BasePermission


class IsEmployee(BasePermission):
    """Employee role only"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'EMPLOYEE'


class IsSubAdmin(BasePermission):
    """Sub-Admin role only"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'SUB_ADMIN'


class IsCompanyUser(BasePermission):
    """User belongs to the same company (for employees viewing board)"""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        # Employee can view company board
        return request.user.role in ['EMPLOYEE', 'SUB_ADMIN']
    

#============================SUB-ADMIN=====================================================
class IsSubAdminOfCompany(BasePermission):
    """Check if user is Sub-Admin and accessing their own company data"""
    def has_permission(self, request, view):
        if not request.user.is_authenticated or request.user.role != 'SUB_ADMIN':
            return False
        return True
    
    def has_object_permission(self, request, view, obj):
        # For employee objects, check if they belong to this Sub-Admin's company
        if hasattr(obj, 'parent_user'):
            return obj.parent_user == request.user
        # For other objects with company field
        if hasattr(obj, 'company'):
            return obj.company == request.user
        return False
    
