# Ficcionarios

A collaborative web application for creating custom Kindle dictionaries from short stories. Users create **Ficcionarios** (dictionary projects) where terms are linked to stories from a shared library, generating `.mobi` files for Kindle.

## Core Concepts

- **Ficcionario**: A collaborative dictionary project containing metadata and multiple Ficheros
- **Fichero**: A dictionary entry group - one or more terms that share the same story as their definition
- **Biblioteca (Library)**: A shared collection of uploaded stories (cuentos) that can be reused across Ficheros
- **Terms**: Words that, when looked up on Kindle, display the associated story

## Features

- **User authentication** with simple login
- **Dashboard** listing all Ficcionarios with metadata and actions
- **Collaborative editing** with `createdBy`, `updatedBy` tracking and history
- **Story library** with deduplication (hash-based)
- **Live Kindle preview** (TBD)
- **Automatic .mobi generation** using KindleGen

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript + Vite 7 |
| Styling | Tailwind CSS 4 |
| State Management | Zustand |
| Routing | React Router 7 |
| UI Components | Radix UI + CVA + Lucide Icons |
| Backend | Python Flask 3 |
| Database | SQLite (via Flask-SQLAlchemy + Flask-Migrate) |
| Auth | Flask-Login |
| Converter | Amazon KindleGen |

## User Flow

1. **Login** with username and password
2. **Dashboard** - View all Ficcionarios or create a new one
3. **Create/Edit Ficcionario**:
   - Fill general info (title, authors, languages, etc.)
   - Add Ficheros (term groups)
   - For each Fichero: add terms + select a story from library
4. **Generate Dictionary** - Download `.mobi` file

## Application Views

### Login
Simple card-based login form (user + password).

### Dashboard
| Element | Description |
|---------|-------------|
| Empty State | Card with "No tenés Ficcionarios todavía" + CTA button |
| Table Columns | Name, # Stories used (tooltip), createdBy, updatedBy, updatedAt |
| Row Actions | Edit, Delete, Generate Dictionary |
| Header Action | "Crear Ficcionario" button |

### Ficcionario Editor

**Header (Sticky)**
- Title + Version/Subtitle
- Action Bar:
  - Save status ("Saved", "Saving...", "Unsaved changes")
  - Generate Dictionary (disabled until valid)
  - Delete (red)

**General Info** (* = required)
- Título del Ficcionario*
- Version / Subtitle
- Autor/es del diccionario*
- Input / Output Language*
- Version number
- Output file name*
- Cover image
- Copyright

**Ficheros (Accordion List)**
- Header: Collapse/Open All button
- Each Fichero:
  - Collapsed header shows terms (ellipsis + tooltip)
  - Two columns when expanded:
    - **Terms**: Input field + chip/tag list with delete
    - **Library**: Upload button, search, single-select story list

## Validations

### Story Library
- Deduplicate by `hash(content)`
- If duplicate detected: "Este cuento ya existe. ¿Usar el existente?"

### Fichero
- Minimum 1 term required
- Exactly 1 story selected
- No duplicate term sets across Ficheros

### Generate Dictionary
- All required General Info fields filled
- At least 1 complete Fichero

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- KindleGen executable

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ficcionarios
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install KindleGen**

   KindleGen is bundled with [Kindle Previewer 3](https://www.amazon.com/kindleformat/kindlepreviewer). After installing:
   - Find `kindlegen.exe` at: `C:\Users\<user>\AppData\Local\Amazon\Kindle Previewer 3\lib\fc\bin\`
   - Copy it to `server/bin/kindlegen.exe`

4. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

### Running the Application

#### Development Mode

**Terminal 1 - Backend:**
```bash
python -m server.app
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Access at `http://localhost:5173`

#### Production Mode

```bash
cd client && npm run build
cd .. && python -m server.app
```
Access at `http://localhost:5000`

### User Creation
```bash
python -m server.cli create-user <username> <password>
python -m server.cli list-users
python -m server.cli delete-user <username>
```

## Installing on Kindle

1. Connect your Kindle via USB
2. Copy the `.mobi` file to the `dictionaries/` folder
3. Safely eject and restart your Kindle
4. Go to **Settings > Language & Dictionaries > Dictionaries**
5. Select your custom dictionary as the default

## Project Structure

```
ficcionarios/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Flask backend
│   ├── app.py             # API endpoints
│   ├── generator.py       # Dictionary file generation
│   └── bin/
│       └── kindlegen.exe  # Amazon KindleGen
├── work/
│   └── plan.md            # Feature specifications (source of truth)
└── README.md
```

## License

This project is open source and available for free use.
