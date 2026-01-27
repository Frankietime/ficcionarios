# Kindle Dictionary Generator

A web application for creating custom Kindle dictionaries. Build personalized dictionaries for fiction books, technical terms, or any custom vocabulary.

## Features

- **Web-based interface** with live Kindle preview
- **Definition groups**: Multiple words can share the same definition
- **Automatic .mobi generation** using KindleGen
- **Custom CSS styles** support
- **Cover image** support (JPG/PNG)
- **UTF-8 encoding** for international characters

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Python Flask |
| Converter | Amazon KindleGen |
| Styling | CSS |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- KindleGen executable (see below)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ficcionarios
   ```

2. **Install Python dependencies**
   ```bash
   pip install flask
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

#### Development Mode (two terminals)

**Terminal 1 - Backend:**
```bash
python -m server.app.py
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
cd ../server && python app.py
```
Access at `http://localhost:5000`

## Tutorial

### Creating a Dictionary

1. **Fill in basic information:**
   - **Title**: Name shown on Kindle (e.g., "Dune Dictionary")
   - **Creator**: Your name
   - **Languages**: Use locale codes like `es-es`, `en-us`, `pt-br`
   - **Output name**: Filename without extension

2. **Add definition groups:**
   - Enter words separated by commas (e.g., `moon, lunar, lunatic`)
   - Write the definition text (can be as long as a short story)
   - Each word in the group becomes a separate dictionary entry sharing the same definition
   - Click "+ Add Group" for more entries

3. **Optional content:**
   - Cover image (JPG/PNG)
   - Copyright text
   - Usage instructions
   - Custom CSS styles

4. **Generate**: Click "Generate Dictionary" to download the `.mobi` file

### Installing on Kindle

1. Connect your Kindle via USB
2. Copy the `.mobi` file to the `dictionaries/` folder
3. Safely eject and restart your Kindle
4. Go to **Settings > Language & Dictionaries > Dictionaries**
5. Select your custom dictionary as the default

### Supported Kindle Devices

The generated `.mobi` files are compatible with all Kindle devices from 2012 onwards, including:
- Kindle Paperwhite (all generations)
- Kindle Scribe
- Kindle Colorsoft
- Basic Kindle (2022+)

## Signal Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    React Frontend                        │   │
│  │  ┌──────────────┐    ┌────────────────────────────┐     │   │
│  │  │  Form State  │───▶│  Live Kindle Preview       │     │   │
│  │  │  (useState)  │    │  (useMemo computed entries)│     │   │
│  │  └──────────────┘    └────────────────────────────┘     │   │
│  │         │                                                │   │
│  │         ▼ Submit                                         │   │
│  │  ┌──────────────┐                                        │   │
│  │  │  FormData    │                                        │   │
│  │  │  POST /gen   │                                        │   │
│  │  └──────────────┘                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FLASK SERVER                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    /generate endpoint                    │   │
│  │                                                          │   │
│  │  1. Parse form data                                      │   │
│  │  2. Generate HTML files:                                 │   │
│  │     • content.html (dictionary entries)                  │   │
│  │     • cover.html, copyright.html, usage.html             │   │
│  │     • [name].opf (metadata manifest)                     │   │
│  │  3. Run KindleGen:                                       │   │
│  │     kindlegen [name].opf → [name].mobi                   │   │
│  │  4. Return .mobi file                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
                        ┌───────────────┐
                        │  .mobi file   │
                        │  (download)   │
                        └───────────────┘
```

## Project Structure

```
ficcionarios/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── KindlePreview.tsx
│   │   │   └── DefinitionGroup.tsx
│   │   ├── App.tsx
│   │   ├── types.ts
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Flask backend
│   ├── app.py             # API endpoints
│   ├── generator.py       # Dictionary file generation
│   └── bin/
│       └── kindlegen.exe  # Amazon KindleGen
└── README.md
```

## License

This project is open source and available for free use.
