"""
API routes package
"""
from .auth import auth_bp
from .ficcionarios import ficcionarios_bp
from .stories import stories_bp

__all__ = ['auth_bp', 'ficcionarios_bp', 'stories_bp']
