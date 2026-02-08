from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Event
from .serializers import EventSerializer, EventListSerializer, EventStatsSerializer
from .permissions import IsEventOrganizer


class EventViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Event CRUD operations.
    
    list: GET /api/events/
    create: POST /api/events/
    retrieve: GET /api/events/{id}/
    update: PUT /api/events/{id}/
    partial_update: PATCH /api/events/{id}/
    destroy: DELETE /api/events/{id}/
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'location', 'venue_name']
    ordering_fields = ['event_date', 'created_at', 'title']
    ordering = ['-event_date']
    
    def get_queryset(self):
        """Return events created by the authenticated user."""
        user = self.request.user
        queryset = Event.objects.filter(organizer=user)
        
        # Filter by status
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(event_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(event_date__lte=end_date)
        
        return queryset
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return EventListSerializer
        elif self.action == 'stats':
            return EventStatsSerializer
        return EventSerializer
    
    def get_permissions(self):
        """
        Instantiate and return the list of permissions.
        Only the organizer can update or delete an event.
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsEventOrganizer]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        """Save the organizer as the current user."""
        serializer.save(organizer=self.request.user)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """
        Get statistics for a specific event.
        
        GET /api/events/{id}/stats/
        """
        event = self.get_object()
        serializer = EventStatsSerializer(event)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """
        Publish an event (change status from draft to published).
        
        POST /api/events/{id}/publish/
        """
        event = self.get_object()
        
        if event.status == 'published':
            return Response(
                {'message': 'Event is already published.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        event.status = 'published'
        event.save()
        
        serializer = self.get_serializer(event)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel an event.
        
        POST /api/events/{id}/cancel/
        """
        event = self.get_object()
        
        if event.status == 'cancelled':
            return Response(
                {'message': 'Event is already cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        event.status = 'cancelled'
        event.save()
        
        # TODO: Send cancellation emails to all guests
        
        serializer = self.get_serializer(event)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """
        Get upcoming events for the authenticated user.
        
        GET /api/events/upcoming/
        """
        from django.utils import timezone
        
        events = Event.objects.filter(
            organizer=request.user,
            event_date__gte=timezone.now(),
            status__in=['published', 'ongoing']
        ).order_by('event_date')
        
        serializer = EventListSerializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def past(self, request):
        """
        Get past events for the authenticated user.
        
        GET /api/events/past/
        """
        from django.utils import timezone
        
        events = Event.objects.filter(
            organizer=request.user,
            event_date__lt=timezone.now()
        ).order_by('-event_date')
        
        serializer = EventListSerializer(events, many=True)
        return Response(serializer.data)