# 💼 Job Board w/ Company & User Dashboard

A full-featured, production-ready job board platform with role-based dashboards for candidates, companies, and administrators. Built with React 19, Express 5, and MongoDB — featuring advanced job search, a 6-state application workflow, file uploads via Cloudinary, in-app and email notifications, company analytics, and OWASP Top 10 compliant security hardening.

[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7+-47A248?style=flat-square&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

- **Role-Based Dashboards**: Separate dashboards for candidates, companies, and administrators with tailored functionality
- **Advanced Job Search**: 8-dimension filtering (keyword, location, type, experience, education, salary range, skills, sort order) with URL-synced shareable links
- **6-State Application Workflow**: Full pipeline from pending → reviewed → shortlisted → interviewed → offered → hired, with status history timeline
- **JWT Authentication**: Access + refresh token rotation, account lockout, auto-logout on inactivity
- **File Uploads via Cloudinary**: CV upload (PDF) with magic-byte validation, image uploads with EXIF stripping
- **In-App & Email Notifications**: Real-time notification polling, transactional emails via Nodemailer with configurable preferences
- **Company Analytics**: Hiring funnel visualization, application trends, conversion rates, and dashboard statistics
- **Profile Completion Tracker**: Percentage-based progress indicator with missing field checklist
- **Dark Mode**: System / light / dark theme modes with persistent preference
- **Responsive Design**: Mobile-first approach with sidebar layouts, card-based tables, and skeleton loading states
- **Security Hardened**: Helmet CSP, 8 specialized rate limiters, JWT refresh rotation, password history, NoSQL injection prevention

## Live Demo

[🌐 View Live Demo](https://job-board-with-company-user-dashboard.netlify.app/)

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@jobboard.com` | `Admin123!` |
| Company | `technova@jobboard.com` | `Demo123!` |
| Candidate | `ayse@jobboard.com` | `Demo123!` |

> Run `npm run seed:demo` in the server directory to populate the database with all demo data.

## Screenshots

| Home | Job List | Job Detail | Company Dashboard |
|------|----------|------------|-------------------|
| ![Home](https://via.placeholder.com/400x250?text=Home+Page) | ![Job List](https://via.placeholder.com/400x250?text=Job+List) | ![Job Detail](https://via.placeholder.com/400x250?text=Job+Detail) | ![Company Dashboard](https://via.placeholder.com/400x250?text=Company+Dashboard) |

| Candidate Dashboard | Admin Dashboard | Apply Modal | Company Profile |
|---------------------|-----------------|-------------|-----------------|
| ![Candidate Dashboard](https://via.placeholder.com/400x250?text=Candidate+Dashboard) | ![Admin Dashboard](https://via.placeholder.com/400x250?text=Admin+Dashboard) | ![Apply Modal](https://via.placeholder.com/400x250?text=Apply+Modal) | ![Company Profile](https://via.placeholder.com/400x250?text=Company+Profile) |

## Technologies

- **React 19**: Modern UI library with hooks and functional components
- **React Router 7**: Client-side routing with nested layouts and route guards
- **Vite 8**: Lightning-fast build tool and development server
- **TailwindCSS 4**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Clean, consistent icon library
- **React Hot Toast**: Lightweight notification toasts
- **Axios**: Promise-based HTTP client with interceptor support
- **Express 5**: Fast, minimalist Node.js web framework
- **MongoDB (Mongoose 9)**: NoSQL database with elegant object modeling
- **JWT (jsonwebtoken + bcryptjs)**: Secure token-based authentication
- **Multer + Cloudinary**: File upload middleware with cloud storage
- **express-validator**: Server-side request validation
- **Nodemailer**: Email sending service for transactional emails
- **Helmet + CORS + express-rate-limit**: HTTP security middleware stack
- **express-mongo-sanitize**: NoSQL injection prevention

## Roles & Permissions

| Feature | Guest | Candidate | Company | Admin |
|---------|:-----:|:---------:|:-------:|:-----:|
| Browse jobs | ✅ | ✅ | ✅ | ✅ |
| View job details | ✅ | ✅ | ✅ | ✅ |
| View company profiles | ✅ | ✅ | ✅ | ✅ |
| Register / Login | ✅ | — | — | — |
| Apply to jobs | — | ✅ | — | — |
| Save / unsave jobs | — | ✅ | — | — |
| View own applications | — | ✅ | — | — |
| Withdraw application | — | ✅ | — | — |
| Edit profile | — | ✅ | ✅ | ✅ |
| Create / edit / delete jobs | — | — | ✅ | — |
| View job applications | — | — | ✅ | ✅ |
| Update application status | — | — | ✅ | ✅ |
| Company analytics | — | — | ✅ | — |
| Manage all users | — | — | — | ✅ |
| Manage all jobs | — | — | — | ✅ |
| Platform analytics | — | — | — | ✅ |

## Installation

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **MongoDB** 7+ ([download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Cloudinary** account ([sign up](https://cloudinary.com/)) — for file uploads
- **SMTP credentials** (optional) — for email notifications (e.g., Gmail App Password)

### Local Development

```bash
# Clone the repository
git clone https://github.com/Serkanbyx/job-board.git
cd job-board

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Setup

```bash
# Create server .env from example
cp server/.env.example server/.env

# Create client .env from example
cp client/.env.example client/.env
```

Open `server/.env` and fill in your own values (see [Environment Variables](#environment-variables) below).

> **Important:** The `.env` file is git-ignored and must be created locally. Never commit real credentials.

### Database Setup

```bash
# Start MongoDB locally (or use Atlas connection string in .env)

# Seed admin user
cd server
npm run seed:admin

# (Optional) Seed full demo data — includes companies, jobs, candidates, and applications
npm run seed:demo
```

### Running the Application

```bash
# Terminal 1 — Start backend (port 5000)
cd server
npm run dev

# Terminal 2 — Start frontend (port 5173)
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Required | Example |
|----------|-------------|:--------:|---------|
| `PORT` | Server port | No | `5000` |
| `NODE_ENV` | Environment mode | No | `development` |
| `MONGO_URI` | MongoDB connection string | Yes | `mongodb://localhost:27017/jobboard` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes | `your_jwt_secret_min_32_chars_here` |
| `CORS_ORIGIN` | Allowed frontend origin | Yes | `http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes | `your_api_secret` |
| `SMTP_HOST` | SMTP server host | No | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | No | `587` |
| `SMTP_USER` | SMTP username | No | `your_email@gmail.com` |
| `SMTP_PASS` | SMTP password / app password | No | `your_app_password` |
| `EMAIL_FROM` | Sender address | No | `JobBoard <noreply@jobboard.com>` |
| `CLIENT_URL` | Client URL (for email links) | No | `http://localhost:5173` |

### Client (`client/.env`)

| Variable | Description | Required | Example |
|----------|-------------|:--------:|---------|
| `VITE_API_URL` | Backend API base URL (empty for dev proxy) | No | *(empty for development)* |

## Usage

1. **Register** as a candidate or company from the registration page
2. **Browse jobs** on the public job listing page with advanced filters
3. **Apply to jobs** as a candidate by uploading your CV and cover letter
4. **Track applications** from your candidate dashboard with real-time status updates
5. **Post jobs** as a company and manage them from the company dashboard
6. **Review applications** with the 6-state workflow, add notes and ratings
7. **View analytics** as a company to see hiring funnel and application trends
8. **Manage the platform** as an admin — users, jobs, and applications

## How It Works?

### Authentication Flow

The platform uses a dual-token strategy for secure, seamless authentication:

```
Login → Access Token (15 min) + Refresh Token (7 days)
       ↓
API Request → Authorization: Bearer <access_token>
       ↓
Token Expired → Auto-refresh via /api/auth/refresh-token
       ↓
Refresh Failed → Redirect to login
```

- **Token rotation**: Each refresh token is single-use; a new pair is issued on every refresh
- **Token versioning**: Changing the password invalidates all existing sessions
- **Account lockout**: 5 failed login attempts trigger a 30-minute cooldown

### Application Workflow

```
pending → reviewed → shortlisted → interviewed → offered → hired
                                                         ↘ rejected
                          candidate can withdraw at any stage ↗
```

Each status transition is recorded with timestamps, creating a visual timeline for both candidates and companies.

### Security Architecture

The server implements defense-in-depth with 8 specialized rate limiters, Helmet CSP with strict directives, JWT refresh rotation with token versioning, magic-byte file validation, EXIF stripping, signed Cloudinary URLs, MongoDB query sanitization, and comprehensive audit logging with 90-day TTL retention.

## API Endpoints

### Health Check

| Method | Path | Description | Access |
|--------|------|-------------|--------|
| GET | `/api/health` | API health check | Public |

### Authentication (`/api/auth`)

| Method | Path | Description | Access |
|--------|------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login | Public |
| POST | `/refresh-token` | Refresh access token | Public |
| POST | `/logout` | Logout (revoke refresh token) | Authenticated |
| POST | `/logout-all` | Logout all sessions | Authenticated |
| GET | `/me` | Get current user profile | Authenticated |
| PUT | `/profile` | Update profile | Authenticated |
| PUT | `/change-password` | Change password | Authenticated |
| DELETE | `/account` | Delete own account | Authenticated |

### Jobs (`/api/jobs`)

| Method | Path | Description | Access |
|--------|------|-------------|--------|
| GET | `/` | List jobs (with filters) | Public |
| GET | `/stats` | Get filter statistics | Public |
| GET | `/my-jobs` | List company's own jobs | Company |
| GET | `/:slug` | Get job by slug | Public |
| GET | `/:slug/similar` | Get similar jobs | Public |
| POST | `/` | Create job | Company |
| PUT | `/:id` | Update job | Company |
| PATCH | `/:id/toggle` | Toggle active status | Company |
| DELETE | `/:id` | Delete job | Company, Admin |

### Applications (`/api`)

| Method | Path | Description | Access |
|--------|------|-------------|--------|
| POST | `/jobs/:jobId/apply` | Apply to a job | Candidate |
| GET | `/applications/mine` | List own applications | Candidate |
| GET | `/jobs/:jobId/applications` | List applications for a job | Company, Admin |
| GET | `/jobs/:jobId/applications/stats` | Application stats for a job | Company, Admin |
| GET | `/applications/:id` | Get single application | Authenticated |
| PATCH | `/applications/:id/status` | Update application status | Company, Admin |
| PATCH | `/applications/:id/notes` | Update internal notes | Company, Admin |
| PATCH | `/applications/bulk-status` | Bulk update statuses | Company |
| DELETE | `/applications/:id` | Withdraw application | Candidate |

### Users (`/api/users`)

| Method | Path | Description | Access |
|--------|------|-------------|--------|
| GET | `/candidate/dashboard` | Candidate dashboard stats | Candidate |
| GET | `/company/dashboard` | Company dashboard stats | Company |
| GET | `/company/analytics` | Company analytics data | Company |
| GET | `/company/:id` | Public company profile | Public |
| GET | `/candidate/:id` | Candidate profile | Company, Admin |

### Saved Jobs (`/api/saved-jobs`)

| Method | Path | Description | Access |
|--------|------|-------------|--------|
| GET | `/` | List saved jobs | Candidate |
| GET | `/check` | Check saved status (batch) | Candidate |
| POST | `/:jobId` | Toggle save/unsave job | Candidate |

### Notifications (`/api/notifications`)

| Method | Path | Description | Access |
|--------|------|-------------|--------|
| GET | `/` | List notifications | Authenticated |
| GET | `/unread-count` | Get unread count | Authenticated |
| PATCH | `/read-all` | Mark all as read | Authenticated |
| PATCH | `/:id/read` | Mark one as read | Authenticated |
| DELETE | `/:id` | Delete notification | Authenticated |

### Uploads (`/api/upload`)

| Method | Path | Description | Access |
|--------|------|-------------|--------|
| POST | `/cv` | Upload CV (PDF) | Candidate |
| POST | `/image` | Upload image (avatar/logo) | Authenticated |
| GET | `/cv/signed-url` | Get signed CV download URL | Authenticated |
| DELETE | `/` | Delete uploaded file | Authenticated |

### Admin (`/api/admin`)

| Method | Path | Description | Access |
|--------|------|-------------|--------|
| GET | `/dashboard` | Admin dashboard stats | Admin |
| GET | `/analytics` | Platform analytics | Admin |
| GET | `/users` | List all users | Admin |
| GET | `/users/:id` | Get user details | Admin |
| PATCH | `/users/:id/status` | Toggle user active status | Admin |
| PATCH | `/users/:id/role` | Change user role | Admin |
| DELETE | `/users/:id` | Delete user | Admin |
| GET | `/jobs` | List all jobs | Admin |
| PATCH | `/jobs/:id/featured` | Toggle job featured | Admin |
| DELETE | `/jobs/:id` | Delete job | Admin |
| GET | `/applications` | List all applications | Admin |

## Project Structure

```
├── server/
│   ├── index.js                 # Express app entry point
│   ├── config/
│   │   ├── db.js                # MongoDB connection
│   │   ├── email.js             # Nodemailer configuration
│   │   └── env.js               # Environment variable validation
│   ├── controllers/             # Route handlers (8 controllers)
│   ├── middlewares/
│   │   ├── auth.js              # JWT verification & role guards
│   │   ├── rateLimiter.js       # 8 specialized rate limiters
│   │   ├── securityHeaders.js   # Custom security headers
│   │   ├── sanitize.js          # Mongo-sanitize middleware
│   │   ├── auditLogger.js       # Audit log middleware
│   │   ├── upload.js            # Multer file upload config
│   │   ├── validate.js          # express-validator runner
│   │   ├── errorHandler.js      # Global error handler
│   │   └── requestId.js         # X-Request-Id tracking
│   ├── models/                  # Mongoose schemas (7 models)
│   ├── routes/                  # Express routers (8 route files)
│   ├── seed/
│   │   ├── adminSeed.js         # Admin user seeder
│   │   └── demoSeed.js          # Full demo data seeder
│   ├── services/
│   │   └── emailService.js      # Email sending service
│   ├── templates/emails/        # HTML email templates
│   ├── utils/                   # Utility functions
│   └── validators/              # Request validators (5 files)
│
├── client/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Router + layout setup
│       ├── index.css            # TailwindCSS imports
│       ├── api/                 # Axios service modules (9 files)
│       ├── contexts/            # Auth, Notification, Preferences
│       ├── hooks/               # useDebounce, useLocalStorage, usePagination
│       ├── utils/               # Constants, formatters, helpers
│       ├── components/
│       │   ├── common/          # Reusable UI components (17)
│       │   ├── guards/          # Route guard components (5)
│       │   ├── layout/          # Navbar, Footer, sidebar layouts
│       │   ├── jobs/            # JobCard, JobFilters, JobForm, ApplyModal
│       │   ├── applications/    # ApplicationDetailModal, StatusTimeline
│       │   └── notifications/   # NotificationDropdown, NotificationItem
│       └── pages/
│           ├── auth/            # Login, Register
│           ├── public/          # Home, JobList, JobDetail, CompanyProfile, 404
│           ├── candidate/       # Dashboard, MyApplications, SavedJobs
│           ├── company/         # Dashboard, MyJobs, CreateJob, EditJob, JobApplications, Analytics
│           ├── admin/           # Dashboard, ManageUsers, ManageJobs, ManageApplications
│           └── settings/        # Profile, Account, Notification settings
│
└── README.md
```

## Security Features

### Authentication

- JWT access tokens (15-min expiry) + refresh tokens (7-day rotation)
- Token versioning to invalidate all tokens on password change
- Password hashing with bcrypt (12 salt rounds)
- Password history tracking (prevents reuse of recent passwords)
- Account lockout after 5 failed attempts (30-minute cooldown)
- Auto-logout on user inactivity

### Authorization

- Role-based access control (Candidate, Company, Admin)
- Server-side route guards with `requireRole` middleware
- Client-side route guard components (ProtectedRoute, AdminRoute, CompanyRoute, CandidateRoute, GuestOnlyRoute)

### Input Validation

- Server-side request validation via express-validator
- MongoDB query sanitization (express-mongo-sanitize)
- Request body size limits (10KB)
- File type validation with magic-byte verification

### HTTP Security

- Helmet.js with strict Content Security Policy
- CORS with strict origin validation
- Custom security headers (X-Content-Type-Options, X-Frame-Options, Permissions-Policy)
- HSTS with preload
- DNS prefetch control disabled
- 8 specialized rate limiters covering all endpoints

### File Security

- Magic-byte file type validation (not just extension)
- EXIF data stripping from uploaded images
- Signed Cloudinary URLs for CV downloads
- File size restrictions per upload type
- Cloudinary-managed storage (no local file persistence)

### Monitoring

- Request ID tracking (X-Request-Id header)
- Comprehensive audit logging (action, user, IP, user-agent, method, path, status)
- TTL-based audit log cleanup (90-day retention)

## Deployment

A recommended deployment stack:

| Service | Provider | Purpose |
|---------|----------|---------|
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) | Cloud-hosted MongoDB |
| Backend | [Render](https://render.com/) | Node.js web service |
| Frontend | [Netlify](https://www.netlify.com/) | Static site hosting |

> All secrets are configured as environment variables on the hosting platform — never in source code.

### Quick Deployment Notes

1. **MongoDB Atlas:** Create a free cluster, whitelist Render's IP, copy the connection string.
2. **Render:** Create a Web Service from the `server/` directory. Set all environment variables. Start command: `node index.js`.
3. **Netlify:** Deploy the `client/` directory. Build command: `npm run build`. Publish directory: `dist`. Set `VITE_API_URL` to your Render backend URL.

## Contributing

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch: `git checkout -b feat/amazing-feature`
4. **Commit** your changes using conventional commits:
   - `feat:` — New feature
   - `fix:` — Bug fix
   - `refactor:` — Code refactoring
   - `docs:` — Documentation changes
   - `chore:` — Maintenance tasks
5. **Push** to your branch: `git push origin feat/amazing-feature`
6. **Open** a Pull Request

> The repository contains **no secrets** — all sensitive configuration is done via environment variables. Create your own `.env` files from the `.env.example` templates.

## License

This project is licensed under the [MIT License](LICENSE).

## Developer

**Serkan Bayraktar**

- [Website](https://serkanbayraktar.com/)
- [GitHub](https://github.com/Serkanbyx)
- [Email](mailto:serkanbyx1@gmail.com)

## Contact

- **Issues:** [GitHub Issues](https://github.com/Serkanbyx/job-board/issues)
- **Email:** [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)
- **Website:** [serkanbayraktar.com](https://serkanbayraktar.com/)

---

⭐ If you like this project, don't forget to give it a star!
