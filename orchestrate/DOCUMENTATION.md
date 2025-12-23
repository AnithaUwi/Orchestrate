# Orchestrate - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Database Schema](#database-schema)
5. [Project Structure](#project-structure)
6. [API Endpoints](#api-endpoints)
7. [Frontend Features](#frontend-features)
8. [Setup & Installation](#setup--installation)
9. [Running the Application](#running-the-application)
10. [Development Guide](#development-guide)

---

## Project Overview

**Orchestrate** is a full-stack web application designed for project and resource management. It provides a comprehensive platform for:

- **Project Management**: Create, manage, and track projects with team members
- **Task Management**: Assign tasks, track progress, and manage workloads
- **Boardroom Booking**: Reserve boardrooms/meeting spaces with availability tracking
- **Team Collaboration**: Manage users, roles, and project memberships
- **Workload Monitoring**: Track team member availability and task distribution

### Key Features
- User authentication and role-based access control
- Project lifecycle management (create, update, archive)
- Task assignment with status and priority tracking
- Real-time boardroom booking system
- User management with multiple roles
- Workload analysis and visualization

---

## Architecture

Orchestrate follows a **Client-Server Architecture** with clear separation of concerns:

```
┌─────────────────────────┐
│    React Frontend       │  (src/)
│  - TanStack Router      │
│  - React Query          │
│  - Tailwind CSS         │
└────────────┬────────────┘
             │ HTTP/REST
┌────────────▼────────────┐
│   Express Backend       │  (server/)
│  - Route Handlers       │
│  - Controllers          │
│  - Middleware           │
└────────────┬────────────┘
             │ Prisma ORM
┌────────────▼────────────┐
│    SQLite Database      │
│    (Prisma Client)      │
└─────────────────────────┘
```

### Layers

1. **Frontend Layer** (`src/`)
   - React components and pages
   - Routing with TanStack Router
   - API client calls with Axios
   - State management with React Query

2. **Backend Layer** (`server/`)
   - Express.js API server
   - Route definitions
   - Business logic in controllers
   - Middleware for authentication and CORS

3. **Data Layer** (`prisma/`)
   - SQLite database with Prisma ORM
   - Schema definitions
   - Data models and relationships

---

## Tech Stack

### Frontend
- **React** 19.2.3 - UI library
- **TanStack Router** 1.142.8 - Type-safe routing
- **TanStack React Query** 5.90.12 - Server state management
- **Tailwind CSS** 3.4.19 - Utility-first styling
- **React Hook Form** 7.69.0 - Form management
- **Zod** 4.2.1 - Schema validation
- **Recharts** 3.6.0 - Data visualization
- **Lucide React** 0.562.0 - Icon library
- **Axios** 1.13.2 - HTTP client

### Backend
- **Express.js** 5.2.1 - Web framework
- **Node.js** with TypeScript - Runtime & type safety
- **Prisma** 5.10.0 - ORM
- **SQLite** - Database
- **JWT** (jsonwebtoken 9.0.3) - Authentication tokens
- **bcryptjs** 3.0.3 - Password hashing
- **CORS** 2.8.5 - Cross-origin support

### Tools & Configuration
- **TypeScript** 5.9.3 - Type safety
- **Tailwind CSS** - Styling framework
- **PostCSS** - CSS processing
- **Nodemon** - Development auto-reload
- **React Scripts** - Create React App tooling

---

## Database Schema

### User Model
Represents application users with role-based access control.

```typescript
User {
  id: String (UUID)          // Primary key
  email: String (unique)     // User email
  password: String           // Hashed password
  name: String               // Full name
  role: String               // ADMIN, PROJECT_MANAGER, DEVELOPER, STAFF
  status: String             // ACTIVE, DISABLED
  createdAt: DateTime        // Account creation time
  updatedAt: DateTime        // Last update time
  
  // Relations
  tasksAssigned: Task[]              // Tasks assigned to user
  bookings: Booking[]                // Room bookings by user
  projectMemberships: ProjectMember[]// Projects user is member of
  projectsManaged: Project[]         // Projects user manages
  tasksCreated: Task[]               // Tasks created by user
}
```

### Project Model
Represents projects managed by project managers.

```typescript
Project {
  id: String (UUID)          // Primary key
  name: String               // Project name
  description: String        // Project description (optional)
  status: String             // ACTIVE, ARCHIVED
  pmId: String (FK)          // Project Manager ID
  deadline: DateTime         // Project deadline (optional)
  createdAt: DateTime        // Project creation time
  updatedAt: DateTime        // Last update time
  
  // Relations
  pm: User                   // Project Manager
  tasks: Task[]              // Project tasks
  members: ProjectMember[]   // Project team members
}
```

### ProjectMember Model
Join table for User-Project relationships.

```typescript
ProjectMember {
  id: String (UUID)          // Primary key
  projectId: String (FK)     // Project ID
  userId: String (FK)        // User ID
  role: String               // Optional role override within project
  joinedAt: DateTime         // When user joined project
  
  // Relations
  project: Project           // Associated project
  user: User                 // Associated user
  
  // Constraints
  @@unique([projectId, userId]) // One membership per user per project
}
```

### Task Model
Represents tasks within projects.

```typescript
Task {
  id: String (UUID)          // Primary key
  title: String              // Task title
  description: String        // Task description (optional)
  status: String             // TODO, IN_PROGRESS, IN_REVIEW, DONE
  priority: String           // LOW, MEDIUM, HIGH, CRITICAL
  estimatedHours: Float      // Estimated effort (optional)
  actualHours: Float         // Actual effort (optional)
  loggedHours: Float         // Hours logged for the task (optional)
  dueDate: DateTime          // Task due date (optional)
  createdById: String        // User who created the task
  projectId: String (FK)     // Associated project
  assignedToId: String (FK)  // Assigned user (optional)
  createdAt: DateTime        // Task creation time
  updatedAt: DateTime        // Last update time
  
  // Relations
  project: Project           // Associated project
  assignedTo: User           // User task is assigned to
  createdBy: User            // User who created task
}
```

### Room Model
Represents boardrooms/meeting spaces.

```typescript
Room {
  id: String (UUID)          // Primary key
  name: String               // Room name
  capacity: Int              // Room capacity (people)
  equipment: String          // Available equipment (optional)
  location: String           // Room location (optional)
  
  // Relations
  bookings: Booking[]        // Room bookings
  availability: Availability[]// Room availability slots
}
```

### Booking Model
Represents room bookings/reservations.

```typescript
Booking {
  id: String (UUID)          // Primary key
  roomId: String (FK)        // Room ID
  userId: String (FK)        // Booking user (optional for external bookings)
  guestName: String          // External guest name (optional)
  guestEmail: String         // External guest email (optional)
  isExternal: Boolean        // Is external booking
  description: String        // Booking description (optional)
  attendees: String          // Attendee information (optional)
  status: String             // confirmed, pending, cancelled
  startTime: DateTime        // Booking start time
  endTime: DateTime          // Booking end time
  title: String              // Booking title
  createdAt: DateTime        // Booking creation time
  updatedAt: DateTime        // Last update time
  
  // Relations
  room: Room                 // Associated room
  user: User                 // Booking user
}
```

### Availability Model
Tracks room availability for scheduling.

```typescript
Availability {
  id: String (UUID)          // Primary key
  roomId: String (FK)        // Room ID
  date: DateTime             // Date of availability
  hourSlot: String           // Time slot (e.g., "09:00-10:00")
  isAvailable: Boolean       // Slot availability status
  
  // Relations
  room: Room                 // Associated room
  
  // Indexes
  @@index([roomId, date, hourSlot])
}
```

---

## Project Structure

```
orchestrate/
├── src/                          # React Frontend
│   ├── components/               # Reusable components
│   │   ├── TaskForm.tsx          # Task creation/editing form
│   │   └── layout/
│   │       └── DashboardLayout.tsx # Dashboard wrapper
│   ├── pages/                    # Full page components
│   │   ├── Login.tsx             # Login page
│   │   ├── dashboard/
│   │   │   ├── Overview.tsx      # Dashboard home
│   │   │   ├── Projects.tsx      # Project management
│   │   │   ├── Tasks.tsx         # Task management
│   │   │   ├── Boardrooms.tsx    # Room booking
│   │   │   ├── AdminUsers.tsx    # User administration
│   │   │   └── Workload.tsx      # Team workload analysis
│   │   └── public/
│   │       └── BoardroomTerminal.tsx # Public boardroom display
│   ├── routes/                   # TanStack Router routes
│   │   ├── __root.tsx            # Root route wrapper
│   │   ├── index.tsx             # Home route
│   │   ├── login.tsx             # Login route
│   │   ├── dashboard.tsx         # Dashboard layout route
│   │   ├── dashboard.index.tsx   # Dashboard home
│   │   ├── dashboard.projects.tsx
│   │   ├── dashboard.tasks.tsx
│   │   ├── dashboard.boardrooms.tsx
│   │   ├── dashboard.users.tsx
│   │   ├── dashboard.workload.tsx
│   │   └── terminal.tsx          # Terminal route
│   ├── api/                      # API client configuration
│   │   ├── api.client.ts         # Protected API client
│   │   └── public.client.ts      # Public API client
│   ├── generated/                # Generated Prisma types
│   ├── App.tsx                   # App routing setup
│   ├── App.css                   # Global styles
│   ├── index.tsx                 # React entry point
│   ├── index.css                 # Global CSS
│   └── setupTests.ts             # Test configuration
│
├── server/                       # Express Backend
│   ├── controllers/              # Route handlers
│   │   ├── auth.controller.ts    # Authentication logic
│   │   ├── projects.controller.ts
│   │   ├── tasks.controller.ts
│   │   ├── bookings.controller.ts
│   │   └── users.controller.ts
│   ├── routes/                   # Express routes
│   │   ├── auth.routes.ts        # Auth endpoints
│   │   ├── projects.routes.ts
│   │   ├── tasks.routes.ts
│   │   ├── bookings.routes.ts
│   │   └── users.routes.ts
│   ├── middleware/               # Express middleware
│   │   └── auth.middleware.ts    # JWT authentication
│   ├── generated/                # Generated Prisma types
│   ├── index.ts                  # Express app entry point
│   ├── seed.ts                   # Database seeding script
│   ├── seed-admin.ts             # Admin user seeding
│   └── tsconfig.json             # TypeScript config for server
│
├── prisma/                       # Database
│   └── schema.prisma             # Prisma schema definition
│
├── public/                       # Static files
│   ├── index.html                # Main HTML file
│   ├── manifest.json             # PWA manifest
│   └── robots.txt                # SEO robots file
│
├── build/                        # Production build (generated)
│   ├── index.html
│   ├── static/
│   │   ├── css/                  # Minified CSS
│   │   └── js/                   # Minified JavaScript
│   └── manifest.json
│
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS config
├── postcss.config.js             # PostCSS configuration
├── README.md                     # Original project README
└── DOCUMENTATION.md              # This file
```

---

## API Endpoints

### Authentication Routes (`/api/auth`)
- **POST** `/api/auth/register` - Register new user
  - Body: `{ name, email, password, role? }`
  - Returns: User object (without password)
  
- **POST** `/api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: JWT token and user data

### Projects Routes (`/api/projects`)
- **GET** `/api/projects` - List all projects (with filters)
- **POST** `/api/projects` - Create new project
- **GET** `/api/projects/:id` - Get project details
- **PUT** `/api/projects/:id` - Update project
- **DELETE** `/api/projects/:id` - Delete/archive project
- **POST** `/api/projects/:id/members` - Add member to project
- **DELETE** `/api/projects/:id/members/:userId` - Remove member from project

### Tasks Routes (`/api/tasks`)
- **GET** `/api/tasks` - List all tasks (with filters)
- **POST** `/api/tasks` - Create new task
- **GET** `/api/tasks/:id` - Get task details
- **PUT** `/api/tasks/:id` - Update task
- **DELETE** `/api/tasks/:id` - Delete task
- **PUT** `/api/tasks/:id/status` - Update task status
- **PUT** `/api/tasks/:id/assign` - Assign task to user

### Bookings Routes (`/api/bookings`)
- **GET** `/api/bookings` - List all bookings
- **POST** `/api/bookings` - Create new booking
- **GET** `/api/bookings/:id` - Get booking details
- **PUT** `/api/bookings/:id` - Update booking
- **DELETE** `/api/bookings/:id` - Cancel booking
- **GET** `/api/bookings/room/:roomId/availability` - Get room availability

### Users Routes (`/api/users`)
- **GET** `/api/users` - List all users
- **GET** `/api/users/:id` - Get user details
- **PUT** `/api/users/:id` - Update user
- **DELETE** `/api/users/:id` - Disable/delete user
- **GET** `/api/users/:id/workload` - Get user workload/assignments

---

## Frontend Features

### Authentication
- User registration with email and password
- Secure login with JWT token storage
- Token-based authentication for protected routes
- Role-based access control

### Dashboard Pages

#### Overview
- Quick statistics and summaries
- Recent activities
- Key metrics and KPIs

#### Projects
- Create and manage projects
- Add/remove team members
- Set project deadlines
- Track project status (ACTIVE/ARCHIVED)
- View project tasks and members

#### Tasks
- Create tasks with descriptions
- Assign tasks to team members
- Set task priority (LOW, MEDIUM, HIGH, CRITICAL)
- Track task status (TODO, IN_PROGRESS, IN_REVIEW, DONE)
- Log hours and track time
- View task dependencies

#### Boardrooms
- Browse available meeting rooms
- Check room capacity and equipment
- Make bookings with date/time selection
- Support internal and external guest bookings
- Cancel or modify bookings
- Real-time availability visualization

#### Admin Users
- View all users in the system
- Create and manage user accounts
- Assign roles and permissions
- Enable/disable user accounts
- Monitor user activity

#### Workload
- Visualize team member workload
- See assigned tasks per person
- Track estimated vs actual hours
- Identify over/under-allocated team members
- Generate workload reports

---

## Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- SQLite (included with Prisma)

### Installation Steps

1. **Clone/Navigate to project directory**
   ```bash
   cd orchestrate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-secret-key-here"
   PORT=4000
   NODE_ENV=development
   ```

4. **Initialize the database**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   npm run seed-admin
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database file path | `file:./dev.db` |
| `JWT_SECRET` | Secret key for JWT signing | `supersecretkey` |
| `PORT` | Backend server port | `4000` |
| `NODE_ENV` | Environment (development/production) | `development` |

---

## Running the Application

### Development Mode
Start both frontend and backend concurrently:
```bash
npm run dev
```

This will:
- Start React dev server at `http://localhost:3000`
- Start Express backend at `http://localhost:4000`
- Enable hot-reloading for both client and server

### Frontend Only
```bash
npm start
```

### Backend Only
```bash
npm run server
```

### Production Build
```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Testing
```bash
npm test
```

---

## Development Guide

### Adding a New Feature

#### 1. Define Database Schema (if needed)
- Edit `prisma/schema.prisma`
- Create migration: `npx prisma migrate dev --name feature_name`

#### 2. Create Backend Endpoint
- Define route in `server/routes/feature.routes.ts`
- Implement logic in `server/controllers/feature.controller.ts`
- Add route to `server/index.ts`

#### 3. Add Frontend Components
- Create component/page in `src/pages/` or `src/components/`
- Define route in `src/routes/feature.tsx`
- Add route to route tree in `src/App.tsx`

#### 4. Create API Client
- Add methods to `src/api/api.client.ts`
- Use with React Query hooks

### Code Organization Principles
- **Single Responsibility**: Each file has one primary purpose
- **Type Safety**: Always use TypeScript types
- **Error Handling**: Consistent error responses from API
- **Validation**: Use Zod for schema validation
- **State Management**: React Query for server state, local state for UI

### Database Migrations
```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

### Generate Prisma Client
```bash
npx prisma generate
```

### Common Development Tasks

**View/Manage Database**
```bash
npx prisma studio
```

**Check API health**
```bash
curl http://localhost:4000/
```

**View logs**
- Frontend: Check browser console
- Backend: Check terminal running `npm run server`

---

## Security Considerations

1. **Authentication**: JWT tokens with configurable expiry
2. **Password Security**: Bcrypt hashing with salt rounds
3. **CORS**: Configured to allow frontend origin
4. **Environment Variables**: Sensitive data in `.env` file
5. **Input Validation**: Zod schemas for API requests
6. **Database**: Prisma ORM prevents SQL injection

### Best Practices
- Always validate user input
- Use HTTPS in production
- Rotate JWT secrets regularly
- Implement rate limiting
- Use environment variables for sensitive data
- Keep dependencies updated

---

## Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` in `.env`
- Ensure SQLite file path is writable
- Run `npx prisma migrate reset` to reinitialize

### Port Already in Use
- Change `PORT` in `.env`
- Or kill existing process: `lsof -ti:4000 | xargs kill -9`

### CORS Errors
- Check backend CORS configuration in `server/index.ts`
- Verify frontend URL matches CORS whitelist

### Module Not Found Errors
- Run `npm install` to install dependencies
- Delete `node_modules` and reinstall if issues persist

---

## Future Enhancements

- [ ] Email notifications for bookings and task assignments
- [ ] Real-time updates with WebSockets
- [ ] Advanced reporting and analytics
- [ ] Calendar integration
- [ ] File attachments for tasks
- [ ] Team chat/messaging
- [ ] Mobile app
- [ ] Dark mode
- [ ] Multi-language support
- [ ] API rate limiting and throttling

---

## Support & Contributing

For issues or feature requests, please check existing issues or create a new one with:
- Clear description of the problem/feature
- Steps to reproduce (if bug)
- Expected vs actual behavior
- Screenshots/logs if applicable

---

**Last Updated**: December 2025
**Version**: 0.1.0
