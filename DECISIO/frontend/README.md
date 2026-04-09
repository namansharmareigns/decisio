# Decisio Frontend

Modern React + TypeScript frontend for the Decisio Decision Intelligence Platform.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **date-fns** - Date formatting

## Development

### Prerequisites

- Node.js 18+ and npm

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Features

- **Dashboard**: Overview of decisions and project metrics
- **Decisions Management**: Create, view, and manage engineering decisions
- **Project Context**: Set and update project context (team size, users, timeline)
- **Drift Detection**: Evaluate decisions for drift and risk assessment
- **Context Snapshots**: Capture project state at decision time

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── public/             # Static assets
└── package.json        # Dependencies
```

## API Integration

The frontend communicates with the backend API through the service layer in `src/services/api.ts`. All API calls are proxied through Vite's dev server to avoid CORS issues.

## Docker

The frontend can be run in Docker using the provided Dockerfile:

```bash
docker build -t decisio-frontend .
docker run -p 3000:80 decisio-frontend
```

Or use docker-compose from the root directory to run the full stack.
