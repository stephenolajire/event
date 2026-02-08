from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    path('events/<int:event_id>/stats/', views.event_stats, name='event-stats'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('events/<int:event_id>/export/', views.export_guest_list, name='export-guests'),
]