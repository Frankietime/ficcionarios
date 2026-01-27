"""
Ficcionarios CRUD routes
"""
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models import db, Ficcionario, Fichero, Term

ficcionarios_bp = Blueprint('ficcionarios', __name__, url_prefix='/api/ficcionarios')


@ficcionarios_bp.route('', methods=['GET'])
@login_required
def list_ficcionarios():
    """List all ficcionarios"""
    ficcionarios = Ficcionario.query.order_by(Ficcionario.updated_at.desc()).all()
    return jsonify({'ficcionarios': [f.to_dict() for f in ficcionarios]})


@ficcionarios_bp.route('', methods=['POST'])
@login_required
def create_ficcionario():
    """Create a new ficcionario"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body required'}), 400

    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'Title is required'}), 400

    ficcionario = Ficcionario(
        title=title,
        version=data.get('version', '1.0'),
        authors=data.get('authors', ''),
        in_language=data.get('inLanguage', 'es-es'),
        out_language=data.get('outLanguage', 'es-es'),
        output_name=data.get('outputName', ''),
        copyright=data.get('copyright', ''),
        created_by_id=current_user.id,
        updated_by_id=current_user.id
    )

    db.session.add(ficcionario)
    db.session.commit()

    return jsonify({'ficcionario': ficcionario.to_dict()}), 201


@ficcionarios_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_ficcionario(id):
    """Get a ficcionario with its ficheros"""
    ficcionario = Ficcionario.query.get_or_404(id)
    return jsonify({'ficcionario': ficcionario.to_dict(include_ficheros=True)})


@ficcionarios_bp.route('/<int:id>', methods=['PUT'])
@login_required
def update_ficcionario(id):
    """Update a ficcionario"""
    ficcionario = Ficcionario.query.get_or_404(id)
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body required'}), 400

    # Update fields
    if 'title' in data:
        ficcionario.title = data['title'].strip()
    if 'version' in data:
        ficcionario.version = data['version']
    if 'authors' in data:
        ficcionario.authors = data['authors']
    if 'inLanguage' in data:
        ficcionario.in_language = data['inLanguage']
    if 'outLanguage' in data:
        ficcionario.out_language = data['outLanguage']
    if 'outputName' in data:
        ficcionario.output_name = data['outputName']
    if 'copyright' in data:
        ficcionario.copyright = data['copyright']

    ficcionario.updated_by_id = current_user.id
    db.session.commit()

    return jsonify({'ficcionario': ficcionario.to_dict()})


@ficcionarios_bp.route('/<int:id>/clone', methods=['POST'])
@login_required
def clone_ficcionario(id):
    """Deep clone a ficcionario with all its ficheros and terms"""
    source = Ficcionario.query.get_or_404(id)

    clone = Ficcionario(
        title=f"{source.title} (copy)",
        version=source.version,
        authors=source.authors,
        in_language=source.in_language,
        out_language=source.out_language,
        output_name=f"{source.output_name}-copy" if source.output_name else '',
        copyright=source.copyright,
        created_by_id=current_user.id,
        updated_by_id=current_user.id,
    )
    db.session.add(clone)
    db.session.flush()  # get clone.id

    for fichero in source.ficheros.order_by(Fichero.position):
        new_fichero = Fichero(
            ficcionario_id=clone.id,
            story_id=fichero.story_id,
            position=fichero.position,
        )
        db.session.add(new_fichero)
        db.session.flush()

        for term in fichero.terms:
            db.session.add(Term(fichero_id=new_fichero.id, word=term.word))

    db.session.commit()
    return jsonify({'ficcionario': clone.to_dict()}), 201


@ficcionarios_bp.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_ficcionario(id):
    """Delete a ficcionario"""
    ficcionario = Ficcionario.query.get_or_404(id)

    db.session.delete(ficcionario)
    db.session.commit()

    return jsonify({'message': 'Ficcionario deleted successfully'})


# Fichero routes

@ficcionarios_bp.route('/<int:id>/ficheros', methods=['POST'])
@login_required
def create_fichero(id):
    """Add a fichero to a ficcionario"""
    ficcionario = Ficcionario.query.get_or_404(id)
    data = request.get_json() or {}

    # Get max position
    max_pos = db.session.query(db.func.max(Fichero.position)).filter_by(
        ficcionario_id=id
    ).scalar() or -1

    fichero = Fichero(
        ficcionario_id=id,
        story_id=data.get('storyId'),
        position=max_pos + 1
    )

    db.session.add(fichero)
    db.session.commit()

    # Add terms if provided
    terms = data.get('terms', [])
    for word in terms:
        if word.strip():
            term = Term(fichero_id=fichero.id, word=word.strip())
            db.session.add(term)

    db.session.commit()

    ficcionario.updated_by_id = current_user.id
    db.session.commit()

    return jsonify({'fichero': fichero.to_dict()}), 201


@ficcionarios_bp.route('/ficheros/<int:id>', methods=['PUT'])
@login_required
def update_fichero(id):
    """Update a fichero"""
    fichero = Fichero.query.get_or_404(id)
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body required'}), 400

    if 'storyId' in data:
        fichero.story_id = data['storyId']

    if 'position' in data:
        fichero.position = data['position']

    if 'terms' in data:
        # Replace all terms
        Term.query.filter_by(fichero_id=id).delete()
        for word in data['terms']:
            if word.strip():
                term = Term(fichero_id=id, word=word.strip())
                db.session.add(term)

    # Update ficcionario timestamp
    fichero.ficcionario.updated_by_id = current_user.id
    db.session.commit()

    return jsonify({'fichero': fichero.to_dict()})


@ficcionarios_bp.route('/ficheros/<int:id>', methods=['DELETE'])
@login_required
def delete_fichero(id):
    """Delete a fichero"""
    fichero = Fichero.query.get_or_404(id)
    ficcionario = fichero.ficcionario

    db.session.delete(fichero)
    ficcionario.updated_by_id = current_user.id
    db.session.commit()

    return jsonify({'message': 'Fichero deleted successfully'})
