"""
Flask application for Kindle Dictionary Generator
"""
import os
import subprocess
import tempfile
from pathlib import Path

from flask import Flask, request, send_file, send_from_directory, jsonify
from flask_cors import CORS
from flask_login import LoginManager, login_required, current_user
from flask_migrate import Migrate

from .config import config
from .models import db, User, Ficcionario, Fichero
from .routes import auth_bp, ficcionarios_bp, stories_bp
from . import generator

# Paths
SERVER_DIR = Path(__file__).parent
CLIENT_DIST = SERVER_DIR.parent / 'client' / 'dist'
KINDLEGEN_PATH = SERVER_DIR / 'bin' / 'kindlegen.exe'

# Initialize extensions
login_manager = LoginManager()
migrate = Migrate()


def create_app(config_name: str = 'default') -> Flask:
    """Application factory"""
    app = Flask(__name__, static_folder=str(CLIENT_DIST), static_url_path='')

    # Load configuration
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    # CORS for development
    CORS(app, supports_credentials=True, origins=['http://localhost:5173', 'http://127.0.0.1:5173'])

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(ficcionarios_bp)
    app.register_blueprint(stories_bp)

    # Register routes
    register_routes(app)

    return app


@login_manager.user_loader
def load_user(user_id: str) -> User | None:
    """Load user by ID for Flask-Login"""
    return User.query.get(int(user_id))


@login_manager.unauthorized_handler
def unauthorized():
    """Handle unauthorized access"""
    return jsonify({'error': 'Authentication required'}), 401


def register_routes(app: Flask) -> None:
    """Register application routes"""

    @app.route('/')
    def index():
        """Serve the React app"""
        return send_from_directory(CLIENT_DIST, 'index.html')

    @app.route('/<path:path>')
    def static_files(path):
        """Serve static files from React build"""
        # Don't serve API routes as static
        if path.startswith('api/'):
            return jsonify({'error': 'Not found'}), 404
        if (CLIENT_DIST / path).exists():
            return send_from_directory(CLIENT_DIST, path)
        return send_from_directory(CLIENT_DIST, 'index.html')

    @app.route('/api/ficcionarios/<int:id>/generate', methods=['POST'])
    @login_required
    def generate_from_ficcionario(id):
        """Generate .mobi from a ficcionario"""
        ficcionario = Ficcionario.query.get_or_404(id)

        # Validate ficcionario
        if not ficcionario.title:
            return jsonify({'error': 'Title is required'}), 400
        if not ficcionario.authors:
            return jsonify({'error': 'Authors is required'}), 400
        if not ficcionario.output_name:
            return jsonify({'error': 'Output name is required'}), 400

        # Get all ficheros with their terms and stories
        ficheros = ficcionario.ficheros.all()
        if not ficheros:
            return jsonify({'error': 'At least one fichero is required'}), 400

        # Build entries from ficheros
        entries = []
        for fichero in ficheros:
            if not fichero.story:
                continue
            terms = [t.word for t in fichero.terms]
            if terms:
                for term in terms:
                    entries.append((term, fichero.story.content))

        if not entries:
            return jsonify({'error': 'No complete ficheros (with terms and story) found'}), 400

        # Check kindlegen exists
        if not KINDLEGEN_PATH.exists():
            return jsonify({'error': f'kindlegen.exe not found at {KINDLEGEN_PATH}'}), 500

        # Handle cover image
        cover_image_path = None
        if ficcionario.cover_image_path and Path(ficcionario.cover_image_path).exists():
            cover_image_path = ficcionario.cover_image_path

        # Create temp directory for output
        with tempfile.TemporaryDirectory() as temp_dir:
            config_dict = {
                'title': ficcionario.title,
                'creator': ficcionario.authors,
                'in_language': ficcionario.in_language,
                'out_language': ficcionario.out_language,
                'version': ficcionario.version,
                'output_name': ficcionario.output_name,
                'cover_image_path': cover_image_path,
                'copyright': ficcionario.copyright or '',
                'usage': '',
                'entries': entries,
                'custom_styles': ''
            }

            # Generate dictionary HTML/OPF files
            opf_filename = generator.generate_dictionary(temp_dir, config_dict)
            opf_path = Path(temp_dir) / opf_filename

            # Run kindlegen to create .mobi
            result = subprocess.run(
                [str(KINDLEGEN_PATH), str(opf_path)],
                capture_output=True,
                text=True,
                cwd=temp_dir
            )

            # Check for .mobi file
            mobi_filename = f'{ficcionario.output_name}.mobi'
            mobi_path = Path(temp_dir) / mobi_filename

            if not mobi_path.exists():
                error_msg = result.stderr or result.stdout or 'Unknown error generating .mobi'
                return jsonify({'error': f'kindlegen error: {error_msg}'}), 500

            # Copy mobi to a temp location that persists
            final_mobi_path = os.path.join(tempfile.gettempdir(), mobi_filename)
            with open(mobi_path, 'rb') as src, open(final_mobi_path, 'wb') as dst:
                dst.write(src.read())

            return send_file(
                final_mobi_path,
                mimetype='application/x-mobipocket-ebook',
                as_attachment=True,
                download_name=mobi_filename
            )

    @app.route('/generate', methods=['POST'])
    def generate_dictionary_legacy():
        """Legacy endpoint - Handle form submission and generate dictionary files"""
        try:
            # Get form data
            title = request.form.get('title', '').strip()
            creator = request.form.get('creator', '').strip()
            in_language = request.form.get('in_language', 'es-es').strip()
            out_language = request.form.get('out_language', 'es-es').strip()
            version = request.form.get('version', '1.0').strip()
            output_name = request.form.get('output_name', '').strip()
            copyright_text = request.form.get('copyright', '').strip()
            usage_text = request.form.get('usage', '').strip()
            custom_styles = request.form.get('custom_styles', '').strip()

            # Get definition groups
            words_list = request.form.getlist('words[]')
            definitions_list = request.form.getlist('definition[]')

            # Build entries from groups
            entries = []
            for words_str, definition in zip(words_list, definitions_list):
                if words_str.strip() and definition.strip():
                    words = [w.strip() for w in words_str.split(',') if w.strip()]
                    for word in words:
                        entries.append((word, definition))

            # Validate required fields
            if not title:
                return jsonify({'error': 'Title is required'}), 400
            if not creator:
                return jsonify({'error': 'Creator is required'}), 400
            if not output_name:
                return jsonify({'error': 'Output name is required'}), 400

            # Check kindlegen exists
            if not KINDLEGEN_PATH.exists():
                return jsonify({'error': f'kindlegen.exe not found at {KINDLEGEN_PATH}'}), 500

            # Handle cover image
            cover_image_path = None
            if 'cover_image' in request.files:
                cover_file = request.files['cover_image']
                if cover_file.filename:
                    cover_image_name = cover_file.filename
                    temp_cover = tempfile.NamedTemporaryFile(delete=False, suffix=Path(cover_image_name).suffix)
                    cover_file.save(temp_cover.name)
                    cover_image_path = temp_cover.name

            # Create temp directory for output
            with tempfile.TemporaryDirectory() as temp_dir:
                config_dict = {
                    'title': title,
                    'creator': creator,
                    'in_language': in_language,
                    'out_language': out_language,
                    'version': version,
                    'output_name': output_name,
                    'cover_image_path': cover_image_path,
                    'copyright': copyright_text,
                    'usage': usage_text,
                    'entries': entries,
                    'custom_styles': custom_styles
                }

                # Generate dictionary HTML/OPF files
                opf_filename = generator.generate_dictionary(temp_dir, config_dict)
                opf_path = Path(temp_dir) / opf_filename

                # Run kindlegen to create .mobi
                result = subprocess.run(
                    [str(KINDLEGEN_PATH), str(opf_path)],
                    capture_output=True,
                    text=True,
                    cwd=temp_dir
                )

                # Check for .mobi file
                mobi_filename = f'{output_name}.mobi'
                mobi_path = Path(temp_dir) / mobi_filename

                if not mobi_path.exists():
                    error_msg = result.stderr or result.stdout or 'Unknown error generating .mobi'
                    return jsonify({'error': f'kindlegen error: {error_msg}'}), 500

                # Clean up temp cover image
                if cover_image_path and os.path.exists(cover_image_path):
                    os.unlink(cover_image_path)

                # Copy mobi to a temp location that persists
                final_mobi_path = os.path.join(tempfile.gettempdir(), mobi_filename)
                with open(mobi_path, 'rb') as src, open(final_mobi_path, 'wb') as dst:
                    dst.write(src.read())

                return send_file(
                    final_mobi_path,
                    mimetype='application/x-mobipocket-ebook',
                    as_attachment=True,
                    download_name=mobi_filename
                )

        except Exception as e:
            return jsonify({'error': str(e)}), 500


# Create app instance
app = create_app(os.environ.get('FLASK_ENV', 'development'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)
