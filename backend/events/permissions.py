from rest_framework import permissions


class IsEventOrganizer(permissions.BasePermission):
    """
    Custom permission to only allow organizers of an event to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the organizer
        return obj.organizer == request.user