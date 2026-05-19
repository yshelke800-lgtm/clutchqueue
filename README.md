# ClutchQueue 🎮

> The ultimate esports tournament registration & team management platform for college gaming communities.

![ClutchQueue](https://img.shields.io/badge/Stack-MERN-7c3aed?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-06b6d4?style=for-the-badge)

## 🚀 Features

- 🏆 **Tournament Management** — Create, manage & track tournaments (BGMI, Valorant, Free Fire, FIFA)
- 👥 **Team System** — Build squads, join teams, manage rosters
- 💬 **Real-time Chat** — Team communication via Socket.io
- 📊 **Leaderboards** — Global & per-game rankings
- 🔔 **Notifications** — In-app tournament & match alerts
- 🎯 **Bracket System** — Auto-generate tournament brackets
- 🔐 **JWT Auth** — Secure login for Players & Organizers

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite) |
| Styling | Vanilla CSS (Dark Gaming Theme) |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Real-time | Socket.io |
| Deploy | Vercel (frontend) + Render (backend) |

## 📁 Project Structure

```
clutchqueue/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/   # Navbar
│   │   ├── pages/        # All pages
│   │   ├── context/      # Auth context
│   │   └── main.jsx
│   └── .env
└── server/          # Node/Express backend
    ├── models/      # Mongoose schemas
    ├── routes/      # API routes
    ├── middleware/  # JWT auth
    └── index.js
```

## ⚙️ Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/clutchqueue.git
cd clutchqueue
```

### 2. Setup Backend
```bash
cd server
npm install
# Create .env with your values
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Environment Variables

**server/.env**
```
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

**client/.env**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 🌐 Deployment

- **Frontend** → Vercel
- **Backend** → Render
- **Database** → MongoDB Atlas

## 👤 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Player | player@demo.com | demo123 |
| Organizer | org@demo.com | demo123 |

---

Built with ❤️ for college esports communities.
