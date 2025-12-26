# Generador de Diccionarios Kindle

Aplicación de escritorio para crear diccionarios personalizados de Kindle de manera guiada.

## Características

- Interfaz gráfica paso a paso
- Captura de todos los datos necesarios:
  - Título del diccionario
  - Creador/Autor
  - Idioma de entrada y salida
  - Versión
  - Nombre del archivo .opf
  - Imagen de portada (opcional)
  - Texto de copyright (opcional)
  - Texto de uso/instrucciones (opcional)
  - Definiciones (formato: palabra definición, una por línea)
  - Estilos CSS personalizados (opcional)
- Genera todos los archivos necesarios:
  - `content.html` - Contenido principal con todas las entradas
  - `cover.html` - Página de portada
  - `copyright.html` - Página de copyright (con fallback si está vacío)
  - `usage.html` - Página de instrucciones (con fallback si está vacío)
  - `[nombre].opf` - Archivo de metadatos
  - Copia la imagen de portada si se proporciona

## Instalación y Uso

### Opción 1: Ejecutar desde Python (desarrollo)

1. Instalar Python 3.8 o superior
2. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```
3. Ejecutar la aplicación:
   ```bash
   python main.py
   ```

### Opción 2: Generar ejecutables

#### Para Windows (.exe)

1. Instalar PyInstaller:
   ```bash
   pip install pyinstaller
   ```

2. Generar el ejecutable:
   ```bash
   pyinstaller --onefile --windowed --name "GeneradorDiccionariosKindle" --icon=NONE main.py
   ```

   El archivo `.exe` estará en la carpeta `dist/`

#### Para macOS (.app)

1. Instalar PyInstaller:
   ```bash
   pip install pyinstaller
   ```

2. Generar la aplicación:
   ```bash
   pyinstaller --onefile --windowed --name "GeneradorDiccionariosKindle" --icon=NONE main.py
   ```

   El archivo `.app` estará en la carpeta `dist/`

#### Para Linux

1. Instalar PyInstaller:
   ```bash
   pip install pyinstaller
   ```

2. Generar el ejecutable:
   ```bash
   pyinstaller --onefile --name "GeneradorDiccionariosKindle" main.py
   ```

## Uso de la Aplicación

1. **Título del diccionario**: Ingresa el nombre que aparecerá en el diccionario
2. **Creador/Autor**: Tu nombre o el nombre del creador
3. **Idioma de entrada y salida**: Códigos de idioma (ej: es-es, en-us, pt-br)
4. **Versión**: Número de versión del diccionario (ej: 1.0, 2.1)
5. **Nombre del archivo .opf**: Nombre sin extensión para el archivo final
6. **Imagen de portada** (opcional): Selecciona una imagen JPG o PNG
7. **Texto de Copyright** (opcional): Información de copyright
8. **Texto de Uso** (opcional): Instrucciones para usar el diccionario
9. **Definiciones**: Ingresa las palabras y definiciones en formato:
   ```
   palabra1 definición completa de la palabra 1
   palabra2 definición completa de la palabra 2
   ```
   - Una palabra y definición por línea
   - Separadas por un espacio
   - Puedes cargar desde un archivo .txt usando el botón "Cargar desde archivo .txt"
10. **Estilos CSS personalizados** (opcional): Agrega estilos CSS adicionales
11. **Generar Diccionario**: Haz clic para generar todos los archivos

## Formato de Definiciones

El formato esperado es:
```
palabra definición completa
otra_palabra otra definición
```

Cada línea debe tener:
- La palabra (primera palabra de la línea)
- Un espacio
- La definición (resto de la línea)

Ejemplo:
```
espacio La luna por veinte dolares, por Hernan Casciari
luna La luna por veinte dolares, por Hernan Casciari
historia La luna por veinte dolares, por Hernan Casciari
```

## Próximos Pasos Después de Generar

1. Abre el archivo `.opf` generado con **Kindle Previewer**
2. Ve a `File > Export` y exporta como archivo `.mobi`
3. Transfiere el archivo `.mobi` a tu Kindle (por USB o email)
4. En tu Kindle, selecciona el diccionario personalizado como predeterminado

## Notas

- Si no ingresas definiciones, se generarán archivos HTML vacíos como fallback
- La imagen de portada debe ser JPG o PNG
- Todos los archivos se generan en UTF-8
- Los caracteres HTML especiales se escapan automáticamente

## Solución de Problemas

### Error al generar ejecutable
- Asegúrate de tener Python 3.8 o superior
- Verifica que PyInstaller esté instalado correctamente
- En macOS, puede ser necesario firmar la aplicación

### Error al generar diccionario
- Verifica que todos los campos requeridos estén completos
- Asegúrate de que el formato de definiciones sea correcto
- Revisa que la ruta de la imagen de portada sea válida

## Licencia

Este proyecto es de código abierto y está disponible para uso libre.

