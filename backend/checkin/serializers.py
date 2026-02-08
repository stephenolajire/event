from rest_framework import serializers
from .models import CheckIn
from guests.serializers import GuestListSerializer


class CheckInSerializer(serializers.ModelSerializer):
    """Serializer for CheckIn model."""
    
    guest_details = GuestListSerializer(source='guest', read_only=True)
    checked_in_by_name = serializers.CharField(
        source='checked_in_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = CheckIn
        fields = [
            'id', 'guest', 'guest_details', 'checked_in_by',
            'checked_in_by_name', 'check_in_method', 'notes',
            'ip_address', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class QRScanSerializer(serializers.Serializer):
    """Serializer for QR code scanning."""
    
    token = serializers.CharField(required=True)
    notes = serializers.CharField(required=False, allow_blank=True)