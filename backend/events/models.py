from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator


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
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='events'
    )
    title = models.CharField(max_length=255)
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
        ]
    
    def __str__(self):
        return self.title
    
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