"""
Módulo para generar archivos de diccionario Kindle
"""
import os
import html
from pathlib import Path


def escape_html(text):
    """Escapa caracteres HTML especiales"""
    return html.escape(text)


def generate_content_html(entries, styles=""):
    """Genera el archivo content.html con todas las entradas"""
    entries_html = ""

    for word, definition in entries:
        word_escaped = escape_html(word)
        definition_escaped = escape_html(definition)

        # Formatear la definición con párrafos si contiene saltos de línea
        if '\n' in definition_escaped:
            paragraphs = definition_escaped.split('\n')
            formatted_def = ''.join([f'<p>{p.strip()}</p>' if p.strip() else '' for p in paragraphs])
        else:
            formatted_def = f'<p>{definition_escaped}</p>'

        entries_html += f'''        <idx:entry name="default" scriptable="yes" spell="yes">
            <h5><dt><idx:orth>{word_escaped}</idx:orth></dt></h5>
            <dd>{formatted_def}</dd>
        </idx:entry>
        <hr/>
'''

    content = f'''<html xmlns:math="http://exslt.org/math" xmlns:svg="http://www.w3.org/2000/svg"
      xmlns:tl="https://kindlegen.s3.amazonaws.com/AmazonKindlePublishingGuidelines.pdf"
      xmlns:saxon="http://saxon.sf.net/" xmlns:xs="http://www.w3.org/2001/XMLSchema"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:cx="https://kindlegen.s3.amazonaws.com/AmazonKindlePublishingGuidelines.pdf"
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:mbp="https://kindlegen.s3.amazonaws.com/AmazonKindlePublishingGuidelines.pdf"
      xmlns:mmc="https://kindlegen.s3.amazonaws.com/AmazonKindlePublishingGuidelines.pdf"
      xmlns:idx="https://kindlegen.s3.amazonaws.com/AmazonKindlePublishingGuidelines.pdf">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <style>
      body {{
          margin: 0;
          padding: 0;
          font-family: serif;
      }}
      h5 {{
          font-size: 1em;
          margin: 0;
          padding: 0;
          line-height: 1.2;
      }}
      dt {{
          font-weight: bold;
          margin: 0;
          padding: 0;
      }}
      dd {{
          margin: 0;
          padding: 0.3em 0 0.8em 0;
          display: block;
          line-height: 1.4;
      }}
      p {{
          margin: 0;
          padding: 0.15em 0;
          text-align: justify;
          line-height: 1.5;
          text-indent: 0;
      }}
      p:first-child {{
          margin-top: 0;
          padding-top: 0;
      }}
      p:last-child {{
          margin-bottom: 0;
          padding-bottom: 0;
      }}
      hr {{
          margin: 0.5em 0;
          padding: 0;
          border: none;
          border-top: 1px solid #ccc;
      }}
      idx:entry {{
          margin: 0;
          padding: 0;
      }}
{styles}
    </style>
  </head>
  <body>
    <mbp:frameset>
{entries_html}    </mbp:frameset>
  </body>
</html>'''

    return content


def generate_cover_html(title, creator):
    """Genera el archivo cover.html"""
    title_escaped = escape_html(title)
    creator_escaped = escape_html(creator)

    return f'''<html>
  <head>
    <meta content="text/html" http-equiv="content-type">
  </head>
  <body>
    <h1>{title_escaped}</h1>
    <h3>Creado por {creator_escaped}</h3>
  </body>
</html>'''


def generate_copyright_html(copyright_text, creator):
    """Genera el archivo copyright.html"""
    if not copyright_text.strip():
        return '''<html>
  <head>
    <meta content="text/html" http-equiv="content-type">
  </head>
  <body>
    <!-- Copyright information -->
  </body>
</html>'''

    copyright_escaped = escape_html(copyright_text)
    creator_escaped = escape_html(creator)

    return f'''<html>
  <head>
    <meta content="text/html" http-equiv="content-type">
  </head>
  <body>
    <h1>Copyright</h1>
    <p>{copyright_escaped}</p>
    <h3>Creado por {creator_escaped}</h3>
  </body>
</html>'''


def generate_usage_html(title, creator, usage_text):
    """Genera el archivo usage.html"""
    title_escaped = escape_html(title)
    creator_escaped = escape_html(creator)

    if not usage_text.strip():
        usage_text = f'Este diccionario contiene términos específicos para su uso con libros relacionados.<br/>Para usarlo, selecciónalo como diccionario predeterminado en la configuración de tu Kindle.'
    else:
        usage_text = escape_html(usage_text).replace('\n', '<br/>')

    return f'''<html>
  <head>
    <meta content="text/html" http-equiv="content-type">
  </head>
  <body>
    <h1>{title_escaped}</h1>
    <h3>Creado por {creator_escaped}</h3>
    <p>{usage_text}</p>
  </body>
</html>'''


def generate_opf(title, creator, in_language, out_language, version, has_cover_image=False, cover_image_name=""):
    """Genera el archivo .opf"""
    title_escaped = escape_html(title)
    creator_escaped = escape_html(creator)

    cover_image_item = ""
    if has_cover_image and cover_image_name:
        cover_image_ext = Path(cover_image_name).suffix.lower()
        media_type = "image/jpeg" if cover_image_ext in ['.jpg', '.jpeg'] else "image/png"
        cover_image_item = f'    <item href="{cover_image_name}" id="my-cover-image" media-type="{media_type}" />\n'

    return f'''<?xml version="1.0"?>
<package version="2.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId">
  <metadata>
    <dc:title>{title_escaped}</dc:title>
    <dc:creator opf:role="aut">{creator_escaped}</dc:creator>
    <dc:language>{in_language}</dc:language>
    <meta name="cover" content="my-cover-image" />
    <x-metadata>
      <DictionaryInLanguage>{in_language}</DictionaryInLanguage>
      <DictionaryOutLanguage>{out_language}</DictionaryOutLanguage>
      <DefaultLookupIndex>default</DefaultLookupIndex>
    </x-metadata>
  </metadata>
  <manifest>
{cover_image_item}    <item id="cover"
          href="cover.html"
          media-type="application/xhtml+xml" />
    <item id="usage"
          href="usage.html"
          media-type="application/xhtml+xml" />
    <item id="copyright"
          href="copyright.html"
          media-type="application/xhtml+xml" />
    <item id="content"
          href="content.html"
          media-type="application/xhtml+xml" />
  </manifest>
  <spine>
    <itemref idref="cover" />
    <itemref idref="usage" />
    <itemref idref="copyright"/>
    <itemref idref="content"/>
  </spine>
  <guide>
    <reference type="index" title="IndexName" href="content.html"/>
  </guide>
</package>'''


def generate_dictionary(output_dir, config):
    """Genera todos los archivos del diccionario"""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Generar content.html
    # Si viene 'entries' directamente, usarlo; si no, procesar 'definitions' (compatibilidad)
    if 'entries' in config:
        entries = config['entries']
    else:
        entries = []
        if config.get('definitions'):
            for line in config['definitions'].strip().split('\n'):
                line = line.strip()
                if line:
                    parts = line.split(' ', 1)
                    if len(parts) == 2:
                        word, definition = parts
                        entries.append((word, definition))
                    elif len(parts) == 1:
                        # Si solo hay una palabra sin definición, usar texto vacío
                        entries.append((parts[0], ''))

    styles = config.get('custom_styles', '')
    content_html = generate_content_html(entries, styles)
    (output_path / 'content.html').write_text(content_html, encoding='utf-8')

    # Generar cover.html
    cover_html = generate_cover_html(config['title'], config['creator'])
    (output_path / 'cover.html').write_text(cover_html, encoding='utf-8')

    # Generar copyright.html
    copyright_html = generate_copyright_html(
        config.get('copyright', ''),
        config['creator']
    )
    (output_path / 'copyright.html').write_text(copyright_html, encoding='utf-8')

    # Generar usage.html
    usage_html = generate_usage_html(
        config['title'],
        config['creator'],
        config.get('usage', '')
    )
    (output_path / 'usage.html').write_text(usage_html, encoding='utf-8')

    # Copiar imagen de cover si existe
    cover_image_path = config.get('cover_image_path')
    if cover_image_path and os.path.exists(cover_image_path):
        cover_image_name = Path(cover_image_path).name
        import shutil
        shutil.copy2(cover_image_path, output_path / cover_image_name)
        config['cover_image_name'] = cover_image_name
        config['has_cover_image'] = True
    else:
        config['cover_image_name'] = ""
        config['has_cover_image'] = False

    # Generar .opf
    opf_content = generate_opf(
        config['title'],
        config['creator'],
        config['in_language'],
        config['out_language'],
        config.get('version', '1.0'),
        config.get('has_cover_image', False),
        config.get('cover_image_name', '')
    )

    opf_filename = f"{config['output_name']}.opf"
    (output_path / opf_filename).write_text(opf_content, encoding='utf-8')

    return opf_filename
