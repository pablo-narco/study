from django.urls import path
from .views import PlanListView, PlanDetailView, regenerate_plan

urlpatterns = [
    path('', PlanListView.as_view(), name='plan-list'),
    path('<int:pk>', PlanDetailView.as_view(), name='plan-detail'),
    path('<int:plan_id>/regenerate', regenerate_plan, name='plan-regenerate'),
]
