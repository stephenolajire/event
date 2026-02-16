# tickets/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.db.models import Sum, Count, Q, F
from decimal import Decimal
from rest_framework import serializers

from django.db import models

from .models import (
    TicketType, Order, OrderItem, Ticket, 
    DiscountCode, TicketSale
)
from .serializers import (
    TicketTypeSerializer, TicketTypeCreateSerializer,
    OrderSerializer, OrderCreateSerializer, OrderItemSerializer,
    TicketSerializer, DiscountCodeSerializer, DiscountCodeValidateSerializer,
    TicketSaleSerializer
)


class TicketTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing ticket types
    Public can LIST and RETRIEVE for event ticket purchase
    Only authenticated users can CREATE, UPDATE, DELETE
    """
    queryset = TicketType.objects.all()
    
    def get_permissions(self):
        """
        Allow public access to list and retrieve
        Require authentication for create, update, delete
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TicketTypeCreateSerializer
        return TicketTypeSerializer
    
    def get_queryset(self):
        queryset = TicketType.objects.prefetch_related('benefits')
        
        # Filter by event
        event_id = self.request.query_params.get('event', None)
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        
        # Filter by availability (for public ticket purchase)
        available_only = self.request.query_params.get('available', None)
        if available_only == 'true':
            now = timezone.now()
            queryset = queryset.filter(
                is_active=True,
                is_visible=True,  # Only show visible tickets
                sale_start_date__lte=now,
                sale_end_date__gte=now
            ).filter(
                quantity_sold__lt=models.F('quantity_available')
            )
        
        return queryset.order_by('price')
    
    @action(detail=True, methods=['post'])
    def add_benefit(self, request, pk=None):
        """Add a benefit to a ticket type"""
        from .models import TicketBenefit
        ticket_type = self.get_object()
        
        benefit = TicketBenefit.objects.create(
            ticket_type=ticket_type,
            title=request.data.get('title'),
            description=request.data.get('description', ''),
            icon=request.data.get('icon', ''),
            order=request.data.get('order', 0)
        )
        
        serializer = self.get_serializer(ticket_type)
        return Response(serializer.data)


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing ticket orders
    CREATE is public (for ticket purchase)
    Other actions require authentication
    """
    queryset = Order.objects.all()
    
    def get_permissions(self):
        """
        Allow public access to create orders (ticket purchase)
        Require authentication for other actions
        """
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    def get_queryset(self):
        queryset = Order.objects.prefetch_related('items__ticket_type')
        
        # Filter by event
        event_id = self.request.query_params.get('event', None)
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by payment status
        payment_status = self.request.query_params.get('payment_status', None)
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        
        return queryset
    
    @transaction.atomic
    def create(self, request):
        """Create a new ticket order"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        # Create order
        order = Order.objects.create(
            event_id=data['event'],
            customer_name=data['customer_name'],
            customer_email=data['customer_email'],
            customer_phone=data.get('customer_phone', ''),
            ip_address=self.get_client_ip(request)
        )
        
        subtotal = Decimal('0.00')
        
        # Create order items and calculate totals
        for item_data in data['items']:
            ticket_type = TicketType.objects.select_for_update().get(
                id=item_data['ticket_type_id']
            )
            
            # Check availability again (with lock)
            if ticket_type.quantity_sold + item_data['quantity'] > ticket_type.quantity_available:
                raise serializers.ValidationError(
                    f"Not enough tickets available for {ticket_type.name}"
                )
            
            # Create order item
            order_item = OrderItem.objects.create(
                order=order,
                ticket_type=ticket_type,
                quantity=item_data['quantity'],
                unit_price=ticket_type.price
            )
            
            subtotal += order_item.total_price
            
            # Update ticket type quantity
            ticket_type.quantity_sold += item_data['quantity']
            ticket_type.save()
            
            # Create individual tickets
            for i in range(item_data['quantity']):
                Ticket.objects.create(
                    order_item=order_item,
                    ticket_type=ticket_type,
                    event=ticket_type.event,
                    holder_name=order.customer_name,
                    holder_email=order.customer_email,
                    holder_phone=order.customer_phone
                )
            
            # Create sales record
            TicketSale.objects.create(
                event=ticket_type.event,
                ticket_type=ticket_type,
                order=order,
                quantity_sold=item_data['quantity'],
                revenue=order_item.total_price
            )
        
        # Apply discount if provided
        discount_amount = Decimal('0.00')
        if 'discount_code' in data and data['discount_code']:
            discount_code = DiscountCode.objects.filter(
                code=data['discount_code'],
                is_active=True
            ).first()
            
            if discount_code and discount_code.is_valid:
                if discount_code.discount_type == 'percentage':
                    discount_amount = subtotal * (discount_code.discount_value / 100)
                else:
                    discount_amount = discount_code.discount_value
                
                discount_code.times_used += 1
                discount_code.save()
        
        # Calculate totals
        tax_amount = Decimal('0.00')  # Add tax calculation if needed
        total_amount = subtotal - discount_amount + tax_amount
        
        # Update order
        order.subtotal = subtotal
        order.discount_amount = discount_amount
        order.tax_amount = tax_amount
        order.total_amount = total_amount
        order.save()
        
        # Return order details
        order_serializer = OrderSerializer(order)
        return Response(order_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        """Confirm payment for an order"""
        order = self.get_object()
        
        order.payment_status = 'successful'
        order.status = 'completed'
        order.payment_date = timezone.now()
        order.payment_method = request.data.get('payment_method', '')
        order.payment_reference = request.data.get('payment_reference', '')
        order.save()
        
        # TODO: Send confirmation email with tickets
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an order and refund tickets"""
        order = self.get_object()
        
        if order.status == 'cancelled':
            return Response(
                {'error': 'Order already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            # Update order status
            order.status = 'cancelled'
            order.payment_status = 'refunded'
            order.save()
            
            # Return tickets to inventory
            for item in order.items.all():
                ticket_type = item.ticket_type
                ticket_type.quantity_sold -= item.quantity
                ticket_type.save()
                
                # Cancel individual tickets
                item.tickets.update(status='cancelled')
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class TicketViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing tickets
    """
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Ticket.objects.select_related('ticket_type', 'event')
        
        # Filter by event
        event_id = self.request.query_params.get('event', None)
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        
        # Filter by email (for customer ticket lookup)
        email = self.request.query_params.get('email', None)
        if email:
            queryset = queryset.filter(holder_email=email)
        
        # Filter by ticket number
        ticket_number = self.request.query_params.get('ticket_number', None)
        if ticket_number:
            queryset = queryset.filter(ticket_number=ticket_number)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        """Check in a ticket"""
        ticket = self.get_object()
        
        if ticket.checked_in:
            return Response(
                {'error': 'Ticket already checked in'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if ticket.status != 'valid':
            return Response(
                {'error': f'Ticket is {ticket.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ticket.checked_in = True
        ticket.checked_in_at = timezone.now()
        ticket.checked_in_by = request.user
        ticket.status = 'used'
        ticket.save()
        
        serializer = self.get_serializer(ticket)
        return Response(serializer.data)


class DiscountCodeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing discount codes
    """
    queryset = DiscountCode.objects.all()
    serializer_class = DiscountCodeSerializer
    
    def get_permissions(self):
        """
        Allow public access to validate discount codes
        Require authentication for other actions
        """
        if self.action == 'validate_code':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['post'])
    def validate_code(self, request):
        """Validate a discount code"""
        serializer = DiscountCodeValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        try:
            discount = DiscountCode.objects.get(
                code=data['code'],
                is_active=True
            )
        except DiscountCode.DoesNotExist:
            return Response(
                {'valid': False, 'error': 'Invalid discount code'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check validity
        if not discount.is_valid:
            return Response(
                {'valid': False, 'error': 'Discount code has expired or reached usage limit'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check event
        if discount.event and discount.event.id != data['event_id']:
            return Response(
                {'valid': False, 'error': 'Discount code not valid for this event'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check minimum purchase
        if data['order_total'] < discount.min_purchase_amount:
            return Response(
                {'valid': False, 'error': f'Minimum purchase of {discount.min_purchase_amount} required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate discount
        if discount.discount_type == 'percentage':
            discount_amount = data['order_total'] * (discount.discount_value / 100)
        else:
            discount_amount = discount.discount_value
        
        return Response({
            'valid': True,
            'discount_type': discount.discount_type,
            'discount_value': discount.discount_value,
            'discount_amount': discount_amount
        })