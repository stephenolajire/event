from django.db import models
from django.utils.translation import gettext_lazy as _
from events.models import Event


class Guest(models.Model):
    """Model representing a guest invited to an event."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('declined', 'Declined'),
        ('attended', 'Attended'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Guest Information
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='guests'
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Additional Information
    company = models.CharField(max_length=255, blank=True, null=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(
        blank=True,
        null=True,
        help_text='Internal notes about the guest'
    )
    
    # Plus One
    plus_one_allowed = models.BooleanField(default=False)
    plus_one_name = models.CharField(max_length=200, blank=True, null=True)
    
    # Status and RSVP
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    rsvp_status = models.BooleanField(
        default=False,
        help_text='Has the guest RSVP\'d?'
    )
    rsvp_date = models.DateTimeField(blank=True, null=True)
    
    # Check-in Information
    has_checked_in = models.BooleanField(default=False)
    checked_in_at = models.DateTimeField(blank=True, null=True)
    checked_in_by = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='Staff member who checked in the guest'
    )
    
    # Invitation
    invitation_sent = models.BooleanField(default=False)
    invitation_sent_at = models.DateTimeField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('guest')
        verbose_name_plural = _('guests')
        ordering = ['last_name', 'first_name']
        unique_together = ['event', 'email']
        indexes = [
            models.Index(fields=['event', 'email']),
            models.Index(fields=['event', 'status']),
            models.Index(fields=['has_checked_in']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} - {self.event.title}"
    
    def get_full_name(self):
        """Return the guest's full name."""
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def full_name(self):
        """Property version of get_full_name."""
        return self.get_full_name()
    
    def mark_as_checked_in(self, checked_in_by=None):
        """Mark guest as checked in."""
        from django.utils import timezone
        
        self.has_checked_in = True
        self.checked_in_at = timezone.now()
        self.status = 'attended'
        if checked_in_by:
            self.checked_in_by = checked_in_by
        self.save()