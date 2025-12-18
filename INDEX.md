# 📑 StayHub Project Index

## 🚀 START HERE

1. **First Time?** → Read `SETUP_GUIDE.md`
2. **Want Overview?** → Read `README.md`
3. **Need Details?** → Read `DELIVERY_CHECKLIST.md`

---

## 📂 Folder Organization

```
frontend/      ← React app (development & production)
backend/       ← Express API (development & production)
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **SETUP_GUIDE.md** | ⭐ Step-by-step setup instructions |
| **README.md** | Project overview and architecture |
| **DELIVERY_CHECKLIST.md** | Complete feature list and status |
| **DELIVERY_STRUCTURE.md** | Folder organization guide |
| **PROJECT_SUMMARY.txt** | Quick reference summary |
| **frontend/README.md** | Frontend-specific documentation |
| **backend/README.md** | Backend-specific documentation |

---

## ⚡ Quick Commands

```bash
# Install & Setup
npm install
npm run db:push

# Development
npm run dev              # Start both frontend and backend

# Database
npm run db:studio       # Open visual database editor

# Production
npm run build           # Build for production
npm run start           # Start production server
```

---

## 👥 Test Accounts

```
Admin:   admin@stayhub.test / admin123
Host:    host@example.com / password123
Guest:   user@example.com / password123
```

---

## 🔑 Environment Setup

Copy `backend/.env.example` to `.env` and configure:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/stayhub
SESSION_SECRET=your-secret-key
```

---

## 📱 Access Points

- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:5000/api
- **Database Studio**: `npm run db:studio`

---

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite + Tailwind + TypeScript
- **Backend**: Express.js + PostgreSQL + Drizzle + TypeScript
- **UI**: shadcn/ui components
- **Auth**: Passport.js + sessions

---

## ✨ Features Implemented

✅ User authentication & profiles
✅ Property listings & search
✅ Booking system
✅ Payment processing (Stripe + Square)
✅ Admin dashboard
✅ Spanish language support
✅ Dark mode
✅ Responsive design

---

## 📞 Need Help?

1. Check **SETUP_GUIDE.md** troubleshooting section
2. Review **frontend/README.md** or **backend/README.md**
3. Read the FAQ in **DELIVERY_CHECKLIST.md**

---

**Last Updated**: December 18, 2025
**Status**: ✅ Production Ready
