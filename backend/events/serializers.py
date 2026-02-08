from rest_framework import serializers
from .models import Event
from accounts.serializers import UserSerializer


class EventSerializer(serializers.ModelSerializer):
    """Serializer for Event model."""
    
    organizer_details = UserSerializer(source='organizer', read_only=True)
    total_guests = serializers.IntegerField(read_only=True)
    checked_in_count = serializers.IntegerField(read_only=True)
    pending_count = serializers.IntegerField(read_only=True)
    attendance_rate = serializers.FloatField(read_only=True)
    is_at_capacity = serializers.BooleanField(read_only=True)
    available_slots = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'organizer', 'organizer_details', 'title', 'description',
            'event_date', 'event_end_date', 'location', 'venue_name', 'address',
            'banner_image', 'capacity', 'allow_plus_one', 'require_rsvp',
            'enable_self_checkin', 'checkin_start_time', 'checkin_end_time',
            'status', 'is_public', 'total_guests', 'checked_in_count',
            'pending_count', 'attendance_rate', 'is_at_capacity',
            'available_slots', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'organizer', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        """Validate event dates."""
        event_date = attrs.get('event_date')
        event_end_date = attrs.get('event_end_date')
        checkin_start = attrs.get('checkin_start_time')
        checkin_end = attrs.get('checkin_end_time')
        
        # Validate event end date
        if event_end_date and event_date:
            if event_end_date <= event_date:
                raise serializers.ValidationError({
                    'event_end_date': 'Event end date must be after start date.'
                })
        
        # Validate check-in times
        if checkin_start and checkin_end:
            if checkin_end <= checkin_start:
                raise serializers.ValidationError({
                    'checkin_end_time': 'Check-in end time must be after start time.'
                })
        
        return attrs
    
    def create(self, validated_data):
        """Create event with the authenticated user as organizer."""
        validated_data['organizer'] = self.context['request'].user
        return super().create(validated_data)


class EventListSerializer(serializers.ModelSerializer):
    """Simplified serializer for event list view."""
    
    organizer_name = serializers.CharField(source='organizer.get_full_name', read_only=True)
    total_guests = serializers.IntegerField(read_only=True)
    checked_in_count = serializers.IntegerField(read_only=True)
    attendance_rate = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'event_date', 'location', 'venue_name',
            'status', 'organizer_name', 'total_guests', 'checked_in_count',
            'attendance_rate', 'banner_image', 'created_at'
        ]


class EventStatsSerializer(serializers.ModelSerializer):
    """Serializer for event statistics."""
    
    total_guests = serializers.IntegerField(read_only=True)
    checked_in_count = serializers.IntegerField(read_only=True)
    pending_count = serializers.IntegerField(read_only=True)
    attendance_rate = serializers.FloatField(read_only=True)
    is_at_capacity = serializers.BooleanField(read_only=True)
    available_slots = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'total_guests', 'checked_in_count',
            'pending_count', 'attendance_rate', 'capacity',
            'is_at_capacity', 'available_slots'
        ]