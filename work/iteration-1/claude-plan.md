# Ficcionarios - Implementation Plan

## Overview
Transform the existing single-page dictionary generator into a full-featured web app with authentication, dashboard, and collaborative ficcionario editing.

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **UI Library** | **neobrutalism.dev** | Copy-paste components via CLI, shadcn/ui based |
| Database | SQLite + SQLAlchemy | Simple, no server needed, easy PostgreSQL migration |
| State | Zustand | Minimal boilerplate, TypeScript-first |
| Routing | React Router v7 | Mature, simple API |
| Auth | Flask-Login (sessions) | HTTP-only cookies, no JWT complexity |

---

## Neobrutalism Setup (Phase 1 Prerequisite)

Neobrutalism.dev is a CLI-based component library (like shadcn/ui). Install via:

```bash
cd client
npx shadcn@latest init  # If not already initialized
# Then add neobrutalism components:
npx neobrutalism-ui add button
npx neobrutalism-ui add card
npx neobrutalism-ui add input
npx neobrutalism-ui add accordion
npx neobrutalism-ui add dialog
npx neobrutalism-ui add radio-group
npx neobrutalism-ui add toast
npx neobrutalism-ui add tooltip
npx neobrutalism-ui add checkbox
```

**Replace existing `/components/ui/` files with neobrutalism versions.**

Reference: https://www.neobrutalism.dev/docs/installation

---

## Database Schema

```
User
  - id, username, password_hash, created_at

Ficcionario
  - id, title, version, authors, in_language, out_language
  - output_name, cover_image_path, copyright
  - created_by_id (FK), updated_by_id (FK), created_at, updated_at

Fichero
  - id, ficcionario_id (FK), story_id (FK), position

Term
  - id, fichero_id (FK), word

Story
  - id, title, content, content_hash (unique), created_by_id (FK)
```

---

## API Endpoints

### Auth
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Ficcionarios
- `GET /api/ficcionarios` - List all
- `POST /api/ficcionarios` - Create new
- `GET /api/ficcionarios/:id` - Get with ficheros
- `PUT /api/ficcionarios/:id` - Update
- `DELETE /api/ficcionarios/:id` - Delete
- `POST /api/ficcionarios/:id/generate` - Generate .mobi

### Ficheros
- `POST /api/ficcionarios/:id/ficheros` - Add fichero
- `PUT /api/ficheros/:id` - Update fichero
- `DELETE /api/ficheros/:id` - Delete fichero

### Stories
- `GET /api/stories` - List with search
- `POST /api/stories` - Upload (returns duplicate if exists)

---

## Frontend Routes

```
/login           -> LoginPage
/dashboard       -> DashboardPage
/ficcionario/new -> EditorPage (create)
/ficcionario/:id -> EditorPage (edit)
```

---

## New File Structure

```
client/src/
  router.tsx              # React Router config
  stores/
    authStore.ts          # User session
    editorStore.ts        # Ficcionario state + auto-save
    uiStore.ts            # Modals, toasts, accordion state
  pages/
    LoginPage.tsx
    DashboardPage.tsx
    EditorPage.tsx
  components/
    layout/
      ProtectedLayout.tsx # Auth guard
      Header.tsx          # Sticky header with save status
    dashboard/
      EmptyState.tsx
      DashboardTable.tsx
    editor/
      GeneralInfoForm.tsx
      FicherosSection.tsx # Accordion container
      FicheroItem.tsx     # Terms + story selector
      TermsEditor.tsx     # Chips with add/remove
      StoryLibrary.tsx    # Upload + search + radio select
    modals/
      DeleteConfirmModal.tsx
      GenerateProgressModal.tsx
      StoryUploadModal.tsx
    ui/
      (neobrutalism components via CLI)
  hooks/
    useAutoSave.ts
  services/
    api.ts                # Fetch wrapper with auth

server/
  config.py               # Configuration
  models.py               # SQLAlchemy models
  routes/
    auth.py
    ficcionarios.py
    stories.py
```

---

## Implementation Phases

> **STOP before and after each phase for review**

### Phase 1: Foundation & Neobrutalism Setup
**Frontend:**
- [ ] Install neobrutalism components via CLI (replace existing ui/)
- [ ] Install React Router v7 + Zustand
- [ ] Set up router.tsx with routes
- [ ] Create ProtectedLayout component
- [ ] Create authStore.ts

**Backend:**
- [ ] Add dependencies: flask-sqlalchemy, flask-migrate, flask-login, flask-cors
- [ ] Create config.py with SQLite config
- [ ] Create models.py with User model
- [ ] Set up Flask-Migrate
- [ ] Create auth routes (login, logout, me)
- [ ] Add CORS for development

**Deliverable:** User can login, session persists, protected routes work

---

### Phase 2: Dashboard
**Backend:**
- [ ] Add Ficcionario model (basic fields only)
- [ ] Create ficcionarios routes (list, create, delete)

**Frontend:**
- [ ] Create DashboardPage layout
- [ ] Create EmptyState component
- [ ] Create DashboardTable with rows
- [ ] Add "New Ficcionario" button
- [ ] Create DeleteConfirmModal
- [ ] Add uiStore for modal state

**Deliverable:** User sees ficcionario list, can create new, can delete

---

### Phase 3: Editor - General Info
**Backend:**
- [ ] Add PUT endpoint for ficcionario update
- [ ] Add validation for required fields

**Frontend:**
- [ ] Create EditorPage with sticky Header
- [ ] Create GeneralInfoForm with all metadata fields
- [ ] Create editorStore with save status
- [ ] Implement useAutoSave hook (2s debounce)
- [ ] Wire up save status indicator ("Saved ✓" / "Saving..." / "Unsaved")

**Deliverable:** User edits general info, auto-save works with visual feedback

---

### Phase 4: Ficheros & Terms
**Backend:**
- [ ] Add Fichero + Term models
- [ ] Create fichero routes (add, update, delete)
- [ ] Validate unique terms per fichero

**Frontend:**
- [ ] Create FicherosSection with accordion
- [ ] Create FicheroItem component
- [ ] Create TermsEditor with chip UI (Enter to add, X to remove)
- [ ] Add expand/collapse all functionality
- [ ] Wire ficheros to editor store

**Deliverable:** User manages ficheros and terms as chips in accordion

---

### Phase 5: Story Library
**Backend:**
- [ ] Add Story model with content_hash
- [ ] Create stories routes (list, upload)
- [ ] Implement duplicate detection via SHA-256 hash
- [ ] Add search filter

**Frontend:**
- [ ] Create StoryLibrary component
- [ ] Create StoryUploadModal with file input
- [ ] Implement duplicate detection UX ("Use existing?" option)
- [ ] Create radio selection for stories
- [ ] Wire story selection to fichero

**Deliverable:** User uploads stories, duplicates detected, can select per fichero

---

### Phase 6: Dictionary Generation
**Backend:**
- [ ] Refactor generator.py to use database models
- [ ] Create `/api/ficcionarios/:id/generate` endpoint
- [ ] Validate: required fields + at least 1 complete fichero

**Frontend:**
- [ ] Create GenerateProgressModal with progress bar
- [ ] Add "Generate Dictionary" button to header
- [ ] Disable button until validation passes
- [ ] Trigger download on completion

**Deliverable:** User generates and downloads .mobi file

---

### Phase 7: Polish & Error Handling
- [ ] Add Toast component for notifications
- [ ] Implement error toast on save failure
- [ ] Add loading states throughout
- [ ] Test mobile responsiveness
- [ ] Add keyboard navigation support
- [ ] Handle edge cases (empty states, network errors)

**Deliverable:** Production-ready MVP

---

## Dependencies to Install

**Frontend (`client/package.json`):**
```bash
npm install react-router-dom zustand
```

**Backend (`requirements.txt`):**
```
flask>=3.0.0
flask-sqlalchemy>=3.1.0
flask-migrate>=4.0.0
flask-login>=0.6.0
flask-cors>=5.0.0
```

---

## Verification Checklist

After each phase, verify:

1. **Phase 1**: Login → session persists on refresh → protected routes redirect
2. **Phase 2**: Create ficcionario → appears in table → delete works
3. **Phase 3**: Edit fields → "Unsaved" shows → waits 2s → "Saving..." → "Saved ✓"
4. **Phase 4**: Add fichero → add terms with Enter → chips display → X removes
5. **Phase 5**: Upload story → duplicate detected → "Use existing" works → radio selects
6. **Phase 6**: Generate → progress shows → .mobi downloads with all entries
7. **Phase 7**: Error occurs → toast shows → mobile layout works

---

## Critical Files to Modify

| File | Changes |
|------|---------|
| `client/src/App.tsx` | Add RouterProvider, remove current form |
| `client/src/components/ui/*` | Replace with neobrutalism components |
| `server/app.py` | Add SQLAlchemy, Flask-Login, blueprints, CORS |
| `server/generator.py` | Adapt for database models instead of form data |
| `client/package.json` | Add react-router-dom, zustand |
| `requirements.txt` | Add Flask extensions |

---

## Notes

- **Auto-accept edits** during implementation
- **STOP before and after each phase** for review
- Use TDD approach where practical
- Follow SOLID principles
- Keep it simple - no over-engineering
