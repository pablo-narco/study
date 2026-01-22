"""
Service layer for AI plan generation
"""
import json
import logging
from typing import Dict, Any, Optional
from django.conf import settings
from decouple import config

logger = logging.getLogger(__name__)

# Try to import OpenAI, but handle gracefully if not available
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI library not available. Running in mock mode.")


def generate_study_plan(
    goal_text: str,
    current_level: str,
    daily_minutes: int,
    deadline: Optional[str] = None,
    focus_areas: list = None,
    preferred_resources: list = None,
    preferred_language: str = 'en'
) -> Dict[str, Any]:
    """
    Generate a study plan using OpenAI API or mock mode
    
    Returns a structured plan with:
    - weekly_roadmap: List of weekly plans
    - daily_tasks: List of daily tasks with time estimates
    - topics: Prioritized list of topics
    - resources: Recommended resource suggestions
    - checkpoints: Schedule of checkpoints/quizzes
    """
    focus_areas = focus_areas or []
    preferred_resources = preferred_resources or []
    
    # Build the prompt
    prompt = build_prompt(
        goal_text=goal_text,
        current_level=current_level,
        daily_minutes=daily_minutes,
        deadline=deadline,
        focus_areas=focus_areas,
        preferred_resources=preferred_resources,
        preferred_language=preferred_language
    )
    
    # Check if OpenAI API key is available
    api_key = config('OPENAI_API_KEY', default='')
    model = config('OPENAI_MODEL', default='gpt-4-turbo-preview')
    
    if not api_key or not OPENAI_AVAILABLE:
        logger.info("OpenAI API key not configured. Using mock mode.")
        return generate_mock_plan(
            goal_text=goal_text,
            current_level=current_level,
            daily_minutes=daily_minutes,
            deadline=deadline,
            focus_areas=focus_areas,
            preferred_resources=preferred_resources
        )
    
    try:
        client = OpenAI(api_key=api_key)
        
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert educational planner. Create detailed, structured study plans in JSON format."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        plan_data = json.loads(content)
        
        # Log the API call (without sensitive data)
        logger.info(f"OpenAI API call successful. Model: {model}, Tokens used: {response.usage.total_tokens if hasattr(response, 'usage') else 'N/A'}")
        
        return {
            'weekly_roadmap': plan_data.get('weekly_roadmap', []),
            'daily_tasks': plan_data.get('daily_tasks', []),
            'topics': plan_data.get('topics', []),
            'resources': plan_data.get('resources', []),
            'checkpoints': plan_data.get('checkpoints', []),
            'model_used': model,
            'prompt_used': prompt
        }
    
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        # Fallback to mock mode on error
        logger.info("Falling back to mock mode due to API error.")
        return generate_mock_plan(
            goal_text=goal_text,
            current_level=current_level,
            daily_minutes=daily_minutes,
            deadline=deadline,
            focus_areas=focus_areas,
            preferred_resources=preferred_resources
        )


def build_prompt(
    goal_text: str,
    current_level: str,
    daily_minutes: int,
    deadline: Optional[str] = None,
    focus_areas: list = None,
    preferred_resources: list = None,
    preferred_language: str = 'en'
) -> str:
    """Build the prompt for OpenAI"""
    focus_areas = focus_areas or []
    preferred_resources = preferred_resources or []
    
    prompt = f"""Create a comprehensive, structured study plan in JSON format for the following learning goal:

Goal: {goal_text}
Current Level: {current_level}
Daily Available Time: {daily_minutes} minutes per day"""
    
    if deadline:
        prompt += f"\nDeadline: {deadline}"
    
    if focus_areas:
        prompt += f"\nFocus Areas: {', '.join(focus_areas)}"
    
    if preferred_resources:
        prompt += f"\nPreferred Resource Types: {', '.join(preferred_resources)}"
    
    prompt += f"""
Preferred UI Language: {preferred_language}

Please provide a JSON response with the following structure:
{{
    "weekly_roadmap": [
        {{
            "week": 1,
            "focus": "Week focus description",
            "topics": ["topic1", "topic2"],
            "estimated_hours": 10
        }}
    ],
    "daily_tasks": [
        {{
            "day": 1,
            "week": 1,
            "tasks": [
                {{
                    "title": "Task title",
                    "description": "Task description",
                    "estimated_minutes": 30,
                    "type": "reading|listening|speaking|writing|grammar|vocabulary"
                }}
            ]
        }}
    ],
    "topics": [
        {{
            "name": "Topic name",
            "priority": "high|medium|low",
            "estimated_hours": 5,
            "description": "Topic description"
        }}
    ],
    "resources": [
        {{
            "title": "Resource title",
            "type": "video|book|app|podcast|website",
            "description": "Resource description",
            "url": "optional-url-if-applicable"
        }}
    ],
    "checkpoints": [
        {{
            "week": 2,
            "type": "quiz|assessment|review",
            "description": "Checkpoint description",
            "topics_covered": ["topic1", "topic2"]
        }}
    ]
}}

Make the plan realistic, progressive, and tailored to the user's level and available time. Ensure daily tasks fit within the {daily_minutes} minutes per day constraint."""
    
    return prompt


def generate_mock_plan(
    goal_text: str,
    current_level: str,
    daily_minutes: int,
    deadline: Optional[str] = None,
    focus_areas: list = None,
    preferred_resources: list = None
) -> Dict[str, Any]:
    """Generate a mock study plan when OpenAI is not available"""
    focus_areas = focus_areas or ['reading', 'writing', 'listening', 'speaking']
    preferred_resources = preferred_resources or ['videos', 'books']
    
    # Calculate number of weeks (default 12 weeks if no deadline)
    weeks = 12
    
    weekly_roadmap = []
    daily_tasks = []
    topics = []
    resources = []
    checkpoints = []
    
    # Generate weekly roadmap
    for week in range(1, weeks + 1):
        weekly_roadmap.append({
            'week': week,
            'focus': f'Week {week} focus: Building foundation in {", ".join(focus_areas[:2])}',
            'topics': [f'Topic {week}.1', f'Topic {week}.2'],
            'estimated_hours': daily_minutes * 7 / 60  # Convert minutes to hours
        })
    
    # Generate daily tasks for first 2 weeks as example
    task_id = 1
    for week in range(1, 3):
        for day in range(1, 8):
            tasks_for_day = []
            remaining_minutes = daily_minutes
            
            # Add 2-3 tasks per day
            for i in range(2):
                task_minutes = min(remaining_minutes // 2, 30)
                if task_minutes < 10:
                    break
                
                task_type = focus_areas[i % len(focus_areas)]
                tasks_for_day.append({
                    'title': f'{task_type.capitalize()} Practice {task_id}',
                    'description': f'Practice {task_type} skills with recommended resources',
                    'estimated_minutes': task_minutes,
                    'type': task_type
                })
                remaining_minutes -= task_minutes
                task_id += 1
            
            if tasks_for_day:
                daily_tasks.append({
                    'day': (week - 1) * 7 + day,
                    'week': week,
                    'tasks': tasks_for_day
                })
    
    # Generate topics
    for i in range(1, 21):
        topics.append({
            'name': f'Topic {i}: Core Concept',
            'priority': 'high' if i <= 7 else 'medium' if i <= 14 else 'low',
            'estimated_hours': 2,
            'description': f'Important topic for achieving your goal: {goal_text[:50]}...'
        })
    
    # Generate resources
    resource_types = preferred_resources or ['videos', 'books']
    for i, res_type in enumerate(resource_types[:5]):
        resources.append({
            'title': f'Recommended {res_type.capitalize()} Resource {i+1}',
            'type': res_type,
            'description': f'A high-quality {res_type} resource for {current_level} level learners',
            'url': None
        })
    
    # Generate checkpoints
    for week in [2, 4, 8, 12]:
        checkpoints.append({
            'week': week,
            'type': 'assessment',
            'description': f'Week {week} progress assessment and review',
            'topics_covered': [f'Topic {week-1}.1', f'Topic {week-1}.2']
        })
    
    return {
        'weekly_roadmap': weekly_roadmap,
        'daily_tasks': daily_tasks,
        'topics': topics,
        'resources': resources,
        'checkpoints': checkpoints,
        'model_used': 'mock-mode',
        'prompt_used': f'Mock plan for: {goal_text}'
    }
