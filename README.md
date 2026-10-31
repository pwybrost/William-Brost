# William Brost

Personal website for **William Brost**: a landing page/dashboard plus a fully editable portfolio
(profile, bio, skills, projects with links, experience, education). The look is an early-2000s
digital camera / CRT computer: viewfinder brackets, scanlines, green LCD text and an orange date stamp.

- **Visitors** can sign up, sign in, or continue as a guest, and can view everything.
- **You (the owner)** sign in with the admin account and edit everything from the website itself.
  Every write endpoint is checked on the server, so regular users and guests can't edit anything.

## Stack

| Part      | Tech                                                        |
| --------- | ----------------------------------------------------------- |
| Frontend  | React 19, Vite, TypeScript, Tailwind CSS v4, React Router 7 |
| Backend   | Node.js, Express 5, TypeScript, Zod, JWT (httpOnly cookie)  |
| Database  | Neon (serverless PostgreSQL), images stored in Postgres     |
| Container | Docker + Docker Compose for the backend                     |

## Folder structure

```
William Brost/
├── docker-compose.yml          # runs the backend container
├── backend/
│   ├── Dockerfile
│   ├── .env.example            # copy to .env
│   └── src/
│       ├── index.ts            # startup: migrate DB, create owner account, start server
│       ├── app.ts              # express app + route mounting
│       ├── config/env.ts       # validated environment variables
│       ├── db/                 # pool, migrations, owner-account seeding
│       ├── middleware/         # auth (session / requireAdmin), error handler
│       ├── modules/
│       │   ├── auth/           # signup, login, logout, me
│       │   ├── media/          # image upload + serving
│       │   └── portfolio/      # profile, social links, projects, experience/education
│       ├── scripts/migrate.ts
│       └── utils/
└── frontend/
    ├── index.html
    ├── vite.config.ts          # proxies /api to the backend in dev
    └── src/
        ├── App.tsx             # routes
        ├── index.css           # retro theme (colors, fonts, bevels, scanlines)
        ├── lib/                # api client + types
        ├── context/            # auth + edit mode
        ├── hooks/
        ├── components/
        │   ├── layout/         # nav bar shell, auth gate
        │   └── ui/             # Panel, Modal, fields, image uploader, link editor...
        ├── features/portfolio/ # profile header, project cards, editors
        └── pages/              # Auth, Dashboard, Portfolio, ProjectDetail, 404
```

## 1. Create the Neon database

1. Sign up at <https://neon.tech> and create a project.
2. Click **Connect** and copy the connection string (it ends in `?sslmode=require`).

Tables are created automatically the first time the backend starts.

## 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

- `DATABASE_URL`: the Neon connection string.
- `JWT_SECRET`: a long random string. Generate one with
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
- `ADMIN_EMAIL`: **the owner account**, `pwybrost@addu.edu.ph` (also the default if the line is missing).
  On every start the server promotes this account to owner and demotes any other admin.
  An account that already exists keeps its own password.
- `ADMIN_PASSWORD` (optional): only used to *create* the owner account if nobody has signed up with
  `ADMIN_EMAIL` yet. Leave it empty if you already signed up on the site.

## 3. Run it

You need Node.js 20.19+ (or 22+).

**Backend** (pick one):

```bash
# a) with Docker, from the "William Brost" folder
docker compose up --build

# b) without Docker
cd backend
npm install
npm run dev
```

The API runs on <http://localhost:4000> (health check: <http://localhost:4000/api/health>).

**Frontend**, in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

## 4. Edit your portfolio

1. Sign in with `pwybrost@addu.edu.ph` (your normal password from when you signed up).
2. Open **Portfolio**. The owner bar and edit buttons appear because you're the owner.
3. From there you can:
   - **Profile** (Identity / Photos / About tabs): name, headline, an availability badge such as
     "Open to internships", location, public email, resume link, bio, skills, profile picture and cover photo.
   - **Account links**: GitHub, LinkedIn, Behance, Instagram... as many as you want, reorderable.
   - **Projects** (General / Images / Links / Publish tabs):
     - type: **Graphic Design**, **Website**, **App** or **Other** (visitors can filter by type),
     - title, summary, full description, your role, year, status (completed / in progress / concept),
     - tech stack (or tools used, for design work),
     - cover image plus a **gallery** of up to 40 images with captions (opens in a full-screen viewer),
     - any number of optional links (live demo, repo, Behance, video...),
     - **Published / Draft** (drafts are only visible to you), **Featured** pin, and order.
   - **Experience**, **Education** and **Achievements** (certifications, awards, hackathons).
4. Visitors can send you messages through the contact form. Read them on the **Inbox** page
   (owner only; the nav bar shows the unread count).
5. Use the **Edit mode / Visitor view** toggle in the nav bar to preview the site as others see it.

The **Home** page (dashboard) only shows the "William Brost" title for now, ready for future products.

## API overview

| Method | Path                     | Who    |
| ------ | ------------------------ | ------ |
| POST   | `/api/auth/signup`       | anyone |
| POST   | `/api/auth/login`        | anyone |
| POST   | `/api/auth/logout`       | anyone |
| GET    | `/api/auth/me`           | signed in |
| GET    | `/api/portfolio`         | anyone |
| GET    | `/api/projects/:id`      | anyone |
| GET    | `/api/media/:id`         | anyone |
| POST   | `/api/media`             | owner  |
| PUT    | `/api/profile`           | owner  |
| PUT    | `/api/social-links`      | owner  |
| POST/PUT/DELETE | `/api/projects[/:id]` | owner |
| POST/PUT/DELETE | `/api/timeline[/:id]` | owner |
| POST   | `/api/messages`          | anyone (5 per hour per IP) |
| GET/PATCH/DELETE | `/api/messages[/:id]` | owner |

## Notes

- **Images** are stored in the Neon database (max 5 MB each; JPEG, PNG, WebP, GIF). That keeps the setup
  to one service. Replaced images are deleted automatically. If you later upload lots of large files,
  moving them to object storage (Cloudflare R2, S3, Cloudinary) is the natural next step.
- **Deploying:** Vercel hosts the frontend but can't run the Docker backend, so host the backend
  container on Render, Railway or Fly.io.
  - Vercel: import the repo, set **Root Directory** to `frontend` (framework preset: Vite).
    `frontend/vercel.json` makes page refreshes on routes like `/portfolio` work.
  - Then set:
  - frontend: `VITE_API_URL=https://your-api-domain`
  - backend: `NODE_ENV=production`, `CORS_ORIGIN=https://your-frontend-domain`, `COOKIE_SECURE=true`,
    `COOKIE_SAMESITE=none`, `TRUST_PROXY=true`.
- Never commit `.env` files. `.gitignore` already excludes them.

## Push to GitHub

```bash
cd "William Brost"
git init
git add .
git commit -m "Initial commit: William Brost personal website"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```
