# API Tester — Frontend

A React + Vite frontend for **API Tester**, a Postman-style API testing workspace. This repository contains **only the frontend**. The backend (Node.js, Express, MongoDB, Socket.IO, auth, SMTP/2FA, Google OAuth) is built separately by the backend team.

The app ships with a complete **mock API** so it runs and is fully clickable with no backend connected. Switching to the real backend is a single environment variable.

## 1. Features

- Landing page, How It Works, Features, About, Privacy Policy and Terms & Conditions (both downloadable)
- Register, Login (split-screen layout), 2FA/OTP verification, "Continue with Google" (integration-ready)
- Protected routing, session restoration on refresh, session-expiry handling with redirect
- Dashboard: summary cards, request activity and response-time charts, recent requests, collections/environments/tests summary
- Collections with folders, request builder (Params, Headers, Body — JSON/form-data/raw, Authentication — API key/Bearer/Basic, Tests)
- Response viewer: status, time, size, Body/Headers/Cookies/Test Results/Validation tabs, copy/format/download
- Request history with re-run, delete, clear
- Environments with variables and `{{VARIABLE}}` substitution, environment switcher in the header
- Automated test cases with assertions (status, response time, field presence, JSON value)
- Performance analytics page
- Import / Export of collections as JSON
- Real-time notifications via Socket.IO client (mocked out of the box)
- Light/dark theme with persistence, responsive layout (desktop/tablet/mobile with drawer sidebar)
- Global search / command palette (Ctrl+K), keyboard shortcuts (Ctrl+Enter send, Ctrl+S save, Esc close)
- Toasts, empty states, loading states, confirmation modals, unsaved-changes guard, global error boundary

## 2. Tech stack

React 18 · Vite 5 · React Router 6 · Axios · Socket.IO client · Lucide icons · plain CSS (custom design system, no UI framework)

## 3. Frontend architecture

```
src/
  api/            Centralized API layer (see below) + mock/ (mock backend, dev only)
  components/     Reusable UI (ui/), layout (layout/), request builder (request/), shared (common/)
  pages/          public/, auth/, app/
  layouts/        Root, PublicLayout, AuthSplitLayout, AppLayout
  routes/         router.jsx, guards.jsx (ProtectedRoute / PublicOnlyRoute / OtpGuard)
  context/        AuthContext, WorkspaceContext, NotificationContext, ThemeContext, ToastContext
  hooks/          useResource, useRequestBuilder, useDismiss, useElementWidth, useDocumentTitle
  utils/          request.js, variables.js, format.js, download.js, highlight.js, prefsStore.js
  data/           static content: features, steps, legal text, assertion types
  config/env.js   single place all import.meta.env reads happen
  styles/         index.css (the whole design system)
```

## 4. Installation

```bash
npm install
cp .env.example .env     # already done in this export; edit values as needed
npm run dev
```

## 5. Environment variables

See `.env.example` for the full list with comments. The important ones:

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the Express API, e.g. `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket.IO server URL (defaults to the API host) |
| `VITE_USE_MOCK_API` | `true` (default) runs entirely against the built-in mock backend, no server needed |
| `VITE_USE_MOCK_SOCKET` | `true` (default) simulates notification events instead of connecting a real socket |
| `VITE_AUTH_MODE` | `token` (JWT in `Authorization` header, default) or `cookie` (HttpOnly session cookie) |
| `VITE_AUTH_STORAGE` | Token mode only: `local` or `session` storage for "remember me" |
| `VITE_GOOGLE_AUTH_URL` | Where "Continue with Google" redirects the browser in real mode |
| `VITE_GITHUB_URL` | Repository opened by the footer GitHub icon |

## 6. Running the frontend

```bash
npm run dev       # start dev server (mock API on by default)
npm run build     # production build to dist/
npm run preview   # preview the production build
```

**Mock mode credentials:** `demo@apitester.dev` / `Demo@1234`, OTP code `123456`.

## 7. Backend integration

All backend calls go through `src/api/apiClient.js`, a single Axios instance with:
- base URL from `VITE_API_BASE_URL`
- an interceptor that attaches the Authorization header in token mode, or sends cookies in cookie mode
- centralized error handling (`src/api/errors.js`) mapping `400/401/403/404/409/422/429/500/503` to user-facing messages
- automatic sign-out + redirect on `401` (except on the auth endpoints themselves)

Feature-specific calls are grouped into service modules (`authApi`, `requestApi`, `collectionApi`, `environmentApi`, `testApi`, `userApi`, `analyticsApi`, `notificationApi`), all re-exported from `src/api/index.js`. Endpoint paths are centralized in `src/api/endpoints.js` — **update paths there**, not inside components, when the backend team finalizes routes.

To connect the real backend: set `VITE_API_BASE_URL` to the backend's URL, set `VITE_USE_MOCK_API=false` (and `VITE_USE_MOCK_SOCKET=false`), and adjust `endpoints.js` if the backend's route names differ from the documented contract below.

### Expected API contract (adjust as needed)

```
POST   /auth/register
POST   /auth/login                 -> { otpRequired, challengeId, email, expiresIn } | { user, token }
POST   /auth/verify-otp            -> { user, token? }
POST   /auth/resend-otp
GET    /auth/me                    -> { user }
POST   /auth/logout
GET    /auth/google  (redirect)    -> backend runs OAuth, redirects to /login?oauth=success|error

GET    /collections
POST   /collections
PUT    /collections/:id
DELETE /collections/:id
POST   /collections/:id/folders
PUT    /collections/:id/folders/:folderId
DELETE /collections/:id/folders/:folderId
GET    /collections/export
POST   /collections/import

POST   /requests                   (save)
PUT    /requests/:id
DELETE /requests/:id
GET    /requests/:id
POST   /requests/:id/duplicate
POST   /requests/execute           -> { status, statusText, time, size, headers, cookies, body, contentType, testResults, validation }
GET    /history
DELETE /history/:id
DELETE /history                    (clear all)

GET    /environments
POST   /environments
PUT    /environments/:id
DELETE /environments/:id

GET    /tests
POST   /tests
PUT    /tests/:id
DELETE /tests/:id
POST   /tests/:id/run
POST   /tests/run-all

GET    /users/profile
PUT    /users/profile
POST   /users/profile/picture      (multipart, field "avatar") -> { avatarUrl }
DELETE /users/profile/picture

GET    /analytics/dashboard
GET    /analytics/performance?range=7|14|30

GET    /notifications
PUT    /notifications/:id/read
PUT    /notifications/read-all
```

## 8. Authentication integration

`AuthContext` (`src/context/AuthContext.jsx`) exposes `user`, `isAuthenticated`, `loading`, `login()`, `register()`, `verifyOtp()`, `resendOtp()`, `googleLogin()`, `logout()`, `restoreSession()`. It does not assume a token or a cookie: `VITE_AUTH_MODE` controls how the session is carried, so the frontend works unchanged whichever mechanism the backend team ships.

## 9. Session management

On load, `AuthProvider` calls `GET /auth/me` (token mode: only if a token is stored) and shows a full-screen "Checking your session..." loader until that resolves, so no page flashes before the auth state is known. Any `401` from a protected call clears the session, shows a toast, and redirects to `/login` with an "expired" message. `ProtectedRoute` / `PublicOnlyRoute` in `src/routes/guards.jsx` gate access both ways.

## 10. Socket.IO integration

`src/api/socketService.js` creates the client connection (JWT in the handshake for token mode, `withCredentials` for cookie mode) and `NotificationContext` wires it to a `useNotifications()` hook used by the notification bell. Expected events: `requestCompleted`, `testPassed`, `testFailed`, `collectionImported`, `environmentChanged`, `systemNotification`.

## 11. Google OAuth integration

The button calls `authApi.googleLogin()`. In real mode this simply redirects the browser to `VITE_GOOGLE_AUTH_URL`; the backend performs the OAuth handshake and redirects back to `/login?oauth=success` (or `?oauth=error`), where the frontend picks the session up via `restoreSession()`. No Google client secret is ever present in this repository.

## 12. SMTP / 2FA integration

`/verify-otp` posts a 6-digit code to `authApi.verifyOtp()`; `resendOtp()` triggers a new email. All email delivery is the backend's responsibility — the frontend only implements the UI and the two API calls.

## 13. Mock mode

`VITE_USE_MOCK_API=true` swaps the Axios adapter for an in-browser mock server (`src/api/mock/`) backed by `localStorage`, with a `POST /requests/execute` implementation that fabricates realistic responses. `VITE_USE_MOCK_SOCKET=true` similarly fakes the Socket.IO client. Every mock lives behind these two flags, with no mock logic mixed into UI components, so turning both off switches the entire app to the real backend with no code changes.

## 14. Production build

```bash
npm run build
```

Outputs a static build to `dist/`, deployable to any static host. Set the `VITE_*` environment variables at build time for your target environment.
