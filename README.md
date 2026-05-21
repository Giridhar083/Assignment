# TaskFlow – Team Task Manager

A full-stack team task management application built with React, Express.js, and MongoDB.

## Live URLs

- **Frontend:** https://enthusiastic-transformation-project.up.railway.app
- **Backend:** https://assignment-project.up.railway.app/api/health
- **GitHub:** https://github.com/Giridhar083/Assignment

## Tech Stack

| Layer      | Technology          |
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
3. Go to **Variables** tab and add:
   ```
   PORT=5000
   MONGODB_URI=<your MongoDB Atlas connection string>
   JWT_SECRET=<a long random secret string>
   CLIENT_URL=<your frontend Railway URL>
   ```
4. Click **Deploy**

### Step 3: Deploy Frontend on Railway
1. In the same Railway project → **New Service** → **Deploy from GitHub**
2. Select your repo → set **Root Directory** to `frontend`
3. Go to **Variables** tab and add:
   ```
   VITE_API_URL=https://<your-backend-url>/api
   ```
4. Click **Deploy**

### Step 4: Update Backend CORS
1. Go back to **backend** service → **Variables**
2. Set `CLIENT_URL` to your frontend Railway URL
3. Railway will automatically redeploy

---

## Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/Giridhar083/Assignment.git
cd Assignment
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
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/signup | Register new user | No |
| POST | /api/auth/login | Login | No |
| GET | /api/auth/me | Get current user | Yes |

### Projects
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | /api/projects | Get my projects | Member |
| POST | /api/projects | Create project | Any |
| GET | /api/projects/:id | Get project details | Member |
| POST | /api/projects/:id/members | Add member | Admin |
| DELETE | /api/projects/:id/members/:userId | Remove member | Admin |
| DELETE | /api/projects/:id | Delete project | Admin |

### Tasks
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | /api/tasks?projectId=xxx | Get project tasks | Member |
| POST | /api/tasks | Create task | Admin |
| PATCH | /api/tasks/:id | Update task | Admin/Assignee |
| DELETE | /api/tasks/:id | Delete task | Admin |

### Dashboard
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/dashboard?projectId=xxx | Get stats | Member |

---

## Project Structure

```
Assignment/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js
│   ├── railway.toml
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Projects.jsx
    │   │   ├── ProjectDetail.jsx
    │   │   └── Dashboard.jsx
    │   ├── components/
    │   │   └── Layout.jsx
    │   └── utils/
    │       └── api.js
    └── railway.toml
```

---

## Design Decisions

1. **MongoDB Atlas** — Free tier, no setup needed, works with Mongoose
2. **JWT in localStorage** — Simple and effective; token auto-attached via Axios interceptor
3. **Role stored per-project** — Same user can be Admin in one project and Member in another
4. **Members can only update status** — Backend enforces this, frontend shows appropriate UI
5. **Kanban view** — Better UX than a flat list for task tracking

---

## Author

**Giridhar** — Built as a full-stack assignment demonstrating React, Express.js, MongoDB, JWT auth, and Railway deployment.