import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Job Board API',
    version,
    description:
      'A full-featured, production-ready job board REST API with role-based access control (Candidate, Company, Admin), JWT authentication with refresh token rotation, 6-state application workflow, Cloudinary file uploads, in-app & email notifications, and OWASP-compliant security hardening.',
    contact: {
      name: 'Serkanby',
      url: 'https://serkanbayraktar.com/',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API Base Path',
    },
  ],
  tags: [
    { name: 'Health', description: 'Server health check' },
    { name: 'Auth', description: 'Authentication & account management' },
    { name: 'Jobs', description: 'Job listing CRUD & search' },
    { name: 'Applications', description: '6-state application workflow' },
    { name: 'Users', description: 'User profiles & dashboards' },
    { name: 'Saved Jobs', description: 'Candidate saved/bookmarked jobs' },
    { name: 'Notifications', description: 'In-app notification management' },
    { name: 'Uploads', description: 'CV & image uploads via Cloudinary' },
    { name: 'Admin', description: 'Platform administration' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token obtained from POST /auth/login',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6651abc123def456789' },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          role: { type: 'string', enum: ['candidate', 'company', 'admin'] },
          phone: { type: 'string' },
          avatar: { type: 'string' },
          location: { type: 'string' },
          isActive: { type: 'boolean' },
          title: { type: 'string', description: 'Candidate professional title' },
          bio: { type: 'string' },
          skills: { type: 'array', items: { type: 'string' } },
          experience: { type: 'string', enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'manager'] },
          companyName: { type: 'string', description: 'Company display name' },
          companyLogo: { type: 'string' },
          companyWebsite: { type: 'string' },
          companyLocation: { type: 'string' },
          companySize: { type: 'string', enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'] },
          companyIndustry: { type: 'string', enum: ['technology', 'finance', 'healthcare', 'education', 'marketing', 'retail', 'manufacturing', 'consulting', 'media', 'other'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Job: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'Senior Frontend Developer' },
          slug: { type: 'string', example: 'senior-frontend-developer-a1b2c' },
          description: { type: 'string' },
          requirements: { type: 'string' },
          responsibilities: { type: 'string' },
          benefits: { type: 'string' },
          company: { $ref: '#/components/schemas/User' },
          location: { type: 'string', example: 'Istanbul, Turkey' },
          type: { type: 'string', enum: ['full-time', 'part-time', 'remote', 'contract', 'internship', 'hybrid'] },
          salary: {
            type: 'object',
            properties: {
              min: { type: 'number' },
              max: { type: 'number' },
              currency: { type: 'string', default: 'USD' },
              period: { type: 'string', enum: ['hourly', 'monthly', 'yearly'] },
            },
          },
          skills: { type: 'array', items: { type: 'string' }, example: ['React', 'TypeScript', 'Node.js'] },
          experience: { type: 'string', enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'any'] },
          education: { type: 'string', enum: ['none', 'high-school', 'associate', 'bachelor', 'master', 'doctorate', 'any'] },
          department: { type: 'string' },
          positions: { type: 'integer', default: 1 },
          deadline: { type: 'string', format: 'date-time' },
          isActive: { type: 'boolean' },
          isFeatured: { type: 'boolean' },
          views: { type: 'integer' },
          applicationCount: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Application: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          job: { $ref: '#/components/schemas/Job' },
          candidate: { $ref: '#/components/schemas/User' },
          company: { $ref: '#/components/schemas/User' },
          cvUrl: { type: 'string' },
          coverLetter: { type: 'string' },
          expectedSalary: {
            type: 'object',
            properties: {
              min: { type: 'number' },
              max: { type: 'number' },
              currency: { type: 'string' },
            },
          },
          availableFrom: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected', 'withdrawn'] },
          statusNote: { type: 'string' },
          statusHistory: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                note: { type: 'string' },
                changedAt: { type: 'string', format: 'date-time' },
                changedBy: { type: 'string' },
              },
            },
          },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          internalNotes: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          recipient: { type: 'string' },
          sender: { type: 'string' },
          type: { type: 'string', enum: ['new_application', 'status_update', 'job_deactivated', 'application_withdrawn', 'account_update', 'system'] },
          title: { type: 'string' },
          message: { type: 'string' },
          link: { type: 'string' },
          isRead: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Missing or invalid authentication token',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Forbidden: {
        description: 'Insufficient permissions for this action',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      NotFound: {
        description: 'Requested resource not found',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      ValidationFailed: {
        description: 'Request validation failed',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } },
      },
      TooManyRequests: {
        description: 'Rate limit exceeded — try again later',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
  },
  paths: {
    /* ─── Health ─── */
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'API health check',
        description: 'Returns current server status, timestamp, and environment.',
        responses: {
          200: {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'JobBoard API is running' },
                    timestamp: { type: 'string', format: 'date-time' },
                    environment: { type: 'string', example: 'development' },
                  },
                },
              },
            },
          },
        },
      },
    },

    /* ─── Auth ─── */
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Creates a candidate or company account. Returns access + refresh tokens.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'email', 'password', 'role'],
                properties: {
                  firstName: { type: 'string', minLength: 2, maxLength: 50 },
                  lastName: { type: 'string', minLength: 2, maxLength: 50 },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6, description: 'Min 6 chars, must include uppercase, lowercase, and number' },
                  role: { type: 'string', enum: ['candidate', 'company'] },
                  companyName: { type: 'string', description: 'Required when role is company' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationFailed' },
          409: { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        description: 'Authenticates user and returns access + refresh tokens.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid credentials or account locked', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        description: 'Exchanges a valid refresh token for a new access + refresh token pair (single-use rotation).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Tokens refreshed successfully' },
          401: { description: 'Invalid or expired refresh token' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout',
        description: 'Revokes the provided refresh token.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Logged out successfully' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/logout-all': {
      post: {
        tags: ['Auth'],
        summary: 'Logout all sessions',
        description: 'Revokes all refresh tokens for the authenticated user.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'All sessions terminated' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        description: 'Returns the authenticated user\'s full profile data.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile retrieved',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/User' } } } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/profile': {
      put: {
        tags: ['Auth'],
        summary: 'Update profile',
        description: 'Updates the authenticated user\'s profile fields (name, phone, location, bio, skills, company details, etc.).',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  phone: { type: 'string' },
                  location: { type: 'string' },
                  bio: { type: 'string' },
                  title: { type: 'string' },
                  skills: { type: 'array', items: { type: 'string' } },
                  companyName: { type: 'string' },
                  companyWebsite: { type: 'string' },
                  companyLocation: { type: 'string' },
                  companySize: { type: 'string' },
                  companyAbout: { type: 'string' },
                  companyIndustry: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated' },
          400: { $ref: '#/components/responses/ValidationFailed' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/change-password': {
      put: {
        tags: ['Auth'],
        summary: 'Change password',
        description: 'Changes the user\'s password. Invalidates all existing tokens (token versioning).',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password changed — all sessions invalidated' },
          400: { description: 'Current password incorrect or new password reused' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/account': {
      delete: {
        tags: ['Auth'],
        summary: 'Delete own account',
        description: 'Permanently deletes the authenticated user\'s account and related data.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password'],
                properties: {
                  password: { type: 'string', description: 'Current password for confirmation' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Account deleted' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    /* ─── Jobs ─── */
    '/jobs': {
      get: {
        tags: ['Jobs'],
        summary: 'List jobs with filters',
        description: 'Returns paginated job listings with 8-dimension filtering: keyword, location, type, experience, education, salary range, skills, and sort order.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } },
          { name: 'keyword', in: 'query', schema: { type: 'string' }, description: 'Full-text search in title, description, skills' },
          { name: 'location', in: 'query', schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['full-time', 'part-time', 'remote', 'contract', 'internship', 'hybrid'] } },
          { name: 'experience', in: 'query', schema: { type: 'string' } },
          { name: 'education', in: 'query', schema: { type: 'string' } },
          { name: 'salaryMin', in: 'query', schema: { type: 'number' } },
          { name: 'salaryMax', in: 'query', schema: { type: 'number' } },
          { name: 'skills', in: 'query', schema: { type: 'string' }, description: 'Comma-separated skill list' },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest', 'salary-high', 'salary-low', 'most-viewed'] } },
        ],
        responses: {
          200: {
            description: 'Paginated job list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Job' } },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        total: { type: 'integer' },
                        pages: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Jobs'],
        summary: 'Create a new job',
        description: 'Creates a job listing. Only accessible by company accounts.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description', 'location', 'type', 'skills'],
                properties: {
                  title: { type: 'string', minLength: 3, maxLength: 150 },
                  description: { type: 'string', minLength: 50, maxLength: 10000 },
                  requirements: { type: 'string' },
                  responsibilities: { type: 'string' },
                  benefits: { type: 'string' },
                  location: { type: 'string' },
                  type: { type: 'string', enum: ['full-time', 'part-time', 'remote', 'contract', 'internship', 'hybrid'] },
                  salary: {
                    type: 'object',
                    properties: {
                      min: { type: 'number' },
                      max: { type: 'number' },
                      currency: { type: 'string' },
                      period: { type: 'string', enum: ['hourly', 'monthly', 'yearly'] },
                    },
                  },
                  skills: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 15 },
                  experience: { type: 'string' },
                  education: { type: 'string' },
                  department: { type: 'string' },
                  positions: { type: 'integer', minimum: 1 },
                  deadline: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Job created' },
          400: { $ref: '#/components/responses/ValidationFailed' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/jobs/stats': {
      get: {
        tags: ['Jobs'],
        summary: 'Get job filter statistics',
        description: 'Returns aggregated counts for types, locations, experience levels, etc. Used to populate filter sidebar.',
        responses: {
          200: { description: 'Filter statistics' },
        },
      },
    },
    '/jobs/my-jobs': {
      get: {
        tags: ['Jobs'],
        summary: 'List company\'s own jobs',
        description: 'Returns all jobs posted by the authenticated company.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Company job list' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/jobs/{slug}': {
      get: {
        tags: ['Jobs'],
        summary: 'Get job by slug',
        description: 'Returns a single job by its URL-friendly slug. Increments view count.',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Job details', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Job' } } } } } },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/jobs/{slug}/similar': {
      get: {
        tags: ['Jobs'],
        summary: 'Get similar jobs',
        description: 'Returns jobs similar to the given job based on skills, type, and location.',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Similar jobs list' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/jobs/{id}': {
      put: {
        tags: ['Jobs'],
        summary: 'Update a job',
        description: 'Updates a job listing. Only the owning company or an admin can update.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', description: 'Same fields as create job (all optional)' } } },
        },
        responses: {
          200: { description: 'Job updated' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Jobs'],
        summary: 'Delete a job',
        description: 'Permanently removes a job listing and its associated applications.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Job deleted' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/jobs/{id}/toggle': {
      patch: {
        tags: ['Jobs'],
        summary: 'Toggle job active status',
        description: 'Activates or deactivates a job listing.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Job status toggled' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    /* ─── Applications ─── */
    '/jobs/{jobId}/apply': {
      post: {
        tags: ['Applications'],
        summary: 'Apply to a job',
        description: 'Submits an application for a job. Candidate must have a CV uploaded.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  coverLetter: { type: 'string', maxLength: 5000 },
                  expectedSalary: {
                    type: 'object',
                    properties: {
                      min: { type: 'number' },
                      max: { type: 'number' },
                      currency: { type: 'string' },
                    },
                  },
                  availableFrom: { type: 'string', format: 'date' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Application submitted' },
          400: { description: 'Already applied or CV missing' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/applications/mine': {
      get: {
        tags: ['Applications'],
        summary: 'List own applications',
        description: 'Returns all applications submitted by the authenticated candidate.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Paginated application list' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/jobs/{jobId}/applications': {
      get: {
        tags: ['Applications'],
        summary: 'List applications for a job',
        description: 'Returns all applications for a specific job. Accessible by the job\'s company or admins.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Application list for the job' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/jobs/{jobId}/applications/stats': {
      get: {
        tags: ['Applications'],
        summary: 'Application statistics for a job',
        description: 'Returns status breakdown and counts for a specific job\'s applications.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Application stats' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/applications/{id}': {
      get: {
        tags: ['Applications'],
        summary: 'Get single application',
        description: 'Returns detailed application data including status history timeline.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Application details', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Application' } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Applications'],
        summary: 'Withdraw application',
        description: 'Candidate withdraws their application. Only available before "hired" status.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Application withdrawn' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/applications/{id}/status': {
      patch: {
        tags: ['Applications'],
        summary: 'Update application status',
        description: 'Transitions application status (e.g., pending → reviewed → shortlisted → interviewed → offered → hired/rejected).',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['reviewed', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected'] },
                  note: { type: 'string', maxLength: 1000 },
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status updated' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/applications/{id}/notes': {
      patch: {
        tags: ['Applications'],
        summary: 'Update internal notes',
        description: 'Adds or updates internal notes visible only to the company.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['internalNotes'],
                properties: {
                  internalNotes: { type: 'string', maxLength: 2000 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Notes updated' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/applications/bulk-status': {
      patch: {
        tags: ['Applications'],
        summary: 'Bulk update application statuses',
        description: 'Updates status for multiple applications at once.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['applicationIds', 'status'],
                properties: {
                  applicationIds: { type: 'array', items: { type: 'string' } },
                  status: { type: 'string' },
                  note: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Bulk update completed' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    /* ─── Users ─── */
    '/users/candidate/dashboard': {
      get: {
        tags: ['Users'],
        summary: 'Candidate dashboard stats',
        description: 'Returns application counts, status breakdown, and recent activity for the candidate.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Dashboard statistics' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/users/company/dashboard': {
      get: {
        tags: ['Users'],
        summary: 'Company dashboard stats',
        description: 'Returns job counts, application counts, and recent activity for the company.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Dashboard statistics' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/users/company/analytics': {
      get: {
        tags: ['Users'],
        summary: 'Company analytics',
        description: 'Returns hiring funnel visualization, application trends, conversion rates, and detailed analytics.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Analytics data' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/users/company/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Public company profile',
        description: 'Returns public company profile info and active job listings.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Company profile' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/users/candidate/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Candidate profile',
        description: 'Returns candidate profile. Accessible by companies and admins.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Candidate profile' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    /* ─── Saved Jobs ─── */
    '/saved-jobs': {
      get: {
        tags: ['Saved Jobs'],
        summary: 'List saved jobs',
        description: 'Returns all jobs bookmarked by the candidate.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Saved job list' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/saved-jobs/check': {
      get: {
        tags: ['Saved Jobs'],
        summary: 'Check saved status (batch)',
        description: 'Checks if multiple jobs are saved by the candidate. Used for UI state.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'jobIds', in: 'query', required: true, schema: { type: 'string' }, description: 'Comma-separated job IDs' },
        ],
        responses: {
          200: { description: 'Map of jobId → isSaved' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/saved-jobs/{jobId}': {
      post: {
        tags: ['Saved Jobs'],
        summary: 'Toggle save/unsave job',
        description: 'Saves the job if not already saved, or removes it if already saved.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Toggled successfully' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    /* ─── Notifications ─── */
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List notifications',
        description: 'Returns paginated notifications for the authenticated user.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: {
            description: 'Notification list',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Notification' } } } } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Get unread count',
        description: 'Returns the number of unread notifications.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Unread notification count',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { count: { type: 'integer' } } } } } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all as read',
        description: 'Marks all unread notifications as read.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'All notifications marked as read' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark one as read',
        description: 'Marks a single notification as read.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Notification marked as read' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/notifications/{id}': {
      delete: {
        tags: ['Notifications'],
        summary: 'Delete notification',
        description: 'Permanently removes a notification.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Notification deleted' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    /* ─── Uploads ─── */
    '/upload/cv': {
      post: {
        tags: ['Uploads'],
        summary: 'Upload CV (PDF)',
        description: 'Uploads a PDF CV to Cloudinary. Magic-byte validation ensures genuine PDF files only.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  cv: { type: 'string', format: 'binary', description: 'PDF file (max 5MB)' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'CV uploaded', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { url: { type: 'string' } } } } } } } },
          400: { description: 'Invalid file type or size' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/upload/image': {
      post: {
        tags: ['Uploads'],
        summary: 'Upload image (avatar/logo)',
        description: 'Uploads a JPEG/PNG image for profile avatar or company logo. EXIF data is stripped.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  image: { type: 'string', format: 'binary', description: 'JPEG/PNG (max 2MB)' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Image uploaded', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { url: { type: 'string' } } } } } } } },
          400: { description: 'Invalid file type or size' },
          401: { $ref: '#/components/responses/Unauthorized' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/upload/cv/signed-url': {
      get: {
        tags: ['Uploads'],
        summary: 'Get signed CV download URL',
        description: 'Generates a time-limited signed URL for secure CV download.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Signed URL generated' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { description: 'No CV found' },
        },
      },
    },
    '/upload': {
      delete: {
        tags: ['Uploads'],
        summary: 'Delete uploaded file',
        description: 'Removes an uploaded file (CV or image) from Cloudinary.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['publicId'],
                properties: {
                  publicId: { type: 'string', description: 'Cloudinary public ID' },
                  resourceType: { type: 'string', enum: ['image', 'raw'], default: 'image' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'File deleted' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    /* ─── Admin ─── */
    '/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Admin dashboard stats',
        description: 'Returns platform-wide statistics: total users, jobs, applications, recent activity.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Platform statistics' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/analytics': {
      get: {
        tags: ['Admin'],
        summary: 'Platform analytics',
        description: 'Returns detailed platform analytics: user growth, job trends, application funnels.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Analytics data' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List all users',
        description: 'Returns paginated list of all users with search and filter options.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'role', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'User list' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/users/{id}': {
      get: {
        tags: ['Admin'],
        summary: 'Get user details',
        description: 'Returns detailed user profile with activity summary.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'User details' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/admin/users/{id}/status': {
      patch: {
        tags: ['Admin'],
        summary: 'Toggle user active status',
        description: 'Activates or deactivates a user account.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['isActive'],
                properties: {
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'User status updated' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/users/{id}/role': {
      patch: {
        tags: ['Admin'],
        summary: 'Change user role',
        description: 'Changes a user\'s role (candidate, company, admin).',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['role'],
                properties: {
                  role: { type: 'string', enum: ['candidate', 'company', 'admin'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'User role updated' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/users/{id}': {
      delete: {
        tags: ['Admin'],
        summary: 'Delete user',
        description: 'Permanently removes a user and their associated data.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'User deleted' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/jobs': {
      get: {
        tags: ['Admin'],
        summary: 'List all jobs (admin)',
        description: 'Returns paginated list of all jobs with admin-level details.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Job list' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/jobs/{id}/featured': {
      patch: {
        tags: ['Admin'],
        summary: 'Toggle job featured',
        description: 'Marks or unmarks a job as featured.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Featured status toggled' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/jobs/{id}': {
      delete: {
        tags: ['Admin'],
        summary: 'Delete job (admin)',
        description: 'Admin force-deletes a job listing.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Job deleted' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/applications': {
      get: {
        tags: ['Admin'],
        summary: 'List all applications (admin)',
        description: 'Returns paginated list of all applications across the platform.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Application list' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
  },
};

const swaggerSpec = swaggerDefinition;

/**
 * @param {import('express').Application} app
 */
const setupSwagger = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Job Board API Documentation',
      customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { font-size: 2rem; }
      `,
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        tagsSorter: 'alpha',
      },
    })
  );
};

export { swaggerSpec, setupSwagger };
