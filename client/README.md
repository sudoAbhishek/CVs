# CVs Client

Frontend for the resume builder application built with **React** and **Vite**.

## Tech Stack

- **React** (^19.1.1) — UI library
- **Vite** (^7.2.2) — Build tool & dev server
- **React Router DOM** (^7.9.4) — Client-side routing
- **Axios** (^1.13.0) — HTTP client
- **Bootstrap** (^5.3.8) — CSS framework
- **React PDF Renderer** (^4.3.1) — PDF generation
- **React Icons** (^5.5.0) — Icon library
- **Google OAuth** (@react-oauth/google ^0.12.2) — Social login
- **JWT Decode** (^4.0.0) — Token parsing
- **ESLint** — Code linting

## Project Structure

```
src/
├── App.jsx                 # Main app component
├── App.css                 # Global styles
├── main.jsx                # Entry point
├── index.css               # Root styles
├── components/             # Reusable components
│   ├── CVCard.jsx
│   ├── CVPreview.jsx
│   ├── Footer.jsx
│   └── Navbar.jsx
├── pages/                  # Page components
│   ├── Dashboard.jsx
│   ├── LoginPage.jsx
│   ├── NotFound.jsx
│   ├── RegisterPage.jsx
│   ├── ResumeBuilder.jsx
│   └── SharedCV.jsx
├── protectedRoute/         # Route protection
│   └── Protected.jsx
├── services/               # API calls
│   └── api.js
├── assets/                 # Static assets
│   └── dummyResume.js
```

## Prerequisites

- Node.js (>= 18)
- npm or yarn

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file (if needed) — copy from `dotenv.example`:

```bash
cp dotenv.example .env
```

## Development

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Key Features

- **Resume Builder** — Create and edit resumes with a visual editor
- **PDF Export** — Generate PDF versions of resumes
- **Sharing** — Share resume links with others
- **Google OAuth** — Sign in with Google
- **Responsive Design** — Mobile-friendly UI with Bootstrap
- **Protected Routes** — Authenticated pages require login

## Environment Variables

Create a `.env` file and add:

```
VITE_API_BASE_URL=http://localhost:5000
# Add other API endpoints as needed
```

## API Integration

API calls are centralized in `src/services/api.js`. The service communicates with the backend server (see `../server/README.md`).

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |

## Troubleshooting

- **Port already in use?** Vite will use the next available port automatically.
- **Module not found?** Run `npm install` to ensure all dependencies are installed.
- **API connection issues?** Check that the backend server is running and the `VITE_API_BASE_URL` environment variable is correct.

## Contributing

- Follow ESLint rules (`npm run lint`).
- Keep component files in `components/` or `pages/`.
- Use relative imports for local modules.

## Notes

- Ensure the backend server is running before starting the frontend.
- Check `../README.md` for full project setup instructions.
