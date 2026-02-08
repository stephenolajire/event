from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    path('send-invite/', views.send_invite, name='send-invite'),
    path('send-bulk-invites/', views.send_bulk_invites, name='send-bulk-invites'),
    path('send-reminder/', views.send_event_reminder, name='send-reminder'),
]