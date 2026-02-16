# accounts/permissions.py
from rest_framework import permissions


class IsEventOrganizer(permissions.BasePermission):
    """
    Permission class to check if user is an event organizer.
    """
    message = "Only event organizers can perform this action."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_organizer
        )


class IsCustomer(permissions.BasePermission):
    """
    Permission class to check if user is a customer.
    """
    message = "Only customers can perform this action."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_customer
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj.organizer == request.user