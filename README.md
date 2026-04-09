# Decisio

## Project Overview
Decisio is a web-based decision intelligence platform designed to help software teams capture, track, and continuously evaluate engineering decisions. It enables teams to record decisions along with their assumptions and context, and detect when those decisions become risky as project conditions evolve.

---

## Problem It Solves
In software projects, engineering decisions are often made based on assumptions about team size, scale, and timelines. As projects evolve, these assumptions change, but decisions are rarely revisited. This leads to outdated decisions, architectural mismatches, and increased maintenance costs.

Decisio addresses this problem by identifying **decision drift**, helping teams proactively review and manage decisions before they cause failures.

---

## Target Users (Personas)

### Engineering Lead
- Creates and manages engineering decisions
- Reviews risk levels and recommendations
- Ensures long-term system maintainability

### Project Manager
- Updates project context (team size, scale, timeline)
- Monitors overall decision risk
- Supports planning and risk mitigation

---

## Vision Statement
The vision of Decisio is to make engineering decisions transparent, explainable, and continuously relevant. By treating decisions as evolving entities, Decisio helps teams build systems that adapt reliably over time.

---

## Key Features / Goals
- Capture and manage engineering decisions
- Record assumptions and decision context
- Maintain current project context
- Detect decision drift
- Assign risk levels to decisions
- Provide clear and explainable insights

---

## Success Metrics
- Users can successfully record and retrieve decisions
- Decision drift is accurately detected
- Risk levels are clearly understandable
- Users can identify and review at-risk decisions early
- System meets all functional requirements

---

## Assumptions & Constraints

### Assumptions
- Users will document key decisions
- Project context is updated regularly
- Users understand basic software engineering concepts

### Constraints
- Academic project timeline
- Uses open-source tools
- Focus on decision-level analysis (not code-level)
- AI explanations remain interpretable

---

## Software Design

Decisio follows a **layered client-server architecture** with a modular backend.

Key design decisions:
- Separation of drift evaluation logic
- Service-based backend structure
- Context snapshot model for accurate comparison
- Docker-based deployment for consistency

### Architecture Diagram
![Architecture](docs/design/architecture.png)

### Wireframes
https://www.figma.com/design/8IV11XEn8DcqDT9ve184Ii/Decisio?node-id=1-5&t=g09R5lFR1jOmJ5vQ-1

---

## Branching Strategy
This project follows GitHub Flow:
- `main` branch contains stable code
- Feature branches are used for development
- Changes are merged via pull requests

---

## Quick Start – Local Development

### Prerequisites
- Docker & Docker Compose installed

### Steps
1. Clone the repository
2. Run:
   ```bash
   docker-compose up --build
3.Access:
Frontend: http://localhost:3000
Backend: http://localhost:8000
API Docs: http://localhost:8000/docs

### Tech Stack
Frontend
React + TypeScript + Vite
Tailwind CSS
Backend
FastAPI
SQLAlchemy
Database
PostgreSQL
DevOps
Docker
Docker Compose
### Future Enhancements
User authentication and roles
Multi-tenant support
AI-based decision reasoning
CI/CD pipeline integration
Monitoring and logging
