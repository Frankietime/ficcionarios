# Instrucciones para Generar un Diccionario Personalizado de Kindle

## Objetivo
Generar un diccionario personalizado para Kindle a partir de una lista de palabras y definiciones en formato de texto plano.

## Parámetros Requeridos

Antes de comenzar, solicita al usuario los siguientes parámetros:

1. **Título del diccionario**: Nombre que aparecerá en el diccionario (ej: "Diccionario de Dune", "Diccionario de Diaspora")
2. **Nombre del creador**: Nombre del autor/creador del diccionario
3. **Idioma del diccionario**: Código de idioma (ej: "es-es", "en-us", "pt-br")
4. **Archivo de entrada**: Ruta al archivo `.txt` con las palabras y definiciones
5. **Nombre del archivo de salida**: Nombre para el archivo `.mobi` final (sin extensión)

## Formato del Archivo de Entrada

El archivo de entrada debe ser un archivo de texto plano (`.txt`) con el siguiente formato:

```
palabra1 definición completa de la palabra 1
palabra2 definición completa de la palabra 2
palabra3 definición completa de la palabra 3
```

**Reglas importantes:**
- Una palabra y su definición por línea
- La palabra y la definición están separadas por un **único espacio**
- La definición puede contener múltiples palabras después del primer espacio
- Cada línea representa una entrada completa del diccionario
- No usar caracteres especiales que puedan romper el HTML (escapar si es necesario)

**Ejemplo:**
```
Bene Gesserit Orden secreta de mujeres con habilidades especiales
Kwisatz Haderach El profetizado que puede estar en muchos lugares a la vez
Melange Especia que extiende la vida y permite la navegación espacial
```

## Estructura de Archivos a Generar

Debes generar los siguientes archivos en una carpeta de trabajo:

### 1. `content.html` - Contenido principal del diccionario

Este archivo contiene todas las entradas del diccionario. Usa la siguiente plantilla base:

```html
<html xmlns:math="http://exslt.org/math" xmlns:svg="http://www.w3.org/2000/svg"
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
      h5 {
          font-size: 1em;
          margin: 0;
      }
      dt {
          font-weight: bold;
      }
      dd {
          margin: 0;
          padding: 0 0 0.5em 0;
          display: block
      }
    </style>
  </head>
  <body>
    <mbp:frameset>
        <!-- AQUÍ VAN TODAS LAS ENTRADAS -->
    </mbp:frameset>
  </body>
</html>
```

**Para cada palabra del archivo de entrada, genera una entrada con este formato:**

```html
<idx:entry name="default" scriptable="yes" spell="yes">
    <h5><dt><idx:orth>PALABRA</idx:orth></dt></h5>
    <dd>DEFINICIÓN</dd>
</idx:entry>
<hr/>
```

**Importante:**
- Cada entrada debe terminar con `<hr/>`
- El atributo `name="default"` debe coincidir con el valor en `dict.opf`
- `scriptable="yes"` y `spell="yes"` son obligatorios
- La palabra va dentro de `<idx:orth>`
- La definición va dentro de `<dd>`

### 2. `cover.html` - Página de portada

```html
<html>
  <head>
    <meta content="text/html" http-equiv="content-type">
  </head>
  <body>
    <h1>[TÍTULO_DEL_DICCIONARIO]</h1>
    <h3>Creado por [NOMBRE_DEL_CREADOR]</h3>
  </body>
</html>
```

Reemplaza:
- `[TÍTULO_DEL_DICCIONARIO]` con el título proporcionado
- `[NOMBRE_DEL_CREADOR]` con el nombre del creador

### 3. `copyright.html` - Página de copyright

```html
<html>
  <head>
    <meta content="text/html" http-equiv="content-type">
  </head>
  <body>
    <h1>Copyright</h1>
    <h3>Creado por [NOMBRE_DEL_CREADOR]</h3>
  </body>
</html>
```

Reemplaza `[NOMBRE_DEL_CREADOR]` con el nombre del creador.

### 4. `usage.html` - Página de uso (opcional pero recomendada)

```html
<html>
  <head>
    <meta content="text/html" http-equiv="content-type">
  </head>
  <body>
    <h1>[TÍTULO_DEL_DICCIONARIO]</h1>
    <h3>Creado por [NOMBRE_DEL_CREADOR]</h3>
    <p>Este diccionario contiene términos específicos para su uso con libros relacionados.</p>
    <p>Para usarlo, selecciónalo como diccionario predeterminado en la configuración de tu Kindle.</p>
  </body>
</html>
```

Reemplaza los valores correspondientes.

### 5. `dict.opf` - Archivo de metadatos (MUY IMPORTANTE)

Este archivo XML vincula todos los archivos. Usa esta plantilla:

```xml
<?xml version="1.0"?>
<package version="2.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId">
  <metadata>
    <dc:title>[TÍTULO_DEL_DICCIONARIO]</dc:title>
    <dc:creator opf:role="aut">[NOMBRE_DEL_CREADOR]</dc:creator>
    <dc:language>[CÓDIGO_IDIOMA]</dc:language>
    <meta name="cover" content="my-cover-image" />
    <x-metadata>
      <DictionaryInLanguage>[CÓDIGO_IDIOMA]</DictionaryInLanguage>
      <DictionaryOutLanguage>[CÓDIGO_IDIOMA]</DictionaryOutLanguage>
      <DefaultLookupIndex>default</DefaultLookupIndex>
    </x-metadata>
  </metadata>
  <manifest>
    <!-- <item href="cover-image.jpg" id="my-cover-image" media-type="image/jpg" /> -->
    <item id="cover"
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
</package>
```

**Reemplazos necesarios:**
- `[TÍTULO_DEL_DICCIONARIO]`: Título completo
- `[NOMBRE_DEL_CREADOR]`: Nombre del creador
- `[CÓDIGO_IDIOMA]`: Código de idioma (ej: "es-es", "en-us")
- **IMPORTANTE**: El valor de `<DefaultLookupIndex>` debe ser `"default"` (debe coincidir con `name="default"` en las entradas de `content.html`)

## Proceso de Generación

### Paso 1: Solicitar parámetros
Pregunta al usuario por todos los parámetros listados al inicio.

### Paso 2: Leer y procesar el archivo de entrada
1. Lee el archivo `.txt` línea por línea
2. Para cada línea, separa la palabra (primera palabra) de la definición (resto de la línea después del primer espacio)
3. Escapa caracteres HTML especiales si es necesario (`<`, `>`, `&`, `"`, `'`)

### Paso 3: Generar `content.html`
1. Usa la plantilla base de `content.html`
2. Para cada palabra procesada, genera una entrada con el formato especificado
3. Concatena todas las entradas dentro de `<mbp:frameset>`

### Paso 4: Generar archivos HTML restantes
Genera `cover.html`, `copyright.html` y `usage.html` usando las plantillas y reemplazando los valores correspondientes.

### Paso 5: Generar `dict.opf`
Genera el archivo XML con todos los metadatos correctos, asegurándote de que:
- El título, creador e idioma coincidan con los parámetros
- `<DefaultLookupIndex>` sea `"default"`
- Todos los archivos estén referenciados en `<manifest>` y `<spine>`

### Paso 6: Validación
Verifica que:
- Todos los archivos HTML son válidos
- El XML de `dict.opf` está bien formado
- Todas las referencias en `dict.opf` apuntan a archivos existentes
- El formato de las entradas en `content.html` es correcto

## Conversión a MOBI

**Nota importante**: La conversión final a `.mobi` requiere usar **Kindle Previewer** (aplicación de escritorio de Amazon). No puedes hacer esto programáticamente, pero debes indicarle al usuario:

1. Descargar Kindle Previewer desde el sitio de Amazon
2. Abrir Kindle Previewer
3. Ir a `File > Open` y seleccionar `dict.opf`
4. Ir a `File > Export` y exportar como `.mobi`
5. Ignorar las advertencias sobre la portada faltante (solo si son warnings, no errores)

## Instalación en Kindle

Indica al usuario que:
1. Transfiera el archivo `.mobi` a su Kindle (por USB o email)
2. Abra el diccionario en el Kindle para verificar el formato
3. Abra el libro relacionado y busque una palabra
4. Si no usa el diccionario personalizado, haga clic en el nombre del diccionario en el popup para cambiar al diccionario personalizado como predeterminado

## Ejemplo de Flujo Completo

**Entrada del usuario:**
- Título: "Diccionario de Dune"
- Creador: "Juan Pérez"
- Idioma: "es-es"
- Archivo: `palabras_dune.txt`
- Nombre salida: "diccionario_dune"

**Archivo `palabras_dune.txt`:**
```
Bene Gesserit Orden secreta de mujeres con habilidades especiales
Kwisatz Haderach El profetizado que puede estar en muchos lugares a la vez
Melange Especia que extiende la vida y permite la navegación espacial
```

**Salida esperada:**
- `content.html` con 3 entradas formateadas correctamente
- `cover.html` con título "Diccionario de Dune" y creador "Juan Pérez"
- `copyright.html` con creador "Juan Pérez"
- `usage.html` con título y creador
- `dict.opf` con todos los metadatos en español (es-es)

## Consideraciones Técnicas

1. **Codificación**: Todos los archivos deben estar en UTF-8
2. **Escape de HTML**: Escapa caracteres especiales en las definiciones (`<` → `&lt;`, `>` → `&gt;`, `&` → `&amp;`)
3. **Espacios**: Respeta los espacios en las definiciones, pero asegúrate de que solo haya un espacio entre la palabra y el inicio de la definición
4. **Líneas vacías**: Ignora líneas vacías en el archivo de entrada
5. **Mayúsculas/minúsculas**: Preserva el formato original de las palabras (pueden tener mayúsculas especiales)

## Checklist Final

Antes de entregar los archivos, verifica:
- [ ] Todos los parámetros fueron solicitados y utilizados
- [ ] `content.html` tiene todas las entradas correctamente formateadas
- [ ] `cover.html`, `copyright.html` y `usage.html` tienen los valores correctos
- [ ] `dict.opf` tiene todos los metadatos correctos
- [ ] El valor de `DefaultLookupIndex` es "default"
- [ ] Todos los archivos están en UTF-8
- [ ] Las definiciones tienen caracteres HTML escapados si es necesario
- [ ] Se proporcionaron instrucciones para la conversión a MOBI

