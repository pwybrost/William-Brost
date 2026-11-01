# William Brost

Personal portfolio site for **William Brost**, designed as a Windows 98 desktop. Every section opens
as its own large window on a green-hills wallpaper, with a taskbar, a Start menu, light and dark themes,
and hover and window animations.

- **Visitors** can sign up, sign in, or continue as a guest, and can view everything.
- **You (the owner, `pwybrost@addu.edu.ph`)** can edit everything from the site itself.
  Every write endpoint is checked on the server, so nobody else can change anything.

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
    ├── index.html              # fonts, theme set before first paint
    ├── vite.config.ts          # proxies /api to the backend in dev
    └── src/
        ├── App.tsx             # routes (one route = one window)
        ├── index.css           # the whole design system: colour tokens (light/dark), bevels,
        │                       # buttons, fields, wallpaper, animations
        ├── lib/                # api client, types, list of sections/windows
        ├── context/            # auth, edit mode, theme, portfolio data
        ├── hooks/              # uploads, unread count
        ├── components/
        │   ├── shell/          # Desktop, AppWindow, Taskbar + Start menu, Wallpaper, Loading
        │   ├── win98/          # icons, message boxes, progress bar
        │   ├── ui/             # TitleBar, Modal, fields, tabs, uploaders, lightbox
        │   └── layout/         # sign-in / owner route guards
        ├── features/
        │   ├── editors/        # every owner dialog + EditorsProvider
        │   ├── home/           # animated profile photo
        │   ├── products/       # product card
        │   └── projects/       # project card, featured slideshow
        └── pages/              # Home, Projects, Project, Gallery, Journey, Stack, Resume,
                                # Contact, Control Panel, Inbox, Desktop, Sign in, 404
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

## 4. The windows

| Window | What's in it |
| --- | --- |
| **Home** | "William Brost", your photo (animated), bio, account links, availability, **products**, featured work |
| **Projects** | featured slideshow, then all projects with type filters, search and sort |
| **Project page** | case study: overview, problem, process, outcome, gallery, links, previous/next |
| **Gallery** | every project image in one masonry grid, full-screen viewer |
| **Journey** | experience, education, certifications & awards as a timeline |
| **Stack** | skills, grouped ("Frontend: React" goes under *Frontend*) |
| **Resume** | download/open your PDF, plus an auto-built one-page summary |
| **Contact** | contact form (goes to your Inbox), email, links, availability |
| **Control Panel / Inbox** | owner only |

Navigation: the menu bar in every window, the desktop icons (large screens), and the **Start** menu.
The taskbar has the open window (click to minimize/restore), a light/dark switch and the clock.
Windows can be minimized, maximized (or double-click the title bar), closed, and dragged on large screens.

## 5. Edit your site

1. Sign in with `pwybrost@addu.edu.ph`. The taskbar shows **✎ Editing** when you're the owner.
2. Edit buttons appear in every window, and **Control Panel** (Start menu or desktop) has everything in one place:
   - **Profile**: name, headline, availability, location, email; profile picture and cover banner;
     bio; skills; resume (upload a PDF or link one); account links.
   - **Content**: projects (type, summary, overview, role, year, status, tech/tools, cover, gallery up to 40 images,
     links, case-study sections, draft/published, featured, order), products (photo, name, description, price,
     status, link, draft/published), experience, education, achievements.
   - **Display**: the desktop wallpaper for everyone (built-in green hills, or upload your own picture),
     and the light/dark theme for your browser.
   - **Inbox**: contact-form messages; reply by email, mark read/unread, delete.
3. The photo on Home also has **Change photo...** right under it.
4. Click **✎ Editing** in the taskbar to switch to **Visitor view** and preview the site as others see it.

## Design notes (HCI)

- **Uniform:** one Windows 98 component set everywhere. Pages share the same header pattern (small label, big
  pixel title, intro) and the same spacing scale.
- **Readable:** 16px body text; text colours meet WCAG AA contrast (4.5:1+) in both themes; the light/dark
  choice follows your device until you pick one, and is applied before the first paint.
- **Keyboard:** visible focus on everything; Esc closes dialogs and the Start menu; arrow keys work in the
  Start menu, tabs, slideshow and image viewer.
- **Touch:** controls grow to 44px on touch screens; the slideshow can be swiped.
- **Motion:** windows open and minimize with animations; cards lift, images zoom, links slide their arrow on
  hover; the profile photo loads line by line and tilts toward the pointer. All of it is switched off for people
  who set "reduce motion" on their device, and the slideshow never moves by itself.

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
| POST/PUT/DELETE | `/api/products[/:id]` | owner |

## Notes

- **Images and the resume PDF** are stored in the Neon database (max 5 MB each; JPEG, PNG, WebP, GIF, PDF). That keeps the setup
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
