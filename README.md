# CVs

A resume builder web application (client + server)

This repository contains a React (Vite) client and a Node/Express server for building, saving, and sharing resumes.

## Repository Structure

- `client/` — Frontend (Vite + React)
- `server/` — Backend (Node + Express)
- `uploads/` — Persisted resume uploads (server)

## Features

- Build and preview resumes
- Save resumes to the server
- Share resumes via generated links

## Prerequisites

- Node.js (>= 18 recommended)
- npm (or yarn)

## Setup

1. Copy environment files

   - For the server: copy `server/dotenv.example` to `server/.env` and fill required values.
   - For the client (if needed): copy `client/dotenv.example` to `client/.env`.

2. Install dependencies

   In PowerShell (from repository root):

```powershell
cd server; npm install; cd ..
cd client; npm install; cd ..
```

## Run (Development)

Start the backend and frontend in separate shells.

- Server (PowerShell):

```powershell
cd server; npm run dev
# or if start is not defined:
# node index.js
```

- Client (PowerShell):

```powershell
cd client; npm run dev
```

Note: The exact scripts (`start`, `dev`) depend on the `package.json` in each folder. If a script name differs, use the script defined there (run `npm run` to view available scripts).

## Build (Production)

- Build frontend:

```powershell
cd client; npm run build
```

- Serve static build with any static server or integrate with the backend as desired.

## Environment Variables

See `server/dotenv.example` and `client/dotenv.example` for variables required by each side (database connection, API keys, OAuth, etc.).

## Contributing

- Open issues or pull requests on features or bug fixes.
- Follow the existing code style and file structure.

## License

Add a license or remove this section. (e.g., MIT)

## Contact

Project: `CVs` — maintained by the repository owner.
