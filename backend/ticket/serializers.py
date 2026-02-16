# tickets/serializers.py
from rest_framework import serializers
from .models import (
    TicketType, TicketBenefit, Order, OrderItem, 
    Ticket, DiscountCode, TicketSale
)


class TicketBenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketBenefit
        fields = ['id', 'title', 'description', 'icon', 'order']


class TicketTypeSerializer(serializers.ModelSerializer):
    benefits = TicketBenefitSerializer(many=True, read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    quantity_remaining = serializers.IntegerField(read_only=True)
    sold_out = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = TicketType
        fields = [
            'id', 'event', 'name', 'category', 'description', 'price',
            'quantity_available', 'quantity_sold', 'quantity_remaining',
            'sale_start_date', 'sale_end_date', 'min_purchase', 'max_purchase',
            'is_active', 'is_visible', 'is_available', 'sold_out',
            'benefits', 'created_at', 'updated_at'
        ]
        read_only_fields = ['quantity_sold']


class TicketTypeCreateSerializer(serializers.ModelSerializer):
    benefits = TicketBenefitSerializer(many=True, required=False)
    
    class Meta:
        model = TicketType
        fields = [
            'event', 'name', 'category', 'description', 'price',
            'quantity_available', 'sale_start_date', 'sale_end_date',
            'min_purchase', 'max_purchase', 'is_active', 'is_visible',
            'benefits'
        ]
    
    def create(self, validated_data):
        benefits_data = validated_data.pop('benefits', [])
        ticket_type = TicketType.objects.create(**validated_data)
        
        for benefit_data in benefits_data:
            TicketBenefit.objects.create(ticket_type=ticket_type, **benefit_data)
        
        return ticket_type


class OrderItemSerializer(serializers.ModelSerializer):
    ticket_type_name = serializers.CharField(source='ticket_type.name', read_only=True)
    ticket_type_category = serializers.CharField(source='ticket_type.category', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'ticket_type', 'ticket_type_name', 'ticket_type_category',
            'quantity', 'unit_price', 'total_price'
        ]
        read_only_fields = ['total_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total_tickets = serializers.IntegerField(read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'event', 'event_title',
            'customer_name', 'customer_email', 'customer_phone',
            'status', 'payment_status', 'subtotal', 'discount_amount',
            'tax_amount', 'total_amount', 'payment_method', 'payment_reference',
            'payment_date', 'notes', 'items', 'total_tickets',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['order_number', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.Serializer):
    event = serializers.IntegerField()
    customer_name = serializers.CharField(max_length=200)
    customer_email = serializers.EmailField()
    customer_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    items = serializers.ListField(
        child=serializers.DictField(
            child=serializers.IntegerField()
        )
    )
    discount_code = serializers.CharField(required=False, allow_blank=True)
    
    def validate_items(self, items):
        """Validate order items"""
        if not items:
            raise serializers.ValidationError("Order must contain at least one item")
        
        for item in items:
            if 'ticket_type_id' not in item or 'quantity' not in item:
                raise serializers.ValidationError("Each item must have ticket_type_id and quantity")
            
            if item['quantity'] < 1:
                raise serializers.ValidationError("Quantity must be at least 1")
        
        return items
    
    def validate(self, data):
        """Validate ticket availability and purchase limits"""
        from .models import TicketType
        
        for item in data['items']:
            try:
                ticket_type = TicketType.objects.get(id=item['ticket_type_id'])
            except TicketType.DoesNotExist:
                raise serializers.ValidationError(f"Ticket type {item['ticket_type_id']} not found")
            
            # Check availability
            if not ticket_type.is_available:
                raise serializers.ValidationError(f"{ticket_type.name} is not available")
            
            # Check quantity
            if item['quantity'] > ticket_type.quantity_remaining:
                raise serializers.ValidationError(
                    f"Only {ticket_type.quantity_remaining} tickets remaining for {ticket_type.name}"
                )
            
            # Check purchase limits
            if item['quantity'] < ticket_type.min_purchase:
                raise serializers.ValidationError(
                    f"Minimum purchase for {ticket_type.name} is {ticket_type.min_purchase}"
                )
            
            if item['quantity'] > ticket_type.max_purchase:
                raise serializers.ValidationError(
                    f"Maximum purchase for {ticket_type.name} is {ticket_type.max_purchase}"
                )
        
        return data


class TicketSerializer(serializers.ModelSerializer):
    ticket_type_name = serializers.CharField(source='ticket_type.name', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_date = serializers.DateTimeField(source='event.date', read_only=True)
    event_location = serializers.CharField(source='event.location', read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_number', 'ticket_code', 'ticket_type', 'ticket_type_name',
            'event', 'event_title', 'event_date', 'event_location',
            'holder_name', 'holder_email', 'holder_phone', 'status',
            'checked_in', 'checked_in_at', 'qr_code', 'created_at'
        ]
        read_only_fields = ['ticket_number', 'ticket_code', 'checked_in', 'checked_in_at', 'qr_code']


class DiscountCodeSerializer(serializers.ModelSerializer):
    is_valid = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = DiscountCode
        fields = [
            'id', 'code', 'event', 'discount_type', 'discount_value',
            'min_purchase_amount', 'max_uses', 'max_uses_per_user',
            'times_used', 'valid_from', 'valid_until', 'is_active',
            'is_valid', 'applicable_ticket_types', 'created_at'
        ]


class DiscountCodeValidateSerializer(serializers.Serializer):
    code = serializers.CharField()
    event_id = serializers.IntegerField()
    order_total = serializers.DecimalField(max_digits=10, decimal_places=2)


class TicketSaleSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    ticket_type_name = serializers.CharField(source='ticket_type.name', read_only=True)
    
    class Meta:
        model = TicketSale
        fields = [
            'id', 'event', 'event_title', 'ticket_type', 'ticket_type_name',
            'order', 'quantity_sold', 'revenue', 'sale_date'
        ]