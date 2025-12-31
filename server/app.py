"""
Flask application for Kindle Dictionary Generator
"""
import os
import subprocess
import tempfile
from pathlib import Path
from flask import Flask, request, send_file, send_from_directory, jsonify
from . import generator

# Paths
SERVER_DIR = Path(__file__).parent
CLIENT_DIST = SERVER_DIR.parent / 'client' / 'dist'
KINDLEGEN_PATH = SERVER_DIR / 'bin' / 'kindlegen.exe'

app = Flask(__name__, static_folder=str(CLIENT_DIST), static_url_path='')


@app.route('/')
def index():
    """Serve the React app"""
    return send_from_directory(CLIENT_DIST, 'index.html')


@app.route('/<path:path>')
def static_files(path):
    """Serve static files from React build"""
    if (CLIENT_DIST / path).exists():
        return send_from_directory(CLIENT_DIST, path)
    return send_from_directory(CLIENT_DIST, 'index.html')


@app.route('/generate', methods=['POST'])
def generate_dictionary():
    """Handle form submission and generate dictionary files"""
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
                # Split words by comma
                words = [w.strip() for w in words_str.split(',') if w.strip()]
                for word in words:
                    entries.append((word, definition))

        # Validate required fields
        if not title:
            return jsonify({'error': 'El titulo es requerido'}), 400
        if not creator:
            return jsonify({'error': 'El creador es requerido'}), 400
        if not output_name:
            return jsonify({'error': 'El nombre del archivo es requerido'}), 400

        # Check kindlegen exists
        if not KINDLEGEN_PATH.exists():
            return jsonify({'error': f'kindlegen.exe no encontrado en {KINDLEGEN_PATH}'}), 500

        # Handle cover image
        cover_image_path = None
        if 'cover_image' in request.files:
            cover_file = request.files['cover_image']
            if cover_file.filename:
                cover_image_name = cover_file.filename
                # Save temporarily
                temp_cover = tempfile.NamedTemporaryFile(delete=False, suffix=Path(cover_image_name).suffix)
                cover_file.save(temp_cover.name)
                cover_image_path = temp_cover.name

        # Create temp directory for output
        with tempfile.TemporaryDirectory() as temp_dir:
            # Prepare config
            config = {
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
            opf_filename = generator.generate_dictionary(temp_dir, config)
            opf_path = Path(temp_dir) / opf_filename

            # Run kindlegen to create .mobi
            result = subprocess.run(
                [str(KINDLEGEN_PATH), str(opf_path)],
                capture_output=True,
                text=True,
                cwd=temp_dir
            )

            # Check for .mobi file (kindlegen returns 1 for warnings, 2 for errors)
            mobi_filename = f'{output_name}.mobi'
            mobi_path = Path(temp_dir) / mobi_filename

            if not mobi_path.exists():
                error_msg = result.stderr or result.stdout or 'Error desconocido al generar .mobi'
                return jsonify({'error': f'Error de kindlegen: {error_msg}'}), 500

            # Clean up temp cover image
            if cover_image_path and os.path.exists(cover_image_path):
                os.unlink(cover_image_path)

            # Copy mobi to a temp location that persists after context manager
            final_mobi_path = os.path.join(tempfile.gettempdir(), mobi_filename)
            with open(mobi_path, 'rb') as src, open(final_mobi_path, 'wb') as dst:
                dst.write(src.read())

            # Send .mobi file
            return send_file(
                final_mobi_path,
                mimetype='application/x-mobipocket-ebook',
                as_attachment=True,
                download_name=mobi_filename
            )

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)
