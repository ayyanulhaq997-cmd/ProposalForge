# StayHub Setup Guide for Developers

This guide will help you set up and run the StayHub application locally.

## 📋 Prerequisites

Ensure you have the following installed:
- **Node.js** v18 or higher (download from https://nodejs.org)
- **npm** (comes with Node.js)
- **PostgreSQL** (version 12+)
  - Download from https://www.postgresql.org/download/
  - Or use: Windows: PostgreSQL installer, Mac: `brew install postgresql`, Linux: `sudo apt install postgresql`

## 🗂️ Project Structure

```
frontend/          → React frontend application
backend/           → Express.js backend API
  ├── shared/     → Shared types and schemas
package.json       → Root dependencies
README.md          → Project overview
```

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd stayhub
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all dependencies for both frontend and backend.

### Step 3: Set Up Database

#### 3a. Create PostgreSQL Database

```bash
# On your system's command line
createdb stayhub

# Or if you need to specify user/password:
createdb -U postgres -W stayhub
```

#### 3b. Configure Environment Variables

1. Create `.env` file in the root directory:

```bash
cp backend/.env.example .env
```

2. Edit `.env` and add your database connection:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/stayhub
SESSION_SECRET=generate-a-random-secret-key-here
```

Example:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/stayhub
SESSION_SECRET=my_super_secret_key_12345678
```

### Step 4: Initialize Database Schema

```bash
npm run db:push
```

This creates all necessary tables and seeds test data.

### Step 5: Start Development Server

```bash
npm run dev
```

The application will start and be available at:
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:5000/api

## 👥 Test Accounts

After running `npm run db:push`, the following test accounts are created:

### Admin Account
- **Email**: admin@stayhub.test
- **Password**: admin123
- **Role**: Administrator

### Host Account  
- **Email**: host@example.com
- **Password**: password123
- **Role**: Property Host

### Guest Account
- **Email**: user@example.com
- **Password**: password123
- **Role**: Guest/Traveler

## 📝 Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Secret key for sessions | Yes |
| `NODE_ENV` | development/production | No (default: development) |
| `PORT` | Server port | No (default: 5000) |
| `STRIPE_SECRET_KEY` | Stripe API key | No |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | No |
| `SQUARE_ACCESS_TOKEN` | Square API token | No |

### Frontend (frontend/.env)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |
| `VITE_ENABLE_STRIPE` | Enable Stripe payments |
| `VITE_ENABLE_SQUARE` | Enable Square payments |

## 🗄️ Database Commands

```bash
# View database studio (visual database editor)
npm run db:studio

# Generate migration from schema changes
npm run db:generate

# Apply migrations to database
npm run db:push

# Force push (careful - can cause data loss)
npm run db:push -- --force

# View database schema
npm run db:check
```

## 🛠️ Development Commands

```bash
# Start both frontend and backend
npm run dev

# Start frontend only
npm run dev:client

# Start backend only
npm run dev:server

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 🔍 Troubleshooting

### Issue: "database does not exist"
**Solution**: Make sure PostgreSQL is running and create the database:
```bash
createdb stayhub
```

### Issue: "Port 5000 already in use"
**Solution**: Change the port in `.env`:
```env
PORT=3000
```
Then access the app at `http://localhost:3000`

### Issue: "Cannot find module" errors
**Solution**: Reinstall dependencies:
```bash
rm -rf node_modules
npm install
npm run dev
```

### Issue: Database migration fails
**Solution**: Reset the database and retry:
```bash
# Drop the database
dropdb stayhub

# Recreate it
createdb stayhub

# Reapply migrations
npm run db:push
```

### Issue: "SESSION_SECRET not set"
**Solution**: Add SESSION_SECRET to your `.env` file:
```env
SESSION_SECRET=any-random-string-here
```

## 📚 Feature Overview

### User Roles

1. **Guest**: Browse properties, make bookings
2. **Host**: List properties, manage bookings
3. **Admin**: Manage users and system settings

### Main Features

- 🏠 Property Listing & Search
- 📅 Booking Management
- 💳 Payment Processing
- 👤 User Profiles & Verification
- 🛡️ Admin Dashboard
- 🌐 Multi-language Support (English/Spanish)
- 🌙 Dark Mode

## 🚢 Deployment

### Deploying to Replit

1. Connect your GitHub repository to Replit
2. Configure environment variables in Replit Secrets
3. The app will auto-deploy on push

### Deploying to Other Platforms

Refer to the backend and frontend READMEs for deployment instructions.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the backend and frontend README files
3. Check database logs: `npm run db:studio`

## 🔒 Security Notes

- Never commit `.env` file to version control
- Use strong SESSION_SECRET in production
- Keep dependencies updated: `npm audit fix`
- Use HTTPS in production

## 📖 Documentation

- [Backend API Documentation](backend/README.md)
- [Frontend Architecture](frontend/README.md)
- [Database Schema](backend/shared/schema.ts)

---

Happy developing! 🚀
