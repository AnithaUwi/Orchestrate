# Orchestrate 

A comprehensive full-stack project and resource management platform built with React and Express.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

##  Quick Links

-  **[Full Documentation](./DOCUMENTATION.md)** - Comprehensive guide to architecture, database schema, and API
-  **[Quick Start](#quick-start)** - Get up and running in 5 minutes
-  **[Tech Stack](#tech-stack)** - Technologies and frameworks used
-  **[Features](#features)** - What you can do with Orchestrate

---

##  Features

###  **Authentication & Authorization**
- User registration and secure login
- JWT-based authentication
- Role-based access control (ADMIN, PROJECT_MANAGER, DEVELOPER, STAFF)
- Password hashing with bcryptjs

###  **Project Management**
- Create and manage projects with deadlines
- Assign project managers
- Add/remove team members
- Track project status (Active/Archived)
- View project tasks and team composition

###  **Task Management**
- Create tasks with descriptions and priorities
- Assign tasks to team members
- Track task status (TODO, IN_PROGRESS, IN_REVIEW, DONE)
- Set priority levels (LOW, MEDIUM, HIGH, CRITICAL)
- Log hours and track time estimates
- Task filtering and sorting

###  **Boardroom Booking**
- Browse available meeting rooms
- Check room capacity and equipment
- Real-time availability checking
- Book rooms with date/time selection
- Support for internal users and external guests
- Cancel or modify existing bookings

###  **Team Management**
- Centralized user administration
- Create and manage user accounts
- Monitor team member activity
- Manage user roles and permissions

###  **Workload Analysis**
- Visualize team member workload
- View task distribution across team
- Track estimated vs. actual hours
- Identify over-allocated team members
- Generate workload reports

---

##  Quick Start

### Prerequisites
- **Node.js** v16 or higher
- **npm** or **yarn**
- Git

### Installation (5 minutes)

1. **Clone and navigate to project**
   ```bash
   cd orchestrate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create `.env` file in root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-key-change-in-production"
   PORT=4000
   NODE_ENV=development
   ```

4. **Initialize database**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start application**
   ```bash
   npm run dev
   ```

6. **Access the app**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - Database Studio: `npx prisma studio`

---

##  Tech Stack

### Frontend
- **React** 19.2.3 - Modern UI library
- **TanStack Router** - Type-safe routing
- **TanStack React Query** - Server state management
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Express.js** 5.2.1 - Web framework
- **Node.js** with TypeScript - Server runtime
- **Prisma** 5.10.0 - Modern ORM
- **SQLite** - Lightweight database
- **JWT** - Token-based authentication
- **bcryptjs** - Secure password hashing

### Development Tools
- **TypeScript** - Type safety
- **Nodemon** - Auto-reload during development
- **Concurrently** - Run multiple scripts simultaneously

---

##  Project Structure

```
orchestrate/
├── src/                    # React Frontend
│   ├── pages/             # Page components (Login, Dashboard, etc.)
│   ├── components/        # Reusable React components
│   ├── routes/            # TanStack Router definitions
│   ├── api/               # API client configuration
│   └── generated/         # Prisma generated types
├── server/                # Express Backend
│   ├── controllers/       # Business logic
│   ├── routes/            # API route definitions
│   ├── middleware/        # Express middleware
│   └── generated/         # Prisma generated types
├── prisma/                # Database
│   └── schema.prisma      # Data model definitions
├── public/                # Static assets
├── build/                 # Production build (generated)
├── DOCUMENTATION.md       # Full technical documentation
└── package.json           # Dependencies and scripts
```

For detailed structure breakdown, see [DOCUMENTATION.md](./DOCUMENTATION.md#project-structure)

---

##  Core Pages

| Page | Purpose | URL |
|------|---------|-----|
| Login | User authentication | `/login` |
| Dashboard | Overview and statistics | `/dashboard` |
| Projects | Project management | `/dashboard/projects` |
| Tasks | Task management | `/dashboard/tasks` |
| Boardrooms | Room booking system | `/dashboard/boardrooms` |
| Users | User administration | `/dashboard/users` |
| Workload | Team workload analysis | `/dashboard/workload` |
| Terminal | Public boardroom display | `/terminal` |

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete/archive project
- `POST /api/projects/:id/members` - Add member
- `DELETE /api/projects/:id/members/:userId` - Remove member

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/status` - Update status

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Disable user

For complete API documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md#api-endpoints)

---

##  Available Scripts

```bash
# Development
npm run dev          # Start frontend & backend concurrently
npm start            # Start React frontend only
npm run server       # Start Express backend only

# Production
npm run build        # Build for production
npm test             # Run tests

# Database
npx prisma migrate dev --name <name>  # Create migration
npx prisma studio                     # Open database UI
npx prisma generate                   # Generate Prisma client
```

---

##  Database

Orchestrate uses **SQLite** with **Prisma ORM** for type-safe database operations.

### Models
- **User** - Application users with roles
- **Project** - Projects managed by project managers
- **ProjectMember** - User-Project relationships
- **Task** - Tasks within projects
- **Room** - Boardrooms and meeting spaces
- **Booking** - Room reservations
- **Availability** - Room availability slots

For detailed schema documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md#database-schema)

---

##  Authentication & Security

### User Roles
- **ADMIN** - Full system access
- **PROJECT_MANAGER** - Manage projects and team
- **DEVELOPER** - Create/manage tasks
- **STAFF** - View-only access

### Security Features
- JWT token-based authentication
- Bcrypt password hashing
- CORS protection
- Zod input validation
- Environment variable protection

### Best Practices
- Always use HTTPS in production
- Rotate JWT secrets regularly
- Keep dependencies updated
- Never commit `.env` files

---

##  Development Workflow

### Adding a New Feature

1. **Database Schema** (if needed)
   ```bash
   # Edit prisma/schema.prisma
   npx prisma migrate dev --name feature_name
   ```

2. **Backend Endpoint**
   - Create route in `server/routes/`
   - Implement logic in `server/controllers/`
   - Add to `server/index.ts`

3. **Frontend Components**
   - Create component/page in `src/pages/`
   - Add route in `src/routes/`
   - Implement in route tree (`src/App.tsx`)

4. **API Client**
   - Add methods to `src/api/api.client.ts`
   - Use React Query hooks

---

##  Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection error | Check `DATABASE_URL` in `.env` and ensure path is writable |
| Port already in use | Change `PORT` in `.env` or kill process using the port |
| CORS errors | Verify frontend URL in backend CORS config |
| Module not found | Run `npm install` and delete `node_modules` if persistent |
| Build fails | Check TypeScript errors with `npx tsc --noEmit` |

For more solutions, see [DOCUMENTATION.md](./DOCUMENTATION.md#troubleshooting)

---

##  Full Documentation

This README provides a quick overview. For comprehensive documentation including:
- Detailed architecture explanation
- Complete database schema
- All API endpoints with examples
- Security considerations
- Deployment guide
- Future enhancement roadmap

 See **[DOCUMENTATION.md](./DOCUMENTATION.md)**

---

##  Deployment

### Environment Setup
```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="generate-a-secure-random-string"
NODE_ENV="production"
PORT=4000
```

### Build & Run
```bash
npm run build
npm start
```

For detailed deployment instructions, see DOCUMENTATION.md

---

##  Project Status

**Current Version**: 0.1.0  
**Status**: Active Development  
**Last Updated**: December 2025

### Upcoming Features
- Email notifications
- Real-time updates with WebSockets
- Advanced reporting and analytics
- Calendar integration
- File attachments
- Team chat/messaging
- Mobile app
- Dark mode

---

##  Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Code Standards
- Use TypeScript for type safety
- Follow existing code style
- Add tests for new features
- Update documentation as needed

---

##  License

This project is licensed under the MIT License - see the LICENSE file for details.

---

##  Support

-  Check [DOCUMENTATION.md](./DOCUMENTATION.md) for comprehensive guide
-  Search existing issues
-  Create a new issue with:
  - Clear description
  - Steps to reproduce
  - Expected behavior
  - Screenshots/logs if applicable

---

##  Acknowledgments

Built with modern technologies and best practices:
- React team for the amazing UI library
- TanStack for routing and query management
- Prisma for type-safe database access
- Tailwind CSS for styling

---

**Made with  for better project management**

Get started now: `npm install && npm run dev`
