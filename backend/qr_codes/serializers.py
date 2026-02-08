from rest_framework import serializers
from .models import QRCode


class QRCodeSerializer(serializers.ModelSerializer):
    """Serializer for QR Code model."""
    
    guest_name = serializers.CharField(source='guest.full_name', read_only=True)
    event_title = serializers.CharField(source='guest.event.title', read_only=True)
    
    class Meta:
        model = QRCode
        fields = [
            'id', 'guest', 'guest_name', 'event_title',
            'token', 'qr_image', 'is_used', 'used_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'token', 'qr_image', 'is_used',
            'used_at', 'created_at', 'updated_at'
        ]