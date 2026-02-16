# accounts/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication."""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user with the given email and password."""
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('user_type', 'organizer')  # Superuser is organizer
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom user model that uses email instead of username."""
    
    USER_TYPE_CHOICES = [
        ('customer', 'Customer'),
        ('organizer', 'Event Organizer'),
    ]
    
    username = None  # Remove username field
    email = models.EmailField(_('email address'), unique=True)
    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPE_CHOICES,
        default='customer',
        help_text='Customer can purchase tickets, Organizer can create events'
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    organization = models.CharField(max_length=255, blank=True, null=True)
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        blank=True,
        null=True
    )
    
    # Additional fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.email} ({self.get_user_type_display()})"
    
    def get_full_name(self):
        """Return the first_name plus the last_name, with a space in between."""
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def is_customer(self):
        """Check if user is a customer."""
        return self.user_type == 'customer'
    
    @property
    def is_organizer(self):
        """Check if user is an event organizer."""
        return self.user_type == 'organizer'
    
    @property
    def total_events(self):
        """Return total number of events created by this user."""
        if self.is_organizer:
            return self.events.count()
        return 0
    
    @property
    def total_guests(self):
        """Return total number of guests across all events."""
        if self.is_organizer:
            from guests.models import Guest
            return Guest.objects.filter(event__organizer=self).count()
        return 0
    
    @property
    def total_tickets_purchased(self):
        """Return total number of tickets purchased by customer."""
        if self.is_customer:
            from ticket.models import Ticket
            return Ticket.objects.filter(holder_email=self.email).count()
        return 0
    
    @property
    def total_orders(self):
        """Return total number of orders placed by customer."""
        if self.is_customer:
            from ticket.models import Order
            return Order.objects.filter(customer_email=self.email).count()
        return 0