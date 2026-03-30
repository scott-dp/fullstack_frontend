# CheckMate Frontend

CheckMate is a full-stack application developed with Vue.js and Spring Boot. The project was developed as the final assessment in the course IDATT2105 Fullstack-Applikasjonsutvikling for the spring semester of 2026 at NTNU.

The frontend in this repository is the Vue.js client for the platform. It provides the user interface for food-safety and alcohol-compliance workflows across restaurants, bars, and cafes, and communicates with the backend API in the companion repository: [fullstack_backend](https://github.com/scott-dp/fullstack_backend).

## What The Project Does

CheckMate is designed to help hospitality businesses structure and document internal control work across two main domains:

- `IK-Mat` for food-safety and hygiene follow-up
- `IK-Alkohol` for alcohol-related compliance and responsible service

The application supports day-to-day operational work as well as management and oversight. Core functionality includes:

- Secure login: users can securely register, log in, verify their email, sign in with a one-time code, and update account details.
- Internationalization: the application supports English, Norwegian, Spanish, Nepali, and Urdu.
- Role-based access: staff, managers, admins, and a global superadmin see different parts of the system based on their responsibilities.
- Routines and checklists: organizations can manage routines, complete checklists, and review checklist history.
- Temperature logging: staff can record temperature readings and managers can follow up on alerts and trends.
- Deviations and alcohol incidents: incidents can be reported, assigned, commented on, and followed through to resolution.
- Suppliers, deliveries, and traceability: the system supports supplier registration, delivery tracking, and traceability searches.
- Dishes, ingredients, and allergen management: ingredients can be connected to allergens, dishes can derive allergen information, and allergen sheets can be generated.
- Training: managers can maintain training templates, assign training to employees, and employees can follow their own training progress.
- Alcohol license follow-up: the frontend includes dedicated views for alcohol license information and conditions.
- Admin functionality: organization admins can manage users, invites, and administrative oversight inside their own organization.
- Superadmin functionality: a superadmin can create organizations, invite organization admins, and manage the platform at a global level.

## Repository Link

- Backend repository: [fullstack_backend](https://github.com/scott-dp/fullstack_backend)

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Vue I18n
- Vitest and Testing Library
- Cypress

## Local Development

### Prerequisites

- Node.js 22 or newer
- npm
- A running backend API from [fullstack_backend](https://github.com/scott-dp/fullstack_backend)

### Environment Variables

Create a local environment file if needed:

```env
VITE_API_BASE_URL=http://localhost:8080
```

An example is included in [.env.example](C:\Users\scott\Documents\data\6.semester\fullstack\frivillig\frontend\fullstack\.env.example).

### Install Dependencies

```bash
npm ci
```

### Run The Frontend

```bash
npm run dev
```

The development server runs on `http://localhost:5173` by default.

### Build The Frontend

```bash
npm run build
```

### Preview The Production Build

```bash
npm run preview
```

## Testing

### Unit Tests

```bash
npm run test
```

### Unit Tests With Coverage

```bash
npm run test:coverage
```

### End-To-End Tests

```bash
npm run cy:run
```

For interactive Cypress:

```bash
npm run cy:open
```

## Deployment To The VM

The production frontend is deployed to a VM through GitHub Actions CD and a self-hosted runner.

### Deployment Flow

1. A push to the `master` branch triggers [.github/workflows/cd.yml](C:\Users\scott\Documents\data\6.semester\fullstack\frivillig\frontend\fullstack\.github\workflows\cd.yml).
2. The workflow runs on a GitHub self-hosted runner located on the VM.
3. The runner calls `/home/student/deployment/deploy.sh`.
4. On the VM, the frontend is built and deployed as static files served by Nginx.

### CI

Pull requests trigger [.github/workflows/ci.yml](C:\Users\scott\Documents\data\6.semester\fullstack\frivillig\frontend\fullstack\.github\workflows\ci.yml), which:

- installs dependencies
- runs unit tests with coverage
- builds the frontend
- runs Cypress end-to-end tests
- uploads coverage and Cypress artifacts

### Production Serving

The production frontend is served through Nginx on the VM. In the project deployment setup, Nginx is responsible for serving the built Vue application and routing frontend traffic in production.

## Pages And Modules

The frontend contains views for:

- landing page and authentication
- dashboard and notifications
- routines, checklists, and checklist history
- temperature logs
- deviations and alcohol incidents
- suppliers, deliveries, and traceability search
- dishes, ingredients, and allergen sheet
- training templates, training assignment, and my training
- alcohol license views
- organization admin views
- superadmin dashboard

## Database Context

The frontend does not connect directly to the database, but it is built to work with the backend database setup:

- MySQL in production
- H2 in-memory database in development
- H2 in-memory database in tests

Those details are configured in the backend repository and documented in the backend README.
