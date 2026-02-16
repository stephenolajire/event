from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from django.utils.text import slugify
import uuid


class Event(models.Model):
    """Model representing an event."""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Basic Information
    organizer = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='events',
        limit_choices_to={'user_type': 'organizer'}  
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True, blank=True, null=True)
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    # Event Details
    event_date = models.DateTimeField()
    event_end_date = models.DateTimeField(blank=True, null=True)
    location = models.CharField(max_length=500)
    venue_name = models.CharField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    # Event Image
    banner_image = models.ImageField(
        upload_to='event_banners/',
        blank=True,
        null=True
    )
    
    # Capacity and Settings
    capacity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        blank=True,
        null=True,
        help_text='Maximum number of guests allowed'
    )
    allow_plus_one = models.BooleanField(
        default=False,
        help_text='Allow guests to bring a plus one'
    )
    require_rsvp = models.BooleanField(
        default=True,
        help_text='Require guests to RSVP before attending'
    )
    
    # Check-in Settings
    enable_self_checkin = models.BooleanField(
        default=False,
        help_text='Allow guests to check themselves in'
    )
    checkin_start_time = models.DateTimeField(
        blank=True,
        null=True,
        help_text='When check-in should start'
    )
    checkin_end_time = models.DateTimeField(
        blank=True,
        null=True,
        help_text='When check-in should end'
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )
    is_public = models.BooleanField(
        default=False,
        help_text='Make event publicly visible'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('event')
        verbose_name_plural = _('events')
        ordering = ['-event_date']
        indexes = [
            models.Index(fields=['-event_date']),
            models.Index(fields=['organizer', '-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['slug']),
            models.Index(fields=['unique_id']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self.generate_unique_slug()
        super().save(*args, **kwargs)
    
    def generate_unique_slug(self):
        """Generate a unique slug for the event"""
        base_slug = slugify(self.title)
        slug = base_slug
        counter = 1
        
        while Event.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug
    
    def get_ticket_purchase_link(self, base_url=None):
        """Generate shareable link for ticket purchase"""
        if base_url is None:
            base_url = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:5173'
        
        return f"{base_url}/events/{self.slug}/tickets"
    
    def get_ticket_purchase_link_by_id(self, base_url=None):
        """Generate shareable link using UUID (alternative method)"""
        if base_url is None:
            base_url = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:5173'
        
        return f"{base_url}/events/{self.unique_id}/tickets"
    
    @property
    def has_tickets(self):
        """Check if event has ticket types"""
        return self.ticket_types.exists()
    
    @property
    def total_guests(self):
        """Return total number of guests for this event."""
        return self.guests.count()
    
    @property
    def checked_in_count(self):
        """Return number of guests who have checked in."""
        return self.guests.filter(has_checked_in=True).count()
    
    @property
    def pending_count(self):
        """Return number of guests who haven't checked in yet."""
        return self.guests.filter(has_checked_in=False).count()
    
    @property
    def attendance_rate(self):
        """Calculate attendance rate as percentage."""
        if self.total_guests == 0:
            return 0
        return round((self.checked_in_count / self.total_guests) * 100, 2)
    
    @property
    def is_at_capacity(self):
        """Check if event has reached capacity."""
        if self.capacity is None:
            return False
        return self.total_guests >= self.capacity
    
    @property
    def available_slots(self):
        """Return number of available slots."""
        if self.capacity is None:
            return None
        return max(0, self.capacity - self.total_guests)