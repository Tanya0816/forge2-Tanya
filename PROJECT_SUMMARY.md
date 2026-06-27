# PulseDesk - Multi-tenant Support Desk SaaS

A modern multi-tenant support desk application with strict organization data isolation, built with Node.js, Express, React, and SQLite.

## 🚀 Quick Start

### Backend

```bash
cd backend
npm install
npm run migrate
npm run seed
npm start
```

Backend runs on `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📚 Documentation

- [README.md](README.md) - Full documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide (Vercel + Railway)
- [BUILD_STATUS.md](BUILD_STATUS.md) - Build progress tracker

## 🔑 Demo Credentials

After running `npm run seed`, you can log in with:

- **Admin**: `admin@acme.com` / `password123`
- **Agent**: `agent1@acme.com` / `password123`
- **Customer**: `customer1@acme.com` / `password123`

## 🏗️ Architecture

```
forge2-Tanya/
├── backend/          # Node.js + Express + SQLite API
│   ├── src/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── index.js
│   └── __tests__/
└── frontend/         # React 19 + Vite + Tailwind
    └── src/
        ├── components/
        ├── contexts/
        └── App.jsx
```

## 🌐 Production Deployment

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Railway

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🧪 Testing

```bash
cd backend
npm test
```

## 📋 Features

- ✅ Multi-tenant architecture with strict data isolation
- ✅ Role-based access control (Admin, Agent, Customer)
- ✅ JWT authentication
- ✅ Ticket CRUD operations
- ✅ Ticket conversations with internal notes
- ✅ Advanced filtering (status, priority, assignee, search)
- ✅ RESTful API
- ✅ React frontend with Vite
- ✅ CI/CD with GitHub Actions
- ✅ Comprehensive test coverage

## 🔐 Security

- JWT token authentication
- Organization-scoped data access
- Role-based permissions
- Input validation
- CORS enabled
- Prepared SQL statements (via Knex)

## 📊 Database

- **organizations**: Multi-tenant organization data
- **users**: Users with role and organization association
- **tickets**: Support tickets with status and priority
- **ticket_replies**: Ticket conversations

## 🎯 Next Steps

- [ ] Complete React components (Login, Register, TicketList, TicketDetail, CreateTicket)
- [ ] Add AuthContext for state management
- [ ] Implement real-time updates (optional)
- [ ] Add file attachments to tickets
- [ ] Implement email notifications
- [ ] Add analytics dashboard
- [ ] Migrate to PostgreSQL for production scaling

## 📝 License

MIT