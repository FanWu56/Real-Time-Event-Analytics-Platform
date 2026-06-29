# Real-Time Event Analytics Platform

A full-stack real-time event analytics platform that allows client applications to send user activity events through project-scoped API keys, view aggregated analytics in a React dashboard, and receive live event updates through WebSocket streaming.

## Features

- Project creation and project-scoped API key generation
- API-key based event ingestion
- Event schema validation with TypeScript and Zod
- Rate limiting for event ingestion
- PostgreSQL-backed raw event storage
- PostgreSQL-backed time-window aggregation
- Analytics dashboard with summary metrics, top events, recent events, and time-series charts
- WebSocket-based live event streaming
- Lightweight JavaScript SDK for tracking page views, button clicks, and custom events

## Tech Stack

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- Zod
- Socket.IO

### Frontend

- React
- TypeScript
- Vite
- Axios
- Recharts
- Socket.IO Client

### SDK

- TypeScript
- Browser Fetch API

## Project Structure

```text
Real-Time-Event-Analytics-Platform/
  docker-compose.yml
  backend/
    src/
      db/
      middleware/
      routes/
      schemas/
      scripts/
      store/
      websocket/
  frontend/
    src/
      api/
      pages/
      types/
  sdk/
    src/
```

## Getting Started

### 1. Install and Open Docker Desktop

https://www.docker.com/products/docker-desktop/

### 2. Clone repo & Go to directory

```bash
git clone https://github.com/FanWu56/Real-Time-Event-Analytics-Platform
cd Real-Time-Event-Analytics-Platform
```

### 3. Start PostgreSQL

```bash
docker compose up -d
```

### 4. Start backend

```bash
cd backend
npm install
copy .env.example .env
npm run db:init
npm run dev
```

### 5. Start Frontend (Open a new CMD window, and do not close the backend.)

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

When success, open (or the link showed in CMD)
```text
http://localhost:5173
```

### 6. Use page testing

In frontend CMD input(Replace "YOUR_API_KEY" with the api key generated in Front-end web page):
```bash
curl -X POST http://localhost:4000/api/events ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: YOUR_API_KEY" ^
  -d "{\"eventName\":\"page_view\",\"userId\":\"user_1\",\"properties\":{\"page\":\"/home\"}}"
```

### 7. Run SDK (Open a new CMD window, and do not close the backend & frontend)

```bash
cd Real-Time-Event-Analytics-Platform\sdk
npm install
npm run build
```

Open "demo.html" and replace "YOUR_API_KEY" with the api key generated in Front-end web page
```bash
sdk/demo.html
```

Then
```bash
npx serve .
```
Open the address it gives you, for example:
```bash
http://localhost:3000/demo.html
```

## Important
The backend includes API-key-based rate limiting. For demo purposes, the default development limit is 10 events per minute per API key. Therefore, if you send more than 10 events within one minute and the dashboard stops updating, this is expected behavior, not a bug.
