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

#### Backend DTO & Validation Pattern

When updating DTOs (Data Transfer Objects):

1. **Make fields optional where appropriate**:
   ```php
   public function __construct(
     public ?string $firstName = null,      // ✅ Optional for partial updates
     public ?string $lastName = null,
     public ?string $password = null,
   ) {}
   ```

2. **Support flexible input formats**:
   - Accept both camelCase (from frontend) and snake_case (from database)
   ```php
   public static function fromArray(array $data): self {
     return new self(
       firstName: $data['first_name'] ?? $data['firstName'] ?? null,
       lastName: $data['last_name'] ?? $data['lastName'] ?? null,
     );
   }
   ```

3. **Validate only required fields**:
   - Skip validation for null/empty optional fields
   - Handle special cases (e.g., password change requires current password)
   ```php
   public function validate(): void {
     // Only validate if field is being updated
     if ($this->password && !$this->currentPassword) {
       throw new ApiException(ErrorType::validationError('Current password required'), 400);
     }
     if ($this->firstName === '') {  // Only if explicitly empty string
       throw new ApiException(ErrorType::missingField('firstName'), 422);
     }
   }
   ```

4. **In Repositories**: Build dynamic UPDATE queries for partial updates
   ```php
   $updates = ['updated_at = NOW()'];
   $params = [':user_id' => $dto->userId];
   
   if ($dto->firstName !== null) {
     $updates[] = 'first_name = :first_name';
     $params[':first_name'] = $dto->firstName;
   }
   // Only include fields that are actually being updated
   ```

5. **In Services**: Use DTOs for validation and business logic before persisting
   ```php
   $dto->validate();
   // Password verification, hashing, etc.
   $updated = $this->repository->update($dto);
   ```

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

### Frontend Development Guidelines

#### Component Organization
- **Layout**: Page-level components in `website/src/components/loggedComponents/views/`
- **Shared components**: Reusable modal, form, and utility components in `website/src/components/common/`
- **Hooks**: Custom React hooks in `website/src/hooks/` (e.g., `useSession` for authentication state)
- **Config**: Centralized API config and endpoints in `website/src/config/apiConf.jsx`

#### Reusable Component Patterns
When creating components, maximize reusability:

1. **Modal Components** (like `ConfirmationModal`):
   - Accept flexible `props` for title, message, items, callbacks
   - Support multiple display modes: warning, danger, info
   - Place in `website/src/components/common/`
   - Document props with JSDoc comments
   - Example: `<ConfirmationModal open={isOpen} title="Delete?" message="..." items={[...]} onOk={handler} danger />`

2. **Form Patterns**:
   - Use Ant Design `Form` component with validation rules
   - Always include loading states
   - Separate form submission (`handleSubmit`) from confirmation logic
   - Use DTO-like objects to prepare payloads before sending

3. **State Management**:
   - Use `useState` for component-level state
   - Use custom hooks like `useSession` for shared auth state
   - Keep UI state (modals, forms) separate from data state

#### API Integration Pattern (Frontend)

All backend communication must go through centralized functions in `website/src/config/apiConf.jsx`:

1. **API Layer Structure**:
   - Define endpoint URLs using object factories (e.g., `users.me()`, `auth.login()`)
   - Create wrapper functions like `userMe()`, `authLogin()`, `userMeUpdate()`
   - Use the `callApi()` abstraction for HTTP calls with automatic credential/header handling

2. **Check if function exists** in `website/src/config/apiConf.jsx` before refactoring

3. **Replace direct fetch() calls** with abstracted functions:
   ```javascript
   // BEFORE (❌ direct fetch):
   const response = await fetch(users.me(), {
     method: "PUT",
     credentials: "include",
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ firstName: "Mario" })
   });
   const data = await response.json();
   if (!response.ok) { throw new Error(data.errors?.[0]?.message); }

   // AFTER (✅ centralized):
   const payload = { firstName: "Mario", lastName: "Dev", email: "m@dev.com", phoneNumber: "123456789" };
   const result = await userMeUpdate(payload);
   if (!result.ok) { throw new Error(result.error); }
   ```

4. **Payload preparation**:
   - Build payloads in a variable before sending
   - Include console.log for debugging: `console.log('📤 [handler] Sending payload:', payload);`
   - Always validate required fields exist on client before sending

5. **Error handling**:
   - Use `result.error` (string) instead of parsing response
   - Match backend error patterns (check API response format)
   - Show user-friendly messages via `message.success()` or `message.error()`

6. **To request refactoring**, use this format:
   ```
   Refactor the [PUT http://endpoint] API call in [ComponentName] to use [functionName] from apiConf
   ```
   - Example: `Refactor the PUT http://localhost:8000/API/public/users/me API call in ProfilePage to use userMeUpdate from apiConf`

#### Session & Cookie Handling
- Authentication handled via `useSession` hook
- Session token stored as HttpOnly cookie (browser manages automatically)
- **Important**: When accessing locally, use `http://localhost:5173` instead of `http://geoterra.com:5173` to avoid cross-origin cookie issues
- Frontend automatically sends cookies with every `fetch(endpoint, { credentials: 'include' })`
- No manual cookie access needed (HttpOnly prevents JavaScript access)

#### Frontend-Backend Sync
- Frontend DTOs map to backend DTOs in camelCase (e.g., `firstName` ↔ `first_name`)
- Backend validation errors shown to user with `message.error()`
- Use backend `UpdateUserDTO` or similar for payload contracts

9. When to ask for human review
- Changes touching auth, DB migrations, or release branching.
- Any change that requires provisioning or secret access (CI, production config).

If anything is unclear or you want a different level of automation, leave a comment in `notes.txt` or open an issue.

10. Git Commit Style
- When generating commits, you MUST strictly follow this specific format and write the descriptions in ENGLISH:
```
# FEAT:

- Description of the completed task

- Description of another completed task

----------------
```
- Replace `FEAT:` with the appropriate prefix as necessary (e.g. `FIX:`, `REFACTOR:`, `CHORE:`, etc) matching the exact capitalization and `# ` prefix layout.
- List all descriptions of tasks separated by `- ` with empty newlines in between as shown.
- Ensure the commit message is always closed out with `----------------`.
