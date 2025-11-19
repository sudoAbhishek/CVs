# CVs Server

Backend API for the resume builder application built with **Node.js** and **Express**.

## Tech Stack

- **Express** (^5.1.0) — Web framework
- **MongoDB** via Mongoose (^8.19.2) — Database
- **JWT** (jsonwebtoken ^9.0.2) — Authentication
- **Bcryptjs** (^3.0.2) — Password hashing
- **Multer** (^2.0.2) — File upload
- **Razorpay** (^2.9.6) — Payment processing
- **PDFKit** (^0.17.2) — PDF generation
- **React PDF Renderer** (^4.3.1) — PDF rendering
- **Google Auth Library** (^10.4.2) — Google OAuth validation
- **CORS** (^2.8.5) — Cross-origin requests
- **Morgan** (^1.10.1) — HTTP logging
- **Dotenv** (^17.2.3) — Environment variables
- **Nodemon** (^3.1.11) — Auto-reload during development

## Project Structure

```
config/
├── db.js                   # MongoDB connection
├── razorpay.js             # Razorpay setup
auth/
├── middleware/
│   ├── auth.js             # JWT verification
│   └── upload.js           # Multer file upload config
models/
├── User.model.js           # User schema
├── Resume.model.js         # Resume schema
└── Order.model.js          # Payment order schema
controllers/
├── authController.js       # Auth logic (register, login, OAuth)
├── resumeController.js     # Resume CRUD operations
└── paymentController.js    # Payment logic
routes/
├── authRoutes.js           # Auth endpoints
├── resumeRoutes.js         # Resume endpoints
└── payment.js              # Payment endpoints
uploads/
└── resumes/                # Uploaded resume files
app.js                      # Express app setup
index.js                    # Entry point
```

## Prerequisites

- Node.js (>= 16)
- npm or yarn
- MongoDB instance (local or cloud — e.g., MongoDB Atlas)
- Razorpay account (for payment processing)
- Google OAuth credentials (for social login validation)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file — copy from `dotenv.example`:

```bash
cp dotenv.example .env
```

3. Configure environment variables in `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/neoCV
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
GOOGLE_CLIENT_ID=your_google_client_id
```

## Development

Start the dev server with auto-reload:

```bash
npm run dev
```

The server will be available at `http://localhost:5000` (or the port specified in `.env`).

## API Endpoints

### Authentication Routes (`/auth`)

- `POST /auth/register` — Register new user
- `POST /auth/login` — Login user
- `POST /auth/google` — Google OAuth login

### Resume Routes (`/resume`)

- `GET /resume` — List all resumes (authenticated)
- `POST /resume` — Create new resume
- `GET /resume/:id` — Get resume by ID
- `PUT /resume/:id` — Update resume
- `DELETE /resume/:id` — Delete resume
- `POST /resume/:id/download` — Downloas resume

### Payment Routes (`/payment`)

- `POST /payment/order` — Create payment order
- `POST /payment/verify` — Verify payment



## File Upload

Resumes are uploaded to `uploads/resumes/` directory using **Multer**. Configure upload limits in `middleware/upload.js`.

## Authentication

- **JWT-based** — Tokens are issued on login/register
- **Protected routes** — Middleware in `middleware/auth.js` validates tokens
- **Google OAuth** — Validate tokens via Google Auth Library

## Middleware

- `auth.js` — JWT verification for protected routes
- `upload.js` — File upload configuration with size/type validation
- `express.json()` — JSON body parsing
- `cors()` — CORS configuration
- `morgan()` — HTTP request logging

## Environment Variables

Create a `.env` file and add:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/neoCV
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_xxxxx
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
NODE_ENV=development
```

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with nodemon |
| `npm start` | Start production server |

## Testing

To test endpoints, use:
- **Postman** — Import API collection
- **cURL** — Command-line requests
- **Thunder Client** (VS Code extension)

Example:
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","name":"John"}'
```

## Security

- Passwords are hashed using **bcryptjs** (salt rounds: 10)
- JWT tokens expire after time set in `.env` (`JWT_EXPIRE`)
- File uploads are validated by type and size
- CORS is configured for trusted origins

## Troubleshooting

- **MongoDB connection error?** Check `MONGODB_URI` in `.env` and ensure MongoDB server is running.
- **JWT verification failed?** Ensure `JWT_SECRET` matches between server instances.
- **File upload fails?** Check directory permissions for `uploads/resumes/`.
- **Razorpay errors?** Verify API keys are correct and account is active.


## Notes

- Ensure MongoDB is running before starting the server.
- Check `../README.md` for full project setup instructions.
- Coordinate with the frontend team on API contract changes.
