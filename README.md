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
fulls/
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
