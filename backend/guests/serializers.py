from rest_framework import serializers
from .models import Guest
from qr_codes.serializers import QRCodeSerializer
from events.serializers import EventListSerializer


class GuestSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    qr_code = QRCodeSerializer(read_only=True)
    
    class Meta:
        model = Guest
        fields = [
            'id', 'event', 'first_name', 'last_name', 'full_name',
            'email', 'phone_number', 'company', 'title', 'notes',
            'plus_one_allowed', 'plus_one_name', 'status', 'rsvp_status',
            'rsvp_date', 'has_checked_in', 'checked_in_at', 'checked_in_by',
            'invitation_sent', 'invitation_sent_at', 'qr_code',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'has_checked_in', 'checked_in_at', 'checked_in_by',
            'invitation_sent', 'invitation_sent_at', 'created_at', 'updated_at'
        ]
    
    def validate(self, attrs):
        event = attrs.get('event')
        email = attrs.get('email')
        
        # Check if guest already exists for this event
        if self.instance is None:  # Creating new guest
            if Guest.objects.filter(event=event, email=email).exists():
                raise serializers.ValidationError({
                    'email': 'A guest with this email already exists for this event.'
                })
        
        # Check event capacity
        if self.instance is None and event.is_at_capacity:
            raise serializers.ValidationError({
                'event': 'This event has reached its capacity.'
            })
        
        return attrs


class GuestListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    event = EventListSerializer
    
    class Meta:
        model = Guest
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email',
            'status', 'rsvp_status', 'has_checked_in', 'checked_in_at', 'event'
        ]


class GuestBulkCreateSerializer(serializers.Serializer):
    event_id = serializers.IntegerField()
    guests = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )
    
    def validate_guests(self, value):
        required_fields = ['first_name', 'last_name', 'email']
        for guest_data in value:
            for field in required_fields:
                if field not in guest_data:
                    raise serializers.ValidationError(
                        f'Each guest must have: {", ".join(required_fields)}'
                    )
        return value