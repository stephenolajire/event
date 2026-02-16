# tickets/models.py
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid


class TicketType(models.Model):
    """Different ticket tiers for an event (VIP, Premium, General, etc.)"""
    
    TICKET_CATEGORIES = [
        ('general', 'General Admission'),
        ('premium', 'Premium'),
        ('vip', 'VIP'),
        ('vvip', 'VVIP'),
        ('early_bird', 'Early Bird'),
        ('student', 'Student'),
        ('group', 'Group'),
    ]
    
    id = models.AutoField(primary_key=True)
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='ticket_types')
    name = models.CharField(max_length=100)  # e.g., "VIP Pass", "Early Bird Special"
    category = models.CharField(max_length=20, choices=TICKET_CATEGORIES, default='general')
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    
    # Capacity
    quantity_available = models.PositiveIntegerField()
    quantity_sold = models.PositiveIntegerField(default=0)
    
    # Sales period
    sale_start_date = models.DateTimeField()
    sale_end_date = models.DateTimeField()
    
    # Restrictions
    min_purchase = models.PositiveIntegerField(default=1)
    max_purchase = models.PositiveIntegerField(default=10)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_visible = models.BooleanField(default=True)  # Show on ticket page
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['price']
        unique_together = ['event', 'name']
    
    def __str__(self):
        return f"{self.event.title} - {self.name}"
    
    @property
    def is_available(self):
        """Check if tickets are still available"""
        from django.utils import timezone
        now = timezone.now()
        return (
            self.is_active and
            self.quantity_sold < self.quantity_available and
            self.sale_start_date <= now <= self.sale_end_date
        )
    
    @property
    def quantity_remaining(self):
        """Get remaining tickets"""
        return self.quantity_available - self.quantity_sold
    
    @property
    def sold_out(self):
        """Check if sold out"""
        return self.quantity_sold >= self.quantity_available


class TicketBenefit(models.Model):
    """Benefits/perks associated with a ticket type"""
    
    ticket_type = models.ForeignKey(TicketType, on_delete=models.CASCADE, related_name='benefits')
    title = models.CharField(max_length=200)  # e.g., "2 VSOP Drinks", "VIP Lounge Access"
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # Icon name for frontend
    order = models.PositiveIntegerField(default=0)  # Display order
    
    class Meta:
        ordering = ['order', 'title']
    
    def __str__(self):
        return f"{self.ticket_type.name} - {self.title}"


class Order(models.Model):
    """Customer order containing one or more tickets"""
    
    ORDER_STATUS = [
        ('pending', 'Pending Payment'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
        ('failed', 'Failed'),
    ]
    
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('successful', 'Successful'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.AutoField(primary_key=True)
    order_number = models.CharField(max_length=50, unique=True, editable=False)
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='orders')
    
    # Customer information
    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20, blank=True)
    
    # Order details
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    
    # Pricing
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Payment details
    payment_method = models.CharField(max_length=50, blank=True)  # e.g., 'paystack', 'stripe'
    payment_reference = models.CharField(max_length=200, blank=True)
    payment_date = models.DateTimeField(null=True, blank=True)
    
    # Additional info
    notes = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order {self.order_number} - {self.customer_name}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)
    
    def generate_order_number(self):
        """Generate unique order number"""
        import string
        import random
        prefix = 'ORD'
        random_string = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        return f"{prefix}-{random_string}"
    
    @property
    def total_tickets(self):
        """Total number of tickets in order"""
        return self.items.aggregate(total=models.Sum('quantity'))['total'] or 0


class OrderItem(models.Model):
    """Individual ticket items in an order"""
    
    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    ticket_type = models.ForeignKey(TicketType, on_delete=models.CASCADE)
    
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.order.order_number} - {self.ticket_type.name} x{self.quantity}"
    
    def save(self, *args, **kwargs):
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)


class Ticket(models.Model):
    """Individual ticket issued to a customer"""
    
    TICKET_STATUS = [
        ('valid', 'Valid'),
        ('used', 'Used'),
        ('cancelled', 'Cancelled'),
        ('transferred', 'Transferred'),
        ('expired', 'Expired'),
    ]
    
    id = models.AutoField(primary_key=True)
    ticket_number = models.CharField(max_length=50, unique=True, editable=False)
    ticket_code = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='tickets')
    ticket_type = models.ForeignKey(TicketType, on_delete=models.CASCADE)
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='tickets')
    
    # Ticket holder info
    holder_name = models.CharField(max_length=200)
    holder_email = models.EmailField()
    holder_phone = models.CharField(max_length=20, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=TICKET_STATUS, default='valid')
    
    # Usage tracking
    checked_in = models.BooleanField(default=False)
    checked_in_at = models.DateTimeField(null=True, blank=True)
    checked_in_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='checked_in_tickets'
    )
    
    # QR Code
    qr_code = models.ImageField(upload_to='ticket_qr_codes/', blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Ticket {self.ticket_number} - {self.holder_name}"
    
    def save(self, *args, **kwargs):
        if not self.ticket_number:
            self.ticket_number = self.generate_ticket_number()
        super().save(*args, **kwargs)
    
    def generate_ticket_number(self):
        """Generate unique ticket number"""
        import string
        import random
        prefix = 'TKT'
        random_string = ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))
        return f"{prefix}-{random_string}"


class DiscountCode(models.Model):
    """Promo/discount codes for tickets"""
    
    DISCOUNT_TYPES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]
    
    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=50, unique=True)
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='discount_codes', null=True, blank=True)
    
    # Discount details
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Restrictions
    min_purchase_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_uses = models.PositiveIntegerField(null=True, blank=True)  # Null = unlimited
    max_uses_per_user = models.PositiveIntegerField(default=1)
    times_used = models.PositiveIntegerField(default=0)
    
    # Validity period
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Applicable ticket types (if empty, applies to all)
    applicable_ticket_types = models.ManyToManyField(TicketType, blank=True, related_name='discount_codes')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.code} - {self.discount_type}"
    
    @property
    def is_valid(self):
        """Check if discount code is currently valid"""
        from django.utils import timezone
        now = timezone.now()
        return (
            self.is_active and
            self.valid_from <= now <= self.valid_until and
            (self.max_uses is None or self.times_used < self.max_uses)
        )


class TicketSale(models.Model):
    """Analytics record for ticket sales"""
    
    id = models.AutoField(primary_key=True)
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='ticket_sales')
    ticket_type = models.ForeignKey(TicketType, on_delete=models.CASCADE, related_name='sales')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='sales')
    
    quantity_sold = models.PositiveIntegerField()
    revenue = models.DecimalField(max_digits=10, decimal_places=2)
    
    sale_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-sale_date']
    
    def __str__(self):
        return f"{self.event.title} - {self.ticket_type.name} - {self.quantity_sold} tickets"