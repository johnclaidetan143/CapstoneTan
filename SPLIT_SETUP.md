# Project Split Complete

## Structure
- `frontend/` -> Next.js frontend app
- `backend/` -> Express backend API

## Run Frontend
```powershell
cd frontend
npm install
npm run dev
```

Frontend default: `http://localhost:3000`

## Run Backend
```powershell
cd backend
npm install
npm run dev
```

Backend default: `http://localhost:4000`

## Backend Endpoints
- `GET /health`
- `GET /api/products`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/orders?email=<email>`
- `POST /api/orders`
