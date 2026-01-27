"""
SQLAlchemy database models
"""
from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(UserMixin, db.Model):
    """User model for authentication"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    ficcionarios_created = db.relationship(
        'Ficcionario',
        foreign_keys='Ficcionario.created_by_id',
        backref='creator',
        lazy='dynamic'
    )
    ficcionarios_updated = db.relationship(
        'Ficcionario',
        foreign_keys='Ficcionario.updated_by_id',
        backref='updater',
        lazy='dynamic'
    )
    stories_created = db.relationship(
        'Story',
        backref='creator',
        lazy='dynamic'
    )

    def set_password(self, password: str) -> None:
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verify password against hash"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> dict:
        """Serialize user for API response"""
        return {
            'id': self.id,
            'username': self.username,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self) -> str:
        return f'<User {self.username}>'


class Ficcionario(db.Model):
    """Dictionary project model"""
    __tablename__ = 'ficcionarios'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    version = db.Column(db.String(20), default='1.0')
    authors = db.Column(db.String(200))
    in_language = db.Column(db.String(10), default='es-es')
    out_language = db.Column(db.String(10), default='es-es')
    output_name = db.Column(db.String(100))
    cover_image_path = db.Column(db.String(500))
    copyright = db.Column(db.Text)

    # Tracking
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    updated_by_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    ficheros = db.relationship('Fichero', backref='ficcionario', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_ficheros: bool = False) -> dict:
        """Serialize for API response"""
        # Get unique story titles from ficheros
        story_titles = []
        for fichero in self.ficheros:
            if fichero.story and fichero.story.title not in story_titles:
                story_titles.append(fichero.story.title)

        data = {
            'id': self.id,
            'title': self.title,
            'version': self.version,
            'authors': self.authors,
            'inLanguage': self.in_language,
            'outLanguage': self.out_language,
            'outputName': self.output_name,
            'coverImagePath': self.cover_image_path,
            'copyright': self.copyright,
            'createdBy': self.creator.to_dict() if self.creator else None,
            'updatedBy': self.updater.to_dict() if self.updater else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'ficheroCount': self.ficheros.count(),
            'storyCount': len(story_titles),
            'storyTitles': story_titles
        }
        if include_ficheros:
            data['ficheros'] = [f.to_dict() for f in self.ficheros.order_by(Fichero.position)]
        return data

    def __repr__(self) -> str:
        return f'<Ficcionario {self.title}>'


class Story(db.Model):
    """Shared story library with content deduplication"""
    __tablename__ = 'stories'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    content_hash = db.Column(db.String(64), unique=True, nullable=False, index=True)

    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    ficheros = db.relationship('Fichero', backref='story', lazy='dynamic')

    def to_dict(self) -> dict:
        """Serialize for API response"""
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'contentHash': self.content_hash,
            'createdBy': self.creator.to_dict() if self.creator else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self) -> str:
        return f'<Story {self.title}>'


class Fichero(db.Model):
    """Term group linking terms to a story"""
    __tablename__ = 'ficheros'

    id = db.Column(db.Integer, primary_key=True)
    ficcionario_id = db.Column(db.Integer, db.ForeignKey('ficcionarios.id'), nullable=False)
    story_id = db.Column(db.Integer, db.ForeignKey('stories.id'))
    position = db.Column(db.Integer, default=0)

    # Relationships
    terms = db.relationship('Term', backref='fichero', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self) -> dict:
        """Serialize for API response"""
        return {
            'id': self.id,
            'ficcionarioId': self.ficcionario_id,
            'storyId': self.story_id,
            'story': self.story.to_dict() if self.story else None,
            'position': self.position,
            'terms': [t.to_dict() for t in self.terms]
        }

    def __repr__(self) -> str:
        return f'<Fichero {self.id}>'


class Term(db.Model):
    """Individual term/word in a fichero"""
    __tablename__ = 'terms'

    id = db.Column(db.Integer, primary_key=True)
    fichero_id = db.Column(db.Integer, db.ForeignKey('ficheros.id'), nullable=False)
    word = db.Column(db.String(100), nullable=False)

    def to_dict(self) -> dict:
        """Serialize for API response"""
        return {
            'id': self.id,
            'ficheroId': self.fichero_id,
            'word': self.word
        }

    def __repr__(self) -> str:
        return f'<Term {self.word}>'
