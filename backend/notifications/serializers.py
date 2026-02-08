from rest_framework import serializers
from guests.models import Guest
from events.models import Event


class SendInviteSerializer(serializers.Serializer):
    """Serializer for sending invitation to a single guest."""
    guest_id = serializers.IntegerField(
        required=True,
        help_text="ID of the guest to send invitation to"
    )
    
    def validate_guest_id(self, value):
        """Validate that the guest exists."""
        if not Guest.objects.filter(id=value).exists():
            raise serializers.ValidationError("Guest not found")
        return value


class SendBulkInvitesSerializer(serializers.Serializer):
    """Serializer for sending invitations to multiple guests."""
    guest_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True,
        min_length=1,
        help_text="List of guest IDs to send invitations to"
    )
    
    def validate_guest_ids(self, value):
        """Validate that all guests exist."""
        if not value:
            raise serializers.ValidationError("At least one guest_id is required")
        
        existing_guests = Guest.objects.filter(id__in=value).values_list('id', flat=True)
        invalid_ids = set(value) - set(existing_guests)
        
        if invalid_ids:
            raise serializers.ValidationError(
                f"The following guest IDs do not exist: {list(invalid_ids)}"
            )
        
        return value


class SendEventReminderSerializer(serializers.Serializer):
    """Serializer for sending reminder to all confirmed guests of an event."""
    event_id = serializers.IntegerField(
        required=True,
        help_text="ID of the event to send reminders for"
    )
    
    def validate_event_id(self, value):
        """Validate that the event exists."""
        if not Event.objects.filter(id=value).exists():
            raise serializers.ValidationError("Event not found")
        return value


class EmailResponseSerializer(serializers.Serializer):
    """Serializer for email API responses."""
    message = serializers.CharField(read_only=True)