# PulseDesk

A multi-tenant support desk SaaS application with strict organization data isolation.

## 🚀 Tech Stack

### Backend
- **Node.js** + **Express** - REST API server
- **SQLite** (via better-sqlite3) - Database
- **Knex.js** - Query builder & migrations
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Jest** + **Supertest** - Testing

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation

## 📋 Features

### Multi-Tenancy
- Strict organization data isolation
- Organization-scoped queries (tickets, users)
- Slug-based organization URLs

### Authentication & Authorization
- User registration with organization code
- JWT-based authentication
- Role-based access: Admin, Agent, Customer

### Ticket Management
- Create, read, update, delete tickets
- Ticket status: open, in_progress, resolved, closed
- Priority levels: low, medium, high, urgent
- Tags for categorization
- Threaded conversations (replies)
- Internal notes for agents

### Filtering & Search
- Filter by status, priority, assignee
- Full-text search on subject/description

## 🛠️ Setup

### Backend
```bash
cd backend
npm install
npm run migrate
npm run seed
npm start  # or npm run dev for hot reload
```

The API will run on http://localhost:3000

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on http://localhost:5173

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get current user info

### Tickets
- `GET /api/organizations/:orgSlug/tickets` - List tickets with filters
- `GET /api/organizations/:orgSlug/tickets/:id` - Get ticket details
- `POST /api/organizations/:orgSlug/tickets` - Create ticket
- `PUT /api/organizations/:orgSlug/tickets/:id` - Update ticket
- `DELETE /api/organizations/:orgSlug/tickets/:id` - Delete ticket
- `POST /api/organizations/:orgSlug/tickets/:id/replies` - Add reply

### Query Parameters (for tickets list)
- `status` - Filter by status (open, in_progress, resolved, closed)
- `priority` - Filter by priority (low, medium, high, urgent)
- `assignee_id` - Filter by assignee
- `search` - Search in subject and description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

## 🧪 Testing

```bash
cd backend
npm test
```

## 🚢 CI/CD

GitHub Actions workflow runs on every push to main/develop:
- Backend tests with Node 18 & 20
- Frontend build verification
- Multitenancy tests

## 📦 Demo Data

The seed script creates:
- 1 organization (slug: techcorp)
- 1 admin user
- 2 agents
- 2 customers
- 12 sample tickets across different statuses and priorities

**Demo credentials:**
- Email: `admin@techcorp.com`
- Password: `password123`

## 🔒 Security

- Passwords hashed with bcryptjs
- JWT tokens for authentication
- Organization-scoped queries prevent data leakage
- Input validation with express-validator

## 📝 Project Structure

```
forge2-Tanya/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   ├── db.js          # Knex config
│   │   │   ├── migrate.js     # Migrations
│   │   │   └── seed.js        # Demo data
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT auth
│   │   ├── routes/
│   │   │   ├── auth.js        # Auth endpoints
│   │   │   └── tickets.js     # Ticket endpoints
│   │   └── index.js           # Express app
│   ├── __tests__/
│   │   ├── auth.test.js
│   │   ├── multitenancy.test.js
│   │   └── tickets.test.js
│   ├── package.json
│   └── pulsedesk.db           # SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── App.jsx
│   └── package.json
└── .github/
    └── workflows/
        └── ci.yml
```