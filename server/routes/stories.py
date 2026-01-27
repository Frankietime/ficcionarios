"""
Stories library routes
"""
import hashlib
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models import db, Story

stories_bp = Blueprint('stories', __name__, url_prefix='/api/stories')


def compute_content_hash(content: str) -> str:
    """Compute SHA-256 hash of content for deduplication"""
    normalized = content.strip().lower()
    return hashlib.sha256(normalized.encode('utf-8')).hexdigest()


@stories_bp.route('', methods=['GET'])
@login_required
def list_stories():
    """List stories with optional search"""
    query = Story.query

    # Search by title or content
    search = request.args.get('search', '').strip()
    if search:
        search_pattern = f'%{search}%'
        query = query.filter(
            db.or_(
                Story.title.ilike(search_pattern),
                Story.content.ilike(search_pattern)
            )
        )

    stories = query.order_by(Story.created_at.desc()).all()
    return jsonify({'stories': [s.to_dict() for s in stories]})


@stories_bp.route('', methods=['POST'])
@login_required
def create_story():
    """Upload a new story (returns existing if duplicate)"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body required'}), 400

    title = data.get('title', '').strip()
    content = data.get('content', '').strip()

    if not title:
        return jsonify({'error': 'Title is required'}), 400

    if not content:
        return jsonify({'error': 'Content is required'}), 400

    # Check for duplicate by content hash
    content_hash = compute_content_hash(content)
    existing = Story.query.filter_by(content_hash=content_hash).first()

    if existing:
        return jsonify({
            'story': existing.to_dict(),
            'isDuplicate': True,
            'message': f'Story already exists as "{existing.title}"'
        }), 200

    # Create new story
    story = Story(
        title=title,
        content=content,
        content_hash=content_hash,
        created_by_id=current_user.id
    )

    db.session.add(story)
    db.session.commit()

    return jsonify({
        'story': story.to_dict(),
        'isDuplicate': False
    }), 201


@stories_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_story(id):
    """Get a story by ID"""
    story = Story.query.get_or_404(id)
    return jsonify({'story': story.to_dict()})


@stories_bp.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_story(id):
    """Delete a story (only if not used by any fichero)"""
    story = Story.query.get_or_404(id)

    if story.ficheros.count() > 0:
        return jsonify({
            'error': 'Cannot delete story that is being used by ficheros'
        }), 409

    db.session.delete(story)
    db.session.commit()

    return jsonify({'message': 'Story deleted successfully'})
