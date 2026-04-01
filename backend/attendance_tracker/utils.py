from django.utils import timezone
from datetime import datetime, timedelta
from .models import CompanySettings, DailyTarget, PerformanceTracker, PointsLog
from django.contrib.auth import get_user_model

User = get_user_model()


def get_company(user):
    """Get company (Sub-Admin) for a user"""
    if user.role == 'SUB_ADMIN':
        return user
    elif user.role == 'EMPLOYEE' and user.parent_user:
        return user.parent_user
    return None


def get_company_settings(company):
    """Get company settings, create if not exists"""
    settings, created = CompanySettings.objects.get_or_create(
        company=company,
        defaults={
            'office_start_time': '10:00:00',
            'late_threshold_minutes': 15,
            'default_sourcing_target': 5,
            'default_submission_target': 2
        }
    )
    return settings


def get_daily_target(user, date):
    """Get target for user on specific date (custom or default)"""
    try:
        target = DailyTarget.objects.get(user=user, date=date)
        return target
    except DailyTarget.DoesNotExist:
        company = get_company(user)
        settings = get_company_settings(company)
        return {
            'target_sourcing': settings.default_sourcing_target,
            'target_submission': settings.default_submission_target,
            'is_default': True
        }


def calculate_performance_percentage(sourced, submitted, target):
    """Calculate performance percentage"""
    if isinstance(target, dict):
        target_sourcing = target.get('target_sourcing', 5)
        target_submission = target.get('target_submission', 2)
    else:
        target_sourcing = target.target_sourcing
        target_submission = target.target_submission
    
    sourcing_percent = min(100, (sourced / target_sourcing) * 100) if target_sourcing > 0 else 100
    submission_percent = min(100, (submitted / target_submission) * 100) if target_submission > 0 else 100
    
    return (sourcing_percent + submission_percent) / 2


def get_color_code(sourced, submitted, target):
    """Get color code based on target achievement"""
    if isinstance(target, dict):
        target_sourcing = target.get('target_sourcing', 5)
        target_submission = target.get('target_submission', 2)
    else:
        target_sourcing = target.target_sourcing
        target_submission = target.target_submission
    
    sourcing_met = sourced >= target_sourcing
    submission_met = submitted >= target_submission
    
    if sourcing_met and submission_met:
        return "GREEN"
    elif sourcing_met or submission_met:
        return "ORANGE"
    return "RED"


def get_smart_suggestions(user, date, target, sourced_today, submitted_today, performance_trackers):
    """Generate real-time suggestions"""
    suggestions = {}
    
    # Target remaining suggestions
    if isinstance(target, dict):
        target_sourcing = target.get('target_sourcing', 5)
        target_submission = target.get('target_submission', 2)
    else:
        target_sourcing = target.target_sourcing
        target_submission = target.target_submission
    
    sourcing_needed = target_sourcing - sourced_today
    submission_needed = target_submission - submitted_today
    
    if sourcing_needed > 0:
        suggestions['sourcing_needed'] = f"You need {sourcing_needed} more profiles today"
    else:
        suggestions['sourcing_needed'] = "Sourcing target achieved! 🎉"
    
    if submission_needed > 0:
        suggestions['submission_needed'] = f"You need {submission_needed} submissions to reach target"
    else:
        suggestions['submission_needed'] = "Submission target achieved! 🎉"
    
    # #1 ranking suggestion - calculate percentage manually
    today_performance = []
    for pt in performance_trackers:
        pt_target = get_daily_target(pt.user, date)
        pt_percent = calculate_performance_percentage(
            pt.sourced_today, pt.submitted_today, pt_target
        )
        today_performance.append((pt.user, pt_percent))
    
    # Sort by percentage
    today_performance.sort(key=lambda x: x[1], reverse=True)
    
    if today_performance:
        top_user, top_percent = today_performance[0]
        current_percent = calculate_performance_percentage(sourced_today, submitted_today, target)
        
        if top_user != user:
            diff = top_percent - current_percent
            if diff > 0:
                suggestions['ranking_needed'] = f"You need {diff:.1f}% more to become #1"
            else:
                suggestions['ranking_needed'] = "You are #1! 🏆"
        else:
            suggestions['ranking_needed'] = "You are #1! 🏆"
    
    return suggestions


def add_points_log(user, reason, points, description=None):
    """Add points log entry with validation"""
    company = get_company(user)
    
    # Calculate new total (ensure not negative)
    new_total = user.total_points + points
    if new_total < 0:
        new_total = 0  # Don't go below zero
    
    # Create log with old total
    PointsLog.objects.create(
        user=user,
        date=timezone.now().date(),
        reason=reason,
        points=points,
        running_total=new_total,
        description=description,
        company=company
    )
    
    # Update user total points
    user.total_points = new_total
    user.save(update_fields=['total_points'])
    
    return new_total