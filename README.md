# 🛡️ TruthShield — AI-Powered Fake Content & Phishing Detection Platform

TruthShield analyzes URLs, pasted text, WhatsApp forwards, and photos/screenshots to flag likely fake, scam, fraud, or rumor content — combining fast keyword-pattern matching with a Python ML confidence score.


---

## Architecture

```
React frontend (Netlify)
        │  fetch, Authorization: Bearer <JWT>
        ▼
Spring Security filter chain (stateless, JwtAuthFilter validates every /api/** request except /api/auth/login|signup)
        ▼
Spring Boot backend (Render) ──────► Python Flask ML service (TF-IDF + Logistic Regression)
        │
        ▼
   MongoDB Atlas (users, scan_history)
```

Detection is **hybrid**: a fast keyword-category match (scam/fraud/rumor/fake/genuine word lists) runs first, then a Python ML confidence score is layered on top and combined. If the ML service is unreachable, the app **degrades gracefully** to keyword-only scoring rather than failing the request.

Auth is real **Spring Security** — a `SecurityFilterChain` bean (`SecurityConfig.java`) enforces stateless JWT authentication on every `/api/**` route except login/signup, backed by a custom `JwtAuthFilter` that populates Spring Security's `SecurityContext` from a validated token. Passwords are hashed with `BCryptPasswordEncoder` (also a Spring Security bean).

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Java 17, Spring Boot 3.5, Spring Data MongoDB, **Spring Security** (stateless JWT filter chain via `jjwt` + BCrypt) |
| ML service | Python, Flask, scikit-learn (TF-IDF + Logistic Regression) |
| Frontend | React 19, Recharts (analytics), Tesseract.js (OCR), jsQR (QR scan), jsPDF |
| Database | MongoDB Atlas |
| Extra | Chrome Extension, Tauri/Electron desktop build, Tamil + English UI |
| CI/CD | GitHub Actions — build+test on every push; deploy job auto-triggers Render (backend, ML service) + Netlify (frontend) **only if all tests pass** |

## Features

- URL / text / WhatsApp-message fake-content detection
- Camera, image upload, screenshot, and QR-code scanning — OCR runs **entirely client-side**, no image ever leaves the browser
- Bulk scanning (multiple URLs/texts at once)
- Detection analytics (bar/pie charts of fake vs. genuine scans)
- Per-user scan history
- Email alert when FAKE content is detected
- Bilingual UI (English / Tamil), dark/light theme
- PDF export of results, voice input, browser notifications
- Chrome extension for quick in-browser scanning

## Running locally

### Backend
```bash
cd backend
export MONGODB_URI="<your MongoDB Atlas connection string>"
export JWT_SECRET="<32+ random characters>"
export MAIL_USERNAME="<gmail address>"
export MAIL_PASSWORD="<gmail app password>"
export ML_SERVICE_URL="http://127.0.0.1:5000/detect"   # optional, this is the default
./mvnw spring-boot:run
```
Runs on `http://localhost:8082`.

### ML service
```bash
cd ml-server
pip install -r requirements.txt
python truthShield_ml.py
```
Runs on `http://localhost:5000`. Prints held-out test accuracy/precision/recall/F1 on startup.

### Frontend
```bash
cd frontend
npm install
npm start
```
Runs on `http://localhost:3000`. Update the `API` constant in `src/App.js` to point at your local backend if not using the deployed one.

## Environment variables

| Variable | Used by | Notes |
|---|---|---|
| `MONGODB_URI` | backend | MongoDB Atlas connection string |
| `JWT_SECRET` | backend | 32+ random characters, keep private |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | backend | Gmail SMTP — use an [App Password](https://myaccount.google.com/apppasswords), not your real password |
| `ML_SERVICE_URL` | backend | Defaults to `http://127.0.0.1:5000/detect` |
| `FRONTEND_URL` | backend | Allowed CORS origin; defaults to the deployed Netlify URL |

## CI/CD Setup (one-time, on GitHub)

The deploy step in `.github/workflows/build.yml` needs three repo secrets so it can trigger Render/Netlify deploys after tests pass. Go to **GitHub repo → Settings → Secrets and variables → Actions → New repository secret** and add:

| Secret name | Where to get it |
|---|---|
| `RENDER_BACKEND_DEPLOY_HOOK` | Render dashboard → your backend service → Settings → **Deploy Hook** → copy URL |
| `RENDER_ML_DEPLOY_HOOK` | Render dashboard → your ml-server service → Settings → **Deploy Hook** → copy URL |
| `NETLIFY_BUILD_HOOK` | Netlify dashboard → Site settings → Build & deploy → **Build hooks** → Add build hook → copy URL |

Without these secrets set, the deploy job runs but just logs "secret not set — skipping" for each missing one (it won't fail the workflow) — Render/Netlify's own git-based auto-deploy will still work independently as a fallback, just without the "only deploy if tests pass" guarantee.

**Important:** Render and Netlify both auto-deploy on every git push by default, *regardless of whether these GitHub Actions tests pass*. For the "deploy only if tests pass" guarantee to actually mean something, turn OFF each service's automatic git-deploy and rely only on the deploy hook that GitHub Actions calls after tests pass:
- Render: service → Settings → Build & Deploy → **Auto-Deploy → No**
- Netlify: Site settings → Build & deploy → **Stop builds** (then only the build hook triggers a deploy)

If you leave auto-deploy ON for both, you still get a working app (nothing breaks), but you lose the actual point of gating deploy behind tests — Render/Netlify would deploy immediately on push either way, whether or not this workflow's tests pass.

## Known limitations / roadmap

- ML model is trained on a small (~40-row) hand-written dataset — good enough to prove the pipeline, not yet production-grade. Swapping in a real labeled dataset (e.g. a Kaggle fake-news/phishing corpus) doesn't require any Java-side changes.
- Rate limiting is a simple in-memory per-instance limiter — fine for a single backend instance, would need a shared store (Redis) for a multi-instance production deployment.
- Chrome extension doesn't have its own login flow yet, so it currently needs an update to attach a JWT before it can call the (now-protected) `/api/detect` endpoint.
- `official.txt` keyword list is now wired into detection (government/PIB phrasing counts as a genuine signal).

## Developer

**Sarsika Sri K** — github.com/sarsika
