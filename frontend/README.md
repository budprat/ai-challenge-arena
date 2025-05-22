# EliteBuilders Frontend

A modern React TypeScript application for the EliteBuilders AI Challenges platform.

## Architecture

The frontend application follows a modular architecture with clear separation of concerns:

- **React + TypeScript**: Type-safe component development
- **Redux Toolkit**: State management with structured organization
- **Material UI**: Component library for consistent design
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication

## Project Structure

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable UI components
│   └── layout/      # Layout components (Header, Sidebar, etc.)
├── hooks/           # Custom React hooks
├── layouts/         # Page layout containers
├── pages/           # Page components
├── services/        # API service modules
├── store/           # Redux store configuration
│   └── slices/      # Redux slices for state management
├── types/           # TypeScript declarations
└── utils/           # Utility functions
```

## State Management

The application uses Redux Toolkit with a sliced state approach:

- **auth**: User authentication state and actions
- **challenges**: Challenge data and operations
- **submissions**: User submissions and evaluation
- **notifications**: User notifications
- **ui**: UI state (dark mode, drawer, etc.)

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Type Declarations

The application includes several TypeScript declaration files to enhance type safety:

- `global.d.ts`: Common application types
- `axios.d.ts`: Enhanced Axios types for API calls
- `redux.d.ts`: Redux state and action types
- `react-redux.d.ts`: Type enhancements for react-redux
- `material-ui.d.ts`: Material UI type extensions

## API Integration

Services are organized by domain and use Axios for API communication:

- `authService`: Authentication operations
- `challengeService`: Challenge management
- `submissionService`: Submission handling
- `notificationService`: Notification management

## Styling

The application uses Material UI's styling system with a custom theme defined in `theme.ts`. The theme includes:

- Color palette with primary and secondary colors
- Typography scale and font families
- Component variants and overrides
- Responsive breakpoints

## Contributing

1. Follow the existing code style and organization
2. Ensure type safety with proper TypeScript annotations
3. Implement unit tests for all new features
4. Update documentation for significant changes

## License

MIT
