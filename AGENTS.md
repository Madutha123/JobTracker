# jobtracker

Monorepo with `backend/` and `frontend/`.

## Commands

### Backend (`backend/`)
| Command | What |
|---|---|
| `./mvnw spring-boot:run` | Start dev server (port 8080) |
| `./mvnw test` | Run all tests |
| `./mvnw clean compile` | Compile without tests |

Spring Boot 4.1 / Java 17. Uses `mvnw` — do not assume `mvn` is installed. MySQL datasource + JWT config in `application.properties`.

### Frontend (`frontend/`)
| Command | What |
|---|---|
| `npm run dev` | Vite dev server (http://localhost:5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint on `.js` / `.jsx` |

React 19 + Vite 8. Plain JSX (no TypeScript). No test framework. Tailwind CSS configured.

## Architecture

- **Backend** (`backend/src/main/java/com/example/jobtracker/`): Entrypoint `JobtrackerApplication.java`. Organized by domain (not by layer). Cross-cutting concerns (`SecurityConfig`, `ApplicationConfig`, `GlobalExceptionHandler`) at root-level `config/` and `exception/` packages. Auth domain under `auth/` with JWT-based register/login at `/api/auth/register` and `/api/auth/login`, plus Google OAuth at `/api/auth/oauth/google`. `User` entity implements `UserDetails` with unique `username` and `email`. BCrypt passwords. CORS allows `http://localhost:5173` only.
- **Frontend** (`frontend/src/`): Entrypoint `main.jsx` → `App.jsx`. React Router with `/login`, `/register`, `/dashboard` (protected) routes. Axios API service at `services/api.js` calls `http://localhost:8080` directly. JWT stored in `localStorage` as `jt_token`, user info as `jt_user`. Login sends email as `username` field to backend. Toast notification system via `components/Toast.jsx`. Google OAuth via `@react-oauth/google` — `GoogleOAuthProvider` wraps the app in `main.jsx`.
- **Google OAuth setup**: Set the same Client ID in both `backend/src/main/resources/application.properties` (`app.oauth.google.client-id`) and `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`). Create OAuth 2.0 Web Application credentials in Google Cloud Console with `http://localhost:5173` as an authorized JavaScript origin.
- No dev proxy — frontend calls backend directly.

## Conventions

- **Java**: Standard Spring Boot layout. Lombok. JPA repositories, validation, security starters on classpath. `./mvnw` only — never `mvn`.
- **Frontend**: JavaScript (`.jsx`), functional components + hooks, Tailwind utility classes. ESLint enforces React Hooks rules and react-refresh patterns.
- `.agents/` and `skills-lock.json` are gitignored — OpenCode metadata.
