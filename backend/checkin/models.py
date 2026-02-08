from django.db import models
from django.conf import settings
from guests.models import Guest


class CheckIn(models.Model):
    """Model to track check-in history."""
    
    guest = models.ForeignKey(
        Guest,
        on_delete=models.CASCADE,
        related_name='checkin_history'
    )
    checked_in_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='checked_in_guests'
    )
    check_in_method = models.CharField(
        max_length=20,
        choices=[
            ('qr_scan', 'QR Scan'),
            ('manual', 'Manual'),
            ('self', 'Self Check-in')
        ],
        default='qr_scan'
    )
    notes = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Check-in'
        verbose_name_plural = 'Check-ins'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.guest.full_name} - {self.created_at}"