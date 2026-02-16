# tickets/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TicketTypeViewSet, OrderViewSet, TicketViewSet, DiscountCodeViewSet
)

router = DefaultRouter()
router.register(r'ticket-types', TicketTypeViewSet, basename='ticket-type')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'discount-codes', DiscountCodeViewSet, basename='discount-code')

urlpatterns = [
    path('', include(router.urls)),
]