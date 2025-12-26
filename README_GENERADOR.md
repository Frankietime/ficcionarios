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

**IMPORTANTE**: Este proceso debe ejecutarse en una computadora con macOS. No puedes generar un `.app` desde Windows.

1. En tu Mac, abre Terminal y navega al directorio del proyecto

2. Instalar PyInstaller:
   ```bash
   pip3 install pyinstaller
   ```

3. Generar la aplicación usando el script:
   ```bash
   chmod +x build_mac.sh
   ./build_mac.sh
   ```
   
   O manualmente:
   ```bash
   pyinstaller --onefile --windowed --name "GeneradorDiccionariosKindle" --icon=NONE main.py
   ```

   El archivo `.app` estará en la carpeta `dist/`

4. (Opcional) Firmar la aplicación para evitar advertencias de seguridad:
   ```bash
   codesign --force --deep --sign - dist/GeneradorDiccionariosKindle.app
   ```

   Nota: Si no firmas la aplicación, macOS puede mostrar una advertencia al ejecutarla. Puedes permitir la ejecución desde Preferencias del Sistema > Seguridad y Privacidad.

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
9. **Grupos de Definiciones**: 
   - Haz clic en el botón **"+ Agregar Grupo"** para crear un nuevo grupo
   - En cada grupo:
     - **Palabras**: Ingresa una o varias palabras separadas por coma (ej: "luna, lunar, lunático")
     - **Definición**: Ingresa el texto completo de la definición (puede ser tan largo como un cuento)
     - **Cargar desde archivo**: Puedes cargar el texto de la definición desde un archivo .txt
   - Cada palabra del grupo se convertirá en una entrada separada en el diccionario, pero todas compartirán la misma definición
   - Puedes agregar tantos grupos como necesites
   - Usa el botón "Eliminar grupo" para remover un grupo
10. **Estilos CSS personalizados** (opcional): Agrega estilos CSS adicionales
11. **Generar Diccionario**: Haz clic para generar todos los archivos

## Formato de Grupos de Definiciones

Cada grupo de definiciones permite:

- **Múltiples palabras por definición**: Puedes ingresar varias palabras separadas por coma que compartirán la misma definición
  - Ejemplo: `luna, lunar, lunático, lunático`
  - Cada palabra se convertirá en una entrada separada en el diccionario

- **Definiciones largas**: El texto de la definición puede ser tan extenso como un cuento completo
  - Puedes escribir directamente en el campo de texto
  - O cargar desde un archivo .txt usando el botón "Cargar desde archivo..."

- **Múltiples grupos**: Puedes agregar tantos grupos como necesites
  - Cada grupo es independiente
  - Útil para organizar definiciones por tema o categoría

Ejemplo de uso:
- **Grupo 1**:
  - Palabras: `luna, lunar, lunático`
  - Definición: `[Texto completo del cuento "La luna por veinte dolares"]`
- **Grupo 2**:
  - Palabras: `espacio, espacial`
  - Definición: `[Otro texto largo de definición]`

## Próximos Pasos Después de Generar

1. Abre el archivo `.opf` generado con **Kindle Previewer**
2. Ve a `File > Export` y exporta como archivo `.mobi`
3. Transfiere el archivo `.mobi` a tu Kindle (por USB o email)
4. En tu Kindle, selecciona el diccionario personalizado como predeterminado

## Notas

- Si no ingresas grupos de definiciones válidos, se generarán archivos HTML vacíos como fallback
- Cada palabra en un grupo se convierte en una entrada separada en el diccionario
- Las definiciones pueden ser textos muy largos (como cuentos completos)
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

