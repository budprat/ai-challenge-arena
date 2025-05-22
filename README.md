# EliteBuilders: AI Builders Competition Platform

EliteBuilders is a web-based competitive platform where solo builders can craft and submit AI-powered MVPs against company-authored or sponsored challenges. The platform includes automated LLM-driven scoring, human judge reviews, and hybrid leaderboards to surface top talent.

## Project Structure

The project is organized into two main components:

- **Frontend**: React application with Redux for state management and Material UI for components
- **Backend**: FastAPI application with SQLAlchemy for database operations

## Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- PostgreSQL database

## Getting Started

Follow these steps to set up the project:

### 1. Clone the repository

```bash
git clone https://github.com/your-username/elitebuilders.git
cd elitebuilders
```

### 2. Install dependencies

```bash
# Install frontend dependencies
npm run install:frontend

# Install backend dependencies
npm run install:backend
```

### 3. Set up environment variables

Create a `.env` file in the `backend` directory based on the provided `.env.example`:

```bash
cp backend/.env.example backend/.env
```

Update the environment variables with your configuration.

### 4. Run development servers

```bash
# Run both frontend and backend together
npm run dev

# Or run them separately
npm run dev:frontend
npm run dev:backend
```

The frontend will be available at http://localhost:3000 and the backend API at http://localhost:8000.

## Features

### Solo Challenges Catalogue

- Filterable list of company-authored & sponsored problems
- Includes deadlines, data packs, and evaluation rubrics
- Searchable by topic, difficulty, and sponsor

### User Onboarding

- OAuth sign-in with GitHub, Google, etc.
- Connect GitHub/portfolio/CV
- Get suggested first challenge based on skills

### Submission Pipeline

- Deliverable uploader (repo link, deck, video)
- Sandboxed automated tests
- LLM rubric evaluation
- Provisional score generation

### Hybrid Leaderboards

- Real-time event boards
- Season-based cumulative 'Career Score'
- Categorized by challenge type and skill area

### Badging & Recognition

- Auto-awarded badges (Top-10%, Category Winner, Sponsor Favorite)
- Achievement system with skill-based tiers
- Public profile showcasing earned recognition

### Sponsor Dashboard

- Create/manage challenges
- Fund prizes
- View ranked submissions
- Download candidate packets

### Notification System

- Email alerts for submission status
- Score updates
- Badge achievements

## Development

### Frontend Technologies

- React 17
- Redux with Redux Toolkit
- Material UI
- TypeScript
- Webpack
- Jest (for testing)

### Backend Technologies

- FastAPI
- SQLAlchemy
- PostgreSQL
- OpenAI (for evaluations)
- Alembic (for migrations)

## Building for Production

```bash
# Build the frontend
npm run build:frontend

# The compiled output will be in the frontend/dist directory
```

## License

MIT
