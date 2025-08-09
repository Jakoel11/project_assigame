# Copilot Instructions for Assigmé Backend

## Architecture Overview
- Node.js/Express REST API for classified ads (annonces), user authentication, and categories.
- PostgreSQL database, connection via `config/db.js` (uses `DATABASE_URL` from `.env`).
- Main entry: `index.js` (sets up Express, routes, DB check, server start).
- Core directories:
  - `controllers/` (business logic)
  - `routes/` (Express route definitions)
  - `models/` (database models, if present)
  - `middlewares/` (JWT auth middleware)
  - `config/` (DB config)

## Key Patterns & Conventions
- All protected routes use JWT middleware from `middlewares/authMiddleware.js`.
- Controllers expect DB connection via `require('../config/db')`.
- Route files import controllers and mount endpoints (see `routes/annonces.routes.js`).
- Error handling: always return JSON with a `message` field and appropriate HTTP status.
- All SQL queries use parameterized queries to prevent injection.
- User authentication: registration and login via `/api/auth/register` and `/api/auth/login`.
- Announce CRUD: `/api/annonces` (POST, GET, PUT, DELETE), with user context from JWT.
- Categories: `/api/categories` (GET), supports nested sous-categories.

## Developer Workflows
- Start server: `node index.js` (or `npm start` if defined in `package.json`).
- Environment config: `.env` must define `DATABASE_URL`, `PORT`, `JWT_SECRET`.
- DB migrations/changes: manually via SQL (no migration tool detected).
- Test API endpoints with Thunder Client, Postman, or curl (see README for examples).

## Integration Points
- Frontend expects API at `/api/*` (see `REACT_APP_API_URL` in frontend `.env`).
- JWT tokens required for all protected endpoints (pass in `Authorization: Bearer ...`).
- Images are stored as URLs (no file upload logic detected).

## Examples
- Creating an annonce (protected):
  ```json
  POST /api/annonces
  Header: Authorization: Bearer <token>
  Body: {
    "titre": "Vente vélo vintage",
    "description": "Très bon état, 10 ans d’âge.",
    "prix": 120,
    "categorie_id": 3,
    "sous_categorie_id": 7,
    "ville": "Lomé",
    "images": "https://exemple.com/velo.jpg",
    "is_boosted": false
  }
  ```
- Error response:
  ```json
  { "message": "❌ Erreur serveur" }
  ```

## Important Files
- `index.js`, `controllers/`, `routes/`, `middlewares/authMiddleware.js`, `config/db.js`, `.env`

---
_If any conventions or workflows are unclear, please ask for clarification or provide feedback to improve these instructions._
