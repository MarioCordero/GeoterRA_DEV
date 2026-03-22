# AI Agent Instructions — GeoterRA

Purpose: Provide concise, actionable guidance so an AI coding agent (Copilot/Claude-style) can make safe, correct edits in this workspace.

1. Quick discovery
- Search for these files first: `API/README.md`, `website/src/config/apiConf.jsx`, `API/docs/arquitectura.md`, `database/GeoterRA.sql`, `Android/Development`.

2. Code style & language notes
- PHP: follow patterns in [API/README.md](API/README.md) and the PSR-ish structure under [API/src](API/src). Use existing Controllers → Services → Repositories layering.
- JavaScript/React: follow patterns in [website/src/main.jsx](website/src/main.jsx) and components under [website/src/components](website/src/components).
- Kotlin/Android: follow files under [Android/Development](Android/Development) and keep Gradle configs unchanged.

3. Architecture summary
- Backend: PHP API with DTOs and custom router. Key examples: [API/src/Controllers/AuthController.php](API/src/Controllers/AuthController.php) and [API/src/Services/AuthService.php](API/src/Services/AuthService.php).
- Frontend: React + Vite in `website/`. API URLs are configured in [website/src/config/apiConf.jsx](website/src/config/apiConf.jsx).
- Mobile: Android app in `Android/Development/` talks to the same API endpoints.

4. Build & test commands (agents should try these before editing build-critical files)
- Frontend (dev):
  - `cd website && npm ci && npm run dev`
- Backend (quick local run):
  - Ensure `API/config/config.ini` exists (copy from `API/config/config.ini` example), then run a local PHP server from project root or configure your webserver to serve `API/public`.
- API tests (scripts):
  - `bash API/tests/register_endpoint_test.sh` (see other scripts in `API/tests/`)

5. Project conventions (do not invent new patterns)
- Add endpoints by creating a `DTO` → `Service` → `Controller` and wire into the router. Update `API/docs/contratos.md` with the contract and add tests in `API/tests/`.
- Error handling uses `ApiException` and `Http/ErrorType` under `API/src/Http/`.
- Persistence: repository classes live under `API/src/Repositories/` and are the only layer to run SQL queries.

6. Integration & config
- Secrets/config: `API/config/config.ini` holds DB credentials — do not commit secrets. Use `API/config/config.ini` example files as templates.
- Frontend uses `website/src/config/apiConf.jsx` to point to the API base URL; change there for environment switches.

7. Security-sensitive areas
- Authentication & tokens: token rotation and storage are implemented server-side; audit `API/src/Services/AuthService.php` and `API/src/Repositories/UserRepository.php` for changes.
- Database migrations: check `database/GeoterRA.sql` before modifying schemas.

8. Agent behavior expectations
- Prefer minimal, focused edits. Do not refactor unrelated modules.
- When adding or changing endpoints: update `API/docs/contratos.md`, add or update tests under `API/tests/`, and run the relevant test scripts.
- If a global change is needed (e.g., API URL rename), update `website/src/config/apiConf.jsx`, `Android/Development` configs, and document the change in this file.

9. When to ask for human review
- Changes touching auth, DB migrations, or release branching.
- Any change that requires provisioning or secret access (CI, production config).

If anything is unclear or you want a different level of automation, leave a comment in `notes.txt` or open an issue.
