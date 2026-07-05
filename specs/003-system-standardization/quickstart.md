# Quickstart Validation Guide

Follow these steps to validate that the infrastructure standardization is complete and functioning perfectly:

### Prerequisites
- Docker & Docker Compose
- Node.js 20+

### Step 1: Wipe Existing Environment
Ensure no conflicting ports or cached configurations are lingering:
```bash
make clean
```

### Step 2: Establish `.env` Configs
```bash
cp .env.example .env
cd frontend && cp .env.local.example .env.local && cd ..
```

### Step 3: Start the Backend + DB
Spin up the backend on standard ports (DB: 5433, Backend: 8080).
```bash
make up
```

### Step 4: Start Frontend Natively (The "Fast" Way)
In a new terminal:
```bash
cd frontend
npm run dev
```

### Expected Outcomes
1. Open your browser to `http://localhost:3000`.
2. The login page should load rapidly via Turbopack.
3. No `ECONNREFUSED` errors should appear in the terminal console.
4. Logging into the app should successfully ping the backend on `http://localhost:8080` and authenticate.
