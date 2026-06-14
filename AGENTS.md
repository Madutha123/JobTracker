# jobtracker

Monorepo with two independent projects under `backend/` and `frontend/`. Both are scaffolds with minimal custom code.

## Commands

### Backend (`backend/`)
| Command | What |
|---|---|
| `./mvnw spring-boot:run` | Start dev server |
| `./mvnw test` | Run tests |
| `./mvnw clean compile` | Compile without tests |

Spring Boot 4.1 / Java 17. Uses `mvnw` (Maven wrapper) — do not assume `mvn` is installed. MySQL driver on classpath but no datasource configured yet.

### Frontend (`frontend/`)
| Command | What |
|---|---|
| `npm run dev` | Start Vite dev server (default http://localhost:5173) |
| `npm run build` | Production build |
| `npm run lint` | ESLint (`.js` / `.jsx` only) |

React 19 + Vite 8. Plain JSX (no TypeScript). No test framework installed.

## Architecture

- **Backend**: `com.example.jobtracker` package, entrypoint `JobtrackerApplication.java`. Only one controller/repository/service exists so far — treat `backend/src/main/java/com/example/jobtracker/` as the source root.
- **Frontend**: Entrypoint `src/main.jsx` → `src/App.jsx`. All components in `src/`.
- No dev proxy or shared config between frontend and backend.
- `application.properties` is minimal — DB, security, and other Spring config will need to be added.

## Conventions

- **Java**: Standard Spring Boot layout. Lombok for boilerplate. JPA repositories, validation, and security starters are available.
- **Frontend**: JavaScript (`.jsx`), not TypeScript. Use functional components with hooks. ESLint enforces React Hooks rules and react-refresh patterns.
- No CSS framework or UI library in use.
