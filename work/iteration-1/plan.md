# UI Components

https://www.neobrutalism.dev/

# Support

- Desktop First
- Mobile Responsive

# Features

## Login

https://www.neobrutalism.dev/docs/card

Simple: user + pass

## Dashboard Principal

Se listan en una tabla los “Ficcionarios” creados

- Empty State
    - Card grande: “No tenés Ficcionarios todavía”
    - CTA: “Crear Ficcionario”
- Info x Row
    - Nombre del Ficcionario
    - **# Cuentos usados** (+ tooltip con nombres)
    - `createdBy`, `updatedBy`, `updatedAt`
    - “last write wins” + historial (más simple)
- Actions x Row: editar, borrar, generar diccionario
- Boton de Crear Nuevo Ficcionario

## Ficcionarios

Un ficcionario es un proyecto **colaborativo** en el que se especifican grupos de **términos** que apuntan a **definiciones** 

### Vistas

- Title + Version / Subtitle + Action Bar (Sticky)
    - Action Bar
        - Save
            - “Saved ✓” / “Saving…” / “Unsaved changes”
            - Toast de error si falla
        - Generate Dictionary
            - Disabled a menos que Info required y al menos 1 fichero completo
        - Delete (Red)
- Info General (* son required)
    - Título del Ficcionario* (Title)
    - Version / Subtitle
    - Autor/es del diccionario*
    - Input / Output Language*
    - Version number
    - Output file name*
    - Cover image
    - Copyright
- Ficheros (Accordion List)
    - Header: Boton de Colapse/Open All
    - Fichero: se divide en header y abajo del mismo dos columnas (terminos y biblioteca)
        - Header: cuando esta colapsado muestra los terminos (elipsis + tooltip)
        - Términos
            - Campo “Agregar término” + Click → crea chip/tag (gordito)
            - Lista de chips con X para borrar
        - Biblioteca
            - Header: Boton de Upload
            - Subheader: Search de cuentos
            - Single-select todos los cuentos cargados hasta ahora
                - Permite seleccionar 1 cuento, Mostrar el seleccionado como “pill” + botón “change”
- Preview del Ficcionario (TBD)

### Validaciones

- Que no se dupliquen los cuentos en base de datos
    - Identificar cuentos por `hash(content)` y si el usuario sube el mismo texto:
    - Mostrar: “Este cuento ya existe. ¿Usar el existente?” (no bloquear duro).
- Fichero
    - ≥ 1 termino
    - 1 cuento seleccionado
    - No duplicar mismo conjunto de terminos en 2 ficheros distintos

# User Stories

- Crear nuevo proyecto → Carga datos geneerales → + Nuevo fichero → Ingresar terminos y seleccionar (radiobutton) un cuento de la biblioteca a su costado o upload de cuento nuevo → Generar Diccionario