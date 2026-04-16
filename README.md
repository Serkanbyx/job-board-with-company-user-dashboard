# Job Board w/ Company & User Dashboard

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7+-47A248?logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Description

A full-featured, production-ready job board platform with role-based dashboards for candidates, companies, and administrators. Built with React 19, Express 5, and MongoDB, it delivers professional-grade features including advanced job search with 8 filter dimensions, a 6-state application workflow with status history timeline, file uploads via Cloudinary, in-app and email notifications, company analytics with hiring funnel visualizations, and a profile completion tracker. The platform is security-hardened with OWASP Top 10 compliance, JWT refresh token rotation, rate limiting, and comprehensive audit logging.

## Screenshots

| Home | Job List | Job Detail | Company Dashboard |
|------|----------|------------|-------------------|
| ![Home](https://via.placeholder.com/400x250?text=Home+Page) | ![Job List](https://via.placeholder.com/400x250?text=Job+List) | ![Job Detail](https://via.placeholder.com/400x250?text=Job+Detail) | ![Company Dashboard](https://via.placeholder.com/400x250?text=Company+Dashboard) |

| Candidate Dashboard | Admin Dashboard | Apply Modal | Company Profile |
|---------------------|-----------------|-------------|-----------------|
| ![Candidate Dashboard](https://via.placeholder.com/400x250?text=Candidate+Dashboard) | ![Admin Dashboard](https://via.placeholder.com/400x250?text=Admin+Dashboard) | ![Apply Modal](https://via.placeholder.com/400x250?text=Apply+Modal) | ![Company Profile](https://via.placeholder.com/400x250?text=Company+Profile) |

## Features

### Authentication & Authorization
- JWT access + refresh token authentication with secure rotation
- Three user roles: Candidate, Company, Admin
- Role-based route guards on both client and server
- Account lockout after 5 failed login attempts (30-min cooldown)
- Auto-logout on inactivity

### Job Management
- Full CRUD operations for company users
- SEO-friendly slug-based URLs
- Featured job highlighting
- Toggle active / inactive status
- Similar jobs recommendation

### Advanced Search & Filters
- 8-dimension filtering: keyword, location, type, experience, education, salary range, skills, sort order
- URL-synced filter state for shareable search links
- Stats-powered filter counts
- Debounced search input

### Application System
- 6-state workflow: pending → reviewed → shortlisted → interviewed → offered → hired (+ rejected / withdrawn)
- Status history timeline with timestamps
- Bulk status update operations
- Internal notes and rating per application
- Cover letter and expected salary support

### File Uploads
- CV upload (PDF) with magic-byte validation
- Image upload (avatar, company logo) with EXIF stripping
- Cloudinary integration with signed URLs
- File size and type restrictions

### Saved Jobs
- Bookmark toggle (save / unsave)
- Batch saved-status check for job listings
- Dedicated saved jobs page for candidates

### In-App Notifications
- Real-time polling with notification bell and unread count
- Mark as read / mark all as read
- Auto-generated notifications for application events
- TTL-based auto-cleanup (90 days)

### Email Notifications
- Transactional emails via Nodemailer (SMTP)
- Welcome email, application received, status update templates
- User-configurable notification preferences
- Graceful fallback when SMTP is not configured

### Company Analytics
- Hiring funnel visualization
- Application trends over time
- Conversion rates by status
- Dashboard statistics (total jobs, applications, views)

### Profile Completion Tracker
- Percentage-based progress indicator
- Checklist of missing profile fields
- Encourages complete profiles for better visibility

### Dark Mode
- System / light / dark theme modes
- Persistent preference via localStorage
- Smooth transitions between themes

### Responsive Design
- Mobile-first approach
- Sidebar layouts for dashboards
- Card-based responsive tables
- Skeleton loading states

### Security Hardened
- Helmet CSP with strict directives
- CORS strict-origin validation
- 8 specialized rate limiters (global, auth, search, application, upload, password, sensitive-op, admin)
- Account lockout after failed login attempts
- JWT refresh token rotation with token versioning
- Password history (prevents reuse)
- Magic-byte file validation
- Signed Cloudinary CV URLs
- EXIF stripping on uploaded images
- Comprehensive audit logging
- Mongo-sanitize against NoSQL injection
- OWASP Top 10 compliance
- Auto-logout on inactivity

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router 7, Vite 8 |
| **Styling** | TailwindCSS 4 |
| **Icons** | Lucide React |
| **Notifications (UI)** | React Hot Toast |
| **HTTP Client** | Axios |
| **Backend** | Express 5, Node.js 18+ |
| **Database** | MongoDB 7+ (Mongoose 9) |
| **Authentication** | JWT (access + refresh tokens), bcryptjs |
| **File Upload** | Multer → Cloudinary |
| **Validation** | express-validator |
| **Email** | Nodemailer |
| **Security** | Helmet, CORS, express-rate-limit, express-mongo-sanitize |

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

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@jobboard.com` | `Admin123!` |
| Company | `technova@jobboard.com` | `Demo123!` |
| Candidate | `ayse@jobboard.com` | `Demo123!` |

> Run `npm run seed:demo` in the server directory to populate the database with all demo data.

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

## Getting Started

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **MongoDB** 7+ ([download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Cloudinary** account ([sign up](https://cloudinary.com/)) — for file uploads
- **SMTP credentials** (optional) — for email notifications (e.g., Gmail App Password)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/job-board.git
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

# (Optional) Seed full demo data
npm run seed:demo
```

### Development

```bash
# Terminal 1 — Start backend
cd server
npm run dev

# Terminal 2 — Start frontend
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

## Deployment Guide

A recommended deployment stack:

| Service | Provider | Purpose |
|---------|----------|---------|
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) | Cloud-hosted MongoDB |
| Backend | [Render](https://render.com/) | Node.js web service |
| Frontend | [Netlify](https://www.netlify.com/) | Static site hosting |

> All secrets are configured as environment variables on the hosting platform — never in source code. For a detailed step-by-step deployment guide, see **STEP 38** in `STEPS.md`.

### Quick Deployment Notes

1. **MongoDB Atlas:** Create a free cluster, whitelist Render's IP, copy connection string.
2. **Render:** Create a Web Service from the `server/` directory. Set all environment variables. Start command: `node index.js`.
3. **Netlify:** Deploy the `client/` directory. Build command: `npm run build`. Publish directory: `dist`. Set `VITE_API_URL` to your Render backend URL.

## Contributing / Fork Guide

To use this project:

1. **Fork** the repository to your own GitHub account.
2. **Clone** your fork locally.
3. Create your own `.env` files from the `.env.example` templates in both `server/` and `client/`.
4. Configure your own **Cloudinary**, **SMTP**, and **MongoDB** credentials.
5. Run `npm run seed:admin` (and optionally `npm run seed:demo`) to set up the database.

> The repository contains **no secrets** — all sensitive configuration is done via environment variables.

## License

This project is licensed under the [MIT License](LICENSE).
