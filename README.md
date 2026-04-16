# 💼 Job Board w/ Company & User Dashboard

A full-featured, production-ready job board platform with role-based dashboards for candidates, companies, and administrators. Built with **React 19**, **Express 5**, and **MongoDB** — featuring advanced job search with 8-dimension filtering, a 6-state application workflow, file uploads via Cloudinary, in-app and email notifications, company hiring analytics, Swagger API documentation, and OWASP Top 10 compliant security hardening.

[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

---

## Features

- **Role-Based Dashboards** — Separate dashboards for candidates, companies, and administrators with tailored functionality and sidebar navigation
- **Advanced Job Search** — 8-dimension filtering (keyword, location, type, experience, education, salary range, skills, sort order) with URL-synced shareable links
- **6-State Application Workflow** — Full hiring pipeline from pending → reviewed → shortlisted → interviewed → offered → hired, with status history timeline
- **JWT Authentication** — Access + refresh token rotation, account lockout after failed attempts, auto-logout on inactivity
- **File Uploads via Cloudinary** — CV upload (PDF) with magic-byte validation, image uploads with EXIF stripping, signed download URLs
- **In-App & Email Notifications** — Real-time notification polling, transactional emails via Nodemailer with configurable user preferences
- **Company Hiring Analytics** — Hiring funnel visualization, application trends, conversion rates, and dashboard statistics
- **Profile Completion Tracker** — Percentage-based progress indicator with missing field checklist for candidates
- **Dark Mode** — System / light / dark theme modes with persistent preference via localStorage
- **Responsive Design** — Mobile-first approach with sidebar layouts, card-based tables, and skeleton loading states
- **Swagger API Documentation** — Interactive OpenAPI 3.0.3 spec available at `/api-docs`
- **Security Hardened** — Helmet CSP, 8 specialized rate limiters, JWT refresh rotation, password history, NoSQL injection prevention, audit logging

---

## Live Demo

[🚀 View Live Demo](https://job-board-with-company-user-dashboard.netlify.app/)

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@jobboard.com` | `Admin123!` |
| Company | `technova@jobboard.com` | `Demo123!` |
| Candidate | `ayse@jobboard.com` | `Demo123!` |

> Run `npm run seed:demo` in the server directory to populate the database with all demo data.

---

## Screenshots

| Home | Job List | Job Detail | Company Dashboard |
|------|----------|------------|-------------------|
| ![Home](https://via.placeholder.com/400x250?text=Home+Page) | ![Job List](https://via.placeholder.com/400x250?text=Job+List) | ![Job Detail](https://via.placeholder.com/400x250?text=Job+Detail) | ![Company Dashboard](https://via.placeholder.com/400x250?text=Company+Dashboard) |

| Candidate Dashboard | Admin Dashboard | Apply Modal | Company Profile |
|---------------------|-----------------|-------------|-----------------|
| ![Candidate Dashboard](https://via.placeholder.com/400x250?text=Candidate+Dashboard) | ![Admin Dashboard](https://via.placeholder.com/400x250?text=Admin+Dashboard) | ![Apply Modal](https://via.placeholder.com/400x250?text=Apply+Modal) | ![Company Profile](https://via.placeholder.com/400x250?text=Company+Profile) |

---

## Technologies

### Frontend

- **React 19**: Modern UI library with hooks and functional components for building interactive interfaces
- **React Router 7**: Client-side routing with nested layouts and route guards
- **Vite 8**: Lightning-fast build tool and development server with HMR
- **Tailwind CSS 4**: Utility-first CSS framework with custom theme tokens and dark mode support
- **Axios 1.15**: Promise-based HTTP client with interceptor support for token refresh
- **Lucide React**: Clean, consistent, and customizable icon library
- **React Hot Toast**: Lightweight notification toasts for user feedback

### Backend

- **Node.js**: Server-side JavaScript runtime
- **Express 5**: Fast, minimalist web framework with async error handling
- **MongoDB (Mongoose 9)**: NoSQL database with elegant object modeling and schema validation
- **JWT (jsonwebtoken 9 + bcryptjs 3)**: Secure token-based authentication with refresh rotation
- **Multer 2 + Cloudinary 2.9**: File upload middleware with cloud storage and signed URLs
- **express-validator 7**: Server-side request validation with sanitization
- **Nodemailer 8**: Transactional email service with HTML templates
- **Helmet 8 + CORS + express-rate-limit 8**: HTTP security middleware stack
- **express-mongo-sanitize**: NoSQL injection prevention
- **Swagger (swagger-jsdoc + swagger-ui-express)**: Interactive API documentation at `/api-docs`

---

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

---

## Installation

### Prerequisites

- **Node.js** v18+ and **npm** ([download](https://nodejs.org/))
- **MongoDB** 7+ — [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier) or [local instance](https://www.mongodb.com/try/download/community)
- **Cloudinary** account — for file uploads ([sign up](https://cloudinary.com/))
- **SMTP credentials** (optional) — for email notifications (e.g., Gmail App Password)

### Local Development

**1. Clone the repository:**

```bash
git clone https://github.com/Serkanbyx/job-board.git
cd job-board
```

**2. Set up environment variables:**

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**server/.env**

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/jobboard

JWT_SECRET=your_jwt_secret_min_32_chars_here

CORS_ORIGIN=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=JobBoard <noreply@jobboard.com>

CLIENT_URL=http://localhost:5173
```

**client/.env**

```env
VITE_API_URL=
```

> **Note:** Leave `VITE_API_URL` empty for development — Vite proxy handles `/api` requests to `http://localhost:5000`. Set it to your deployed backend URL for production.

**3. Install dependencies:**

```bash
cd server && npm install
cd ../client && npm install
```

**4. Seed the database:**

```bash
# Seed admin user (required)
cd server
npm run seed:admin

# (Optional) Seed full demo data — companies, jobs, candidates, applications
npm run seed:demo
```

**5. Run the application:**

```bash
# Terminal 1 — Backend (port 5000)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Environment Variables

#### Server (`server/.env`)

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

#### Client (`client/.env`)

| Variable | Description | Required | Example |
|----------|-------------|:--------:|---------|
| `VITE_API_URL` | Backend API base URL (empty for dev proxy) | No | *(empty for development)* |

---

## Usage

1. **Register** as a candidate or company from the registration page
2. **Browse jobs** on the public job listing page with advanced 8-dimension filters
3. **Apply to jobs** as a candidate by uploading your CV and writing a cover letter
4. **Track applications** from your candidate dashboard with real-time status updates and timeline
5. **Save jobs** to your bookmarks for later review
6. **Post jobs** as a company and manage them from the company dashboard
7. **Review applications** with the 6-state workflow — add notes, ratings, and bulk-update statuses
8. **View analytics** as a company to see hiring funnel, application trends, and conversion rates
9. **Manage the platform** as an admin — users, jobs, applications, and platform-wide analytics
10. **Customize preferences** — notification settings, profile details, dark/light theme

---

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

### Architecture

```
Client (React SPA)                    Server (Express API)
┌────────────────────┐               ┌────────────────────────┐
│ React Router 7     │   HTTP/JSON   │ Express 5 + Middleware  │
│ Context Providers  │ ────────────► │ Controllers → Services  │
│ Axios Interceptors │ ◄──────────── │ Mongoose Models → DB    │
└────────────────────┘               └────────────────────────┘
                                              │
                                     ┌────────┼────────┐
                                     ▼        ▼        ▼
                                  MongoDB  Cloudinary  SMTP
```

- **Frontend**: React SPA with client-side routing, context-based state management, and Axios interceptors for automatic token refresh
- **Backend**: RESTful Express API with layered architecture (routes → validators → controllers → models), 8 specialized rate limiters, and comprehensive audit logging
- **Database**: MongoDB with Mongoose ODM — 7 models with indexes, virtuals, TTL-based cleanup, and compound unique constraints

---

## API Endpoints

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/api/health` | No | API health check |

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/api/auth/register` | No | Register new user (candidate or company) |
| POST | `/api/auth/login` | No | Login and receive token pair |
| POST | `/api/auth/refresh-token` | No | Refresh access token using refresh token |
| POST | `/api/auth/logout` | Yes | Logout and revoke refresh token |
| POST | `/api/auth/logout-all` | Yes | Logout all sessions (revoke all tokens) |
| GET | `/api/auth/me` | Yes | Get current user profile |
| PUT | `/api/auth/profile` | Yes | Update user profile |
| PUT | `/api/auth/change-password` | Yes | Change password (invalidates all tokens) |
| DELETE | `/api/auth/account` | Yes | Delete own account |

### Jobs (`/api/jobs`)

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/api/jobs` | No | List jobs with filters and pagination |
| GET | `/api/jobs/stats` | No | Get filter statistics (counts by type, location, etc.) |
| GET | `/api/jobs/my-jobs` | Company | List company's own job postings |
| GET | `/api/jobs/:slug` | No | Get job details by slug |
| GET | `/api/jobs/:slug/similar` | No | Get similar job recommendations |
| POST | `/api/jobs` | Company | Create a new job posting |
| PUT | `/api/jobs/:id` | Company | Update job posting |
| PATCH | `/api/jobs/:id/toggle` | Company | Toggle job active/inactive status |
| DELETE | `/api/jobs/:id` | Company, Admin | Delete job posting |

### Applications (`/api`)

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/api/jobs/:jobId/apply` | Candidate | Apply to a job with CV and cover letter |
| GET | `/api/applications/mine` | Candidate | List own applications |
| GET | `/api/jobs/:jobId/applications` | Company, Admin | List applications for a specific job |
| GET | `/api/jobs/:jobId/applications/stats` | Company, Admin | Application statistics for a job |
| GET | `/api/applications/:id` | Yes | Get single application details |
| PATCH | `/api/applications/:id/status` | Company, Admin | Update application status |
| PATCH | `/api/applications/:id/notes` | Company, Admin | Update internal notes |
| PATCH | `/api/applications/bulk-status` | Company | Bulk update application statuses |
| DELETE | `/api/applications/:id` | Candidate | Withdraw application |

### Users (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/api/users/candidate/dashboard` | Candidate | Candidate dashboard statistics |
| GET | `/api/users/company/dashboard` | Company | Company dashboard statistics |
| GET | `/api/users/company/analytics` | Company | Company hiring analytics data |
| GET | `/api/users/company/:id` | No | Public company profile |
| GET | `/api/users/candidate/:id` | Company, Admin | View candidate profile |

### Saved Jobs (`/api/saved-jobs`)

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/api/saved-jobs` | Candidate | List saved jobs |
| GET | `/api/saved-jobs/check` | Candidate | Check saved status (batch) |
| POST | `/api/saved-jobs/:jobId` | Candidate | Toggle save/unsave job |

### Notifications (`/api/notifications`)

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/api/notifications` | Yes | List notifications |
| GET | `/api/notifications/unread-count` | Yes | Get unread notification count |
| PATCH | `/api/notifications/read-all` | Yes | Mark all notifications as read |
| PATCH | `/api/notifications/:id/read` | Yes | Mark single notification as read |
| DELETE | `/api/notifications/:id` | Yes | Delete a notification |

### Uploads (`/api/upload`)

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/api/upload/cv` | Candidate | Upload CV (PDF, max 5MB) |
| POST | `/api/upload/image` | Yes | Upload avatar or logo image (max 2MB) |
| GET | `/api/upload/cv/signed-url` | Yes | Get signed Cloudinary URL for CV download |
| DELETE | `/api/upload` | Yes | Delete uploaded file |

### Admin (`/api/admin`)

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/api/admin/dashboard` | Admin | Admin dashboard statistics |
| GET | `/api/admin/analytics` | Admin | Platform-wide analytics |
| GET | `/api/admin/users` | Admin | List all users with filters |
| GET | `/api/admin/users/:id` | Admin | Get user details |
| PATCH | `/api/admin/users/:id/status` | Admin | Toggle user active status |
| PATCH | `/api/admin/users/:id/role` | Admin | Change user role |
| DELETE | `/api/admin/users/:id` | Admin | Delete a user |
| GET | `/api/admin/jobs` | Admin | List all jobs |
| PATCH | `/api/admin/jobs/:id/featured` | Admin | Toggle job featured status |
| DELETE | `/api/admin/jobs/:id` | Admin | Delete a job |
| GET | `/api/admin/applications` | Admin | List all applications |

> Auth endpoints require `Authorization: Bearer <token>` header. Interactive API documentation is available at `/api-docs` (Swagger UI).

---

## Project Structure

```
job-board/
├── server/                          # Express backend
│   ├── index.js                     # App entry point
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   ├── email.js                 # Nodemailer transporter
│   │   ├── env.js                   # Environment variable validation
│   │   └── swagger.js               # OpenAPI 3.0.3 spec + Swagger UI
│   ├── controllers/
│   │   ├── adminController.js       # Admin CRUD operations
│   │   ├── applicationController.js # Application workflow logic
│   │   ├── authController.js        # Register, login, token management
│   │   ├── jobController.js         # Job CRUD + search + stats
│   │   ├── notificationController.js# Notification management
│   │   ├── savedJobController.js    # Save/unsave job toggles
│   │   ├── uploadController.js      # File upload + signed URLs
│   │   └── userController.js        # Dashboard + profile endpoints
│   ├── middlewares/
│   │   ├── auth.js                  # JWT verification + role guards
│   │   ├── rateLimiter.js           # 8 specialized rate limiters
│   │   ├── securityHeaders.js       # Custom security headers
│   │   ├── sanitize.js              # MongoDB query sanitization
│   │   ├── auditLogger.js           # Audit log middleware
│   │   ├── upload.js                # Multer file upload config
│   │   ├── validate.js              # express-validator runner
│   │   ├── errorHandler.js          # Global error handler
│   │   └── requestId.js             # X-Request-Id tracking
│   ├── models/
│   │   ├── User.js                  # User schema (candidate/company/admin)
│   │   ├── Job.js                   # Job posting schema with text index
│   │   ├── Application.js           # Application with status history
│   │   ├── Notification.js          # Notification with TTL cleanup
│   │   ├── RefreshToken.js          # Refresh token with SHA-256
│   │   ├── SavedJob.js              # Saved job bookmark
│   │   └── AuditLog.js             # Audit log with TTL cleanup
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── jobRoutes.js             # /api/jobs/*
│   │   ├── applicationRoutes.js     # /api/applications/*
│   │   ├── userRoutes.js            # /api/users/*
│   │   ├── savedJobRoutes.js        # /api/saved-jobs/*
│   │   ├── notificationRoutes.js    # /api/notifications/*
│   │   ├── uploadRoutes.js          # /api/upload/*
│   │   └── adminRoutes.js           # /api/admin/*
│   ├── seed/
│   │   ├── adminSeed.js             # Admin user seeder
│   │   └── demoSeed.js              # Full demo data seeder
│   ├── services/
│   │   └── emailService.js          # Email sending service
│   ├── templates/emails/            # HTML email templates
│   ├── utils/
│   │   ├── apiResponse.js           # Standardized API response helper
│   │   ├── cloudinary.js            # Cloudinary config + helpers
│   │   ├── createNotification.js    # Notification creation utility
│   │   ├── escapeRegex.js           # Regex escape for search
│   │   ├── fileValidator.js         # Magic-byte file validation
│   │   └── generateToken.js         # JWT token generation
│   └── validators/
│       ├── authValidator.js         # Auth request validation rules
│       ├── jobValidator.js          # Job request validation rules
│       ├── applicationValidator.js  # Application validation rules
│       ├── adminValidator.js        # Admin operation validations
│       └── savedJobValidator.js     # Saved job validation rules
│
├── client/                          # React frontend
│   ├── index.html                   # Vite HTML shell
│   ├── vite.config.js               # Vite + React + Tailwind + proxy
│   ├── eslint.config.js             # ESLint flat config
│   ├── package.json
│   ├── .env.example
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── _redirects               # SPA redirect rules (Netlify)
│   └── src/
│       ├── main.jsx                 # React bootstrap + providers
│       ├── App.jsx                  # Route definitions + layouts
│       ├── index.css                # Tailwind v4 imports + theme tokens
│       ├── api/
│       │   ├── axiosInstance.js      # Base URL + interceptors
│       │   ├── authService.js        # Auth API calls
│       │   ├── jobService.js         # Job API calls
│       │   ├── applicationService.js # Application API calls
│       │   ├── savedJobService.js    # Saved job API calls
│       │   ├── userService.js        # User/dashboard API calls
│       │   ├── uploadService.js      # File upload API calls
│       │   ├── notificationService.js# Notification API calls
│       │   └── adminService.js       # Admin API calls
│       ├── contexts/
│       │   ├── AuthContext.jsx       # Auth state + token management
│       │   ├── NotificationContext.jsx # Notification polling + state
│       │   └── PreferencesContext.jsx  # Theme + UI preferences
│       ├── hooks/
│       │   ├── useDebounce.js        # Debounced value hook
│       │   ├── useLocalStorage.js    # Persistent localStorage hook
│       │   └── usePagination.js      # Pagination logic hook
│       ├── utils/
│       │   ├── constants.js          # App-wide constants + enums
│       │   ├── formatDate.js         # Date formatting helpers
│       │   └── helpers.js            # General utility functions
│       ├── components/
│       │   ├── common/              # 17 reusable UI components
│       │   ├── guards/              # 5 route guard components
│       │   ├── layout/              # Navbar, Footer, sidebar layouts
│       │   ├── jobs/                # JobCard, JobFilters, JobForm, ApplyModal
│       │   ├── applications/        # ApplicationDetailModal, StatusTimeline
│       │   └── notifications/       # NotificationDropdown, NotificationItem
│       └── pages/
│           ├── auth/                # LoginPage, RegisterPage
│           ├── public/              # Home, JobList, JobDetail, CompanyProfile, 404
│           ├── candidate/           # Dashboard, MyApplications, SavedJobs
│           ├── company/             # Dashboard, MyJobs, CreateJob, EditJob, JobApplications, Analytics
│           ├── admin/               # Dashboard, ManageUsers, ManageJobs, ManageApplications
│           └── settings/            # Profile, Account, Notification settings
│
└── README.md
```

---

## Security

- **JWT Dual-Token Strategy** — Access tokens (15-min expiry) with single-use refresh tokens (7-day rotation) and token versioning
- **Password Hashing** — bcrypt with 12 salt rounds and password history tracking to prevent reuse
- **Account Lockout** — Automatic lockout after 5 failed login attempts with 30-minute cooldown
- **Role-Based Access Control** — Server-side `requireRole` middleware + 5 client-side route guard components
- **Helmet CSP** — Strict Content Security Policy, HSTS with preload, X-Content-Type-Options, X-Frame-Options, Permissions-Policy
- **CORS Whitelist** — Strict origin validation from environment configuration
- **8 Specialized Rate Limiters** — Global, auth, password, upload, application, admin, search, and sensitive operation limiters
- **Input Validation** — Server-side request validation via express-validator with sanitization
- **NoSQL Injection Prevention** — MongoDB query sanitization via express-mongo-sanitize
- **Request Body Limits** — 10KB size restriction on JSON/URL-encoded payloads
- **File Security** — Magic-byte type validation (not just extension), EXIF data stripping, signed Cloudinary URLs, per-type size limits
- **Audit Logging** — Comprehensive logging (action, user, IP, user-agent, method, path, status) with TTL-based 90-day retention
- **Request Tracking** — UUID-based X-Request-Id header for every request

---

## Deployment

### Backend (Render)

1. Create a **Web Service** on [Render](https://render.com/) from the `server/` directory
2. Set **Build Command** to `npm install`
3. Set **Start Command** to `node index.js`
4. Configure environment variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Strong random string (min 32 chars) |
| `CORS_ORIGIN` | Your Netlify frontend URL |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `CLIENT_URL` | Your Netlify frontend URL |

> Configure SMTP variables if you want email notifications enabled.

### Frontend (Netlify)

1. Deploy the `client/` directory on [Netlify](https://www.netlify.com/)
2. Set **Build Command** to `npm run build`
3. Set **Publish Directory** to `dist`
4. Configure environment variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Render backend URL (e.g., `https://your-api.onrender.com`) |

> The `_redirects` file in `public/` handles SPA routing on Netlify automatically.

### Database (MongoDB Atlas)

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Whitelist your Render service IP (or `0.0.0.0/0` for dynamic IPs)
3. Create a database user and copy the connection string
4. Paste the connection string as `MONGO_URI` in your Render environment

---

## Features in Detail

### Completed Features

- ✅ JWT authentication with access + refresh token rotation
- ✅ Role-based dashboards (Candidate, Company, Admin)
- ✅ Advanced job search with 8-dimension filtering
- ✅ 6-state application workflow with timeline
- ✅ File uploads via Cloudinary (CV + images)
- ✅ In-app notification system with polling
- ✅ Transactional email notifications via Nodemailer
- ✅ Company hiring analytics (funnel, trends, rates)
- ✅ Profile completion tracker for candidates
- ✅ Dark mode with system/light/dark toggle
- ✅ Responsive mobile-first design
- ✅ Swagger API documentation
- ✅ OWASP Top 10 security compliance
- ✅ Audit logging with 90-day TTL retention
- ✅ Demo data seeder for testing

### Future Features

- 🔮 [ ] Real-time notifications via WebSocket
- 🔮 [ ] Advanced resume parsing with AI
- 🔮 [ ] Interview scheduling integration
- 🔮 [ ] Multi-language support (i18n)
- 🔮 [ ] Two-factor authentication (2FA)
- 🔮 [ ] Social login (Google, LinkedIn, GitHub)

---

## Contributing

1. **Fork** the repository
2. **Clone** your fork locally: `git clone https://github.com/your-username/job-board.git`
3. **Create** a feature branch: `git checkout -b feat/amazing-feature`
4. **Commit** your changes with conventional commit messages
5. **Push** to your branch: `git push origin feat/amazing-feature`
6. **Open** a Pull Request

### Commit Message Format

| Prefix | Description |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code refactoring |
| `docs:` | Documentation changes |
| `chore:` | Maintenance and dependency updates |

> The repository contains **no secrets** — all sensitive configuration is done via environment variables. Create your own `.env` files from the `.env.example` templates.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Developer

**Serkanby**

- 🌐 Website: [serkanbayraktar.com](https://serkanbayraktar.com/)
- 💻 GitHub: [@Serkanbyx](https://github.com/Serkanbyx)
- 📧 Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)

---

## Acknowledgments

- [React](https://react.dev/) — UI library
- [Express](https://expressjs.com/) — Web framework
- [MongoDB](https://www.mongodb.com/) — Database
- [Tailwind CSS](https://tailwindcss.com/) — CSS framework
- [Vite](https://vite.dev/) — Build tool
- [Cloudinary](https://cloudinary.com/) — Cloud file storage
- [Lucide](https://lucide.dev/) — Icon library
- [Swagger](https://swagger.io/) — API documentation

---

## Contact

- [Open an Issue](https://github.com/Serkanbyx/job-board/issues)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)
- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)

---

⭐ If you like this project, don't forget to give it a star!
