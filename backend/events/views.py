from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from . import permissions

from .models import Event
from .serializers import (
    EventSerializer, 
    EventListSerializer, 
    EventStatsSerializer,
    PublicEventSerializer
)
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
        elif self.action in ['get_by_slug', 'get_by_uuid']:
            return PublicEventSerializer
        return EventSerializer
    
    def get_permissions(self):
        """
        Allow public to list and retrieve events
        Only organizers can create events
        Only owners can update/delete their events
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        elif self.action == 'create':
            permission_classes = [IsAuthenticated, IsEventOrganizer]
        else:
            permission_classes = [IsAuthenticated, permissions.IsOwnerOrReadOnly]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        """Automatically set the organizer to the current user."""
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
    
    @action(detail=True, methods=['get'])
    def ticket_link(self, request, pk=None):
        """
        Get shareable ticket purchase link.
        
        GET /api/events/{id}/ticket_link/
        """
        event = self.get_object()
        from django.conf import settings
        base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        
        return Response({
            'slug_link': event.get_ticket_purchase_link(base_url),
            'uuid_link': event.get_ticket_purchase_link_by_id(base_url),
            'slug': event.slug,
            'unique_id': str(event.unique_id),
            'has_tickets': event.has_tickets
        })
    
    @action(detail=False, methods=['get'], url_path='by-slug/(?P<slug>[-\w]+)', permission_classes=[AllowAny])
    def get_by_slug(self, request, slug=None):
        """
        Get event by slug for public ticket purchase page.
        
        GET /api/events/by-slug/{slug}/
        """
        event = get_object_or_404(Event, slug=slug, is_public=True, status='published')
        serializer = self.get_serializer(event)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='by-id/(?P<unique_id>[0-9a-f-]+)', permission_classes=[AllowAny])
    def get_by_uuid(self, request, unique_id=None):
        """
        Get event by UUID for public ticket purchase page.
        
        GET /api/events/by-id/{uuid}/
        """
        event = get_object_or_404(Event, unique_id=unique_id, is_public=True, status='published')
        serializer = self.get_serializer(event)
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