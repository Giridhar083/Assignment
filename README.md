# TaskFlow – Team Task Manager

A full-stack team task management application built with React, Express.js, and MongoDB.

## Tech Stack

| Layer      | Technology         |
|------------|---------------------|
| Frontend   | React + Vite        |
| Styling    | Tailwind CSS        |
| Backend    | Express.js          |
| Database   | MongoDB Atlas       |
| Auth       | JWT                 |
| Deployment | Railway             |

---

## Features

- **Authentication** — Signup / Login with JWT (7-day token)
- **Projects** — Create projects; creator becomes Admin automatically
- **Members** — Admin can add/remove members by email
- **Tasks** — Create tasks with title, description, priority, due date, assignee
- **Kanban Board** — Visual To Do / In Progress / Done columns
- **Role-Based Access** — Admins manage everything; Members update only their task status
- **Dashboard** — Task stats, completion rate, overdue count, tasks per user
- **Overdue Detection** — Overdue tasks are flagged with a red badge

---

## Deployment on Railway

### Step 1: Get MongoDB Atlas URI
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Get the connection string and replace `<password>` with your actual password

### Step 2: Deploy Backend on Railway
1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Select your repo → set **Root Directory** to `backend`
3. Railway will auto-detect Node.js via Nixpacks
4. Go to the service **Variables** tab and add:
   ```
   PORT=5000
   MONGODB_URI=<your MongoDB Atlas connection string>
   JWT_SECRET=<a long random secret string>
   CLIENT_URL=<your frontend Railway URL — fill in after Step 3>
   ```
5. Click **Deploy**. Copy the generated backend URL (e.g. `https://taskflow-backend.up.railway.app`)

### Step 3: Deploy Frontend on Railway
1. In the same Railway project → **New Service** → **Deploy from GitHub**
2. Select your repo → set **Root Directory** to `frontend`
3. Go to the service **Variables** tab and add:
   ```
   VITE_API_URL=https://<your-backend-url>/api
   ```
4. Click **Deploy**. Copy the generated frontend URL.

### Step 4: Update Backend CORS
1. Go back to the **backend** service → **Variables**
2. Set `CLIENT_URL` to your frontend Railway URL (e.g. `https://taskflow-frontend.up.railway.app`)
3. Railway will automatically redeploy

### Railway files explained

| File | What it does |
|------|-------------|
| `backend/railway.toml` | Tells Railway how to build and start the backend |
| `frontend/railway.toml` | Tells Railway how to build and start the frontend |

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works great)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/taskmanager
JWT_SECRET=some_long_random_secret_string
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## API Endpoints

### Auth
| Method | Endpoint         | Description       | Auth |
|--------|-----------------|-------------------|------|
| POST   | /api/auth/signup | Register new user | No   |
| POST   | /api/auth/login  | Login             | No   |
| GET    | /api/auth/me     | Get current user  | Yes  |

### Projects
| Method | Endpoint                          | Description         | Role   |
|--------|-----------------------------------|---------------------|--------|
| GET    | /api/projects                     | Get my projects     | Member |
| POST   | /api/projects                     | Create project      | Any    |
| GET    | /api/projects/:id                 | Get project details | Member |
| POST   | /api/projects/:id/members         | Add member          | Admin  |
| DELETE | /api/projects/:id/members/:userId | Remove member       | Admin  |
| DELETE | /api/projects/:id                 | Delete project      | Admin  |

### Tasks
| Method | Endpoint       | Description        | Role   |
|--------|---------------|--------------------|--------|
| GET    | /api/tasks?projectId=xxx | Get project tasks | Member |
| POST   | /api/tasks     | Create task        | Admin  |
| PATCH  | /api/tasks/:id | Update task        | Admin/Assignee |
| DELETE | /api/tasks/:id | Delete task        | Admin  |

### Dashboard
| Method | Endpoint                      | Description     | Auth |
|--------|-------------------------------|-----------------|------|
| GET    | /api/dashboard?projectId=xxx  | Get stats       | Member |

---

## Project Structure

```
taskflow/
├── backend/
│   ├── models/
│   │   ├── User.js         # User schema with bcrypt
│   │   ├── Project.js      # Project + members schema
│   │   └── Task.js         # Task schema
│   ├── routes/
│   │   ├── auth.js         # Auth endpoints
│   │   ├── projects.js     # Project CRUD
│   │   ├── tasks.js        # Task CRUD
│   │   └── dashboard.js    # Stats endpoint
│   ├── middleware/
│   │   └── auth.js         # JWT protect middleware
│   ├── railway.toml        # Railway deployment config
│   └── server.js           # Express app entry
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx   # Auth state management
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Projects.jsx      # Projects list
    │   │   ├── ProjectDetail.jsx # Kanban board + members
    │   │   └── Dashboard.jsx     # Stats dashboard
    │   ├── components/
    │   │   └── Layout.jsx        # Navbar + layout
    │   └── utils/
    │       └── api.js            # Axios instance with JWT
    └── railway.toml              # Railway deployment config
```

---

## Design Decisions

1. **MongoDB Atlas** — Free tier, no setup needed, works perfectly with Mongoose
2. **JWT in localStorage** — Simple and effective for this scale; token auto-attached via Axios interceptor
3. **Role stored per-project** — Same user can be Admin in one project and Member in another
4. **Members can only update status** — Backend enforces this, frontend shows appropriate UI
5. **Kanban view** — Better UX than a flat list for task tracking

---

## Author

Built as a full-stack assignment demonstrating React, Express.js, MongoDB, JWT auth, and Railway deployment.
# Team-Task-Manager
