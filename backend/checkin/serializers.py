from rest_framework import serializers
from .models import CheckIn
from guests.serializers import GuestSerializer


class CheckInSerializer(serializers.ModelSerializer):
    guest_name = serializers.CharField(source='guest.full_name', read_only=True)
    event_title = serializers.CharField(source='guest.event.title', read_only=True)
    checked_in_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CheckIn
        fields = [
            'id',
            'guest',
            'guest_name',
            'event_title',
            'checked_in_by',
            'checked_in_by_name',
            'check_in_method',
            'notes',
            'ip_address',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_checked_in_by_name(self, obj):
        if obj.checked_in_by:
            return obj.checked_in_by.get_full_name()
        return None