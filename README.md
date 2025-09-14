<div align="center">

# G2M Backend API

Reliable, production-ready e‑commerce backend for the G2M store. Built with Node.js, Express 5, and MongoDB (Mongoose), featuring JWT auth with refresh sessions, file uploads to Cloudinary, email flows, admin tooling, and Vercel deployment.

</div>

---

## Overview

This repository provides the REST API powering the G2M e‑commerce platform:

- Authentication with access/refresh tokens and session management
- User profile, addresses, cart, wishlist, and sessions control
- Product catalog with images, ratings, and moderation
- Orders with vouchers, pricing breakdown, and status lifecycle
n+- Reviews with optional images and listing
- Admin endpoints: products, orders, users, reviews, vouchers, notifications
- Cloudinary integration for uploads (products, avatars, reviews)
- Email delivery (Gmail via Nodemailer)
- Security hardening (Helmet) and login rate limiting
- Vercel-ready serverless deployment (vercel.json)

Health check: GET `/api` returns uptime and database state.

---

## Tech Stack

- Runtime: Node.js (recommended ≥ 18)
- Framework: Express 5
- Database/ODM: MongoDB + Mongoose
- Auth: JSON Web Tokens (JWT) with refresh sessions
- File Storage: Cloudinary via multer-storage-cloudinary
- Email: Nodemailer (Gmail)
- Scheduling: node-cron (daily cleanup)
- Security: Helmet, express-rate-limit (login), CORS
- Deploy: Vercel (@vercel/node)

---

## Project Structure

```
g2m-backend/
├─ config/                # DB and Cloudinary configuration
│  ├─ db.js
│  └─ cloudinary.js
├─ controllers/           # Route handlers grouped by domain
│  ├─ adminIn/...         # Admin actions (users, products, orders, reviews, vouchers, notifications)
│  ├─ order/...           # Orders CRUD and voucher validation
│  ├─ product/...         # Public product queries
│  ├─ review/...          # Add/list reviews
│  ├─ userAuth/...        # Register/login/verify/reset/logout/refresh
│  └─ userIn/...          # Authenticated user actions (profile, cart, wishlist, addresses, sessions)
├─ middleware/
│  ├─ adminInAuth.js      # Requires admin role (JWT)
│  ├─ rateLimit.js        # Login rate limiting
│  └─ userInAuth.js       # Requires authenticated user (JWT)
├─ models/                # Mongoose schemas (User, Product, Order, Review, Voucher, Notification)
├─ routes/                # API routers mounted under /api/*
├─ utils/
│  ├─ cleanPendingEmails.js # Daily cron to clear expired pending emails
│  ├─ createNotification.js  # Persist notifications
│  ├─ multer.js             # Multer + Cloudinary storages
│  ├─ sendEmail.js          # Nodemailer helper
│  └─ token.js              # Access/refresh token helpers
├─ server.js              # App bootstrapping, middleware, routers, health, 404
├─ vercel.json            # Serverless build and routing config
└─ package.json
```

---

## Environment Variables

Create a `.env` file in the project root with:

```
# Server
PORT=5000

# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_VERIFY_SECRET=your_verify_secret

# Email (Gmail)
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# CORS (comma-separated origins)
CORS_ORIGIN=http://localhost:3000,https://your-frontend-domain

# API Key
API_KEY=your_api_key

# Environment mode
NODE_ENV=your_env

# Emails redirection
CLIENT_URL=https://your-frontend-domain
```

Notes:
- Gmail requires an App Password when 2FA is enabled.
- No explicit CORS origin is configured in code; adjust as needed in `server.js`.

---

## Running Locally

1) Install dependencies

```powershell
npm install
```

2) Start the dev server (with nodemon)

```powershell
npm run dev
```

API base URL: `http://localhost:5000/api`

Health check: `GET /api`

---

## API Docs (Swagger)

- Interactive docs: `GET /api/docs` when running locally
- Source spec: `docs/openapi.yaml`

You can import `docs/openapi.yaml` into Postman/Insomnia, or browse the interactive Swagger UI.

---

## API Overview (Summary)

Base prefix: `/api`

Authentication & Sessions (`/auth`)
- POST `/register` – Create account
- POST `/login` – Login (rate-limited)
- GET `/verify/:token/:email` – Email verification
- POST `/forget-password` – Start password reset
- POST `/reset-password/:token/:email` – Complete password reset
- POST `/logout` – Logout and revoke session
- POST `/refresh` – Issue new access token using refresh session

Products (`/products`)
- GET `/` – List products (public)
- GET `/:productId` – Get a product (public)

Reviews (`/reviews`) [Auth]
- POST `/:productId` – Add a review (supports images)
- GET `/` – List user reviews

Orders (`/orders`) [Auth]
- GET `/voucher` – Validate a voucher for the current user/cart
- GET `/` – List user orders
- GET `/:orderNumber` – Get a specific order
- POST `/` – Create an order
- PATCH `/:orderNumber` – Cancel an order

User-In (`/user`) [Auth]
- GET `/profile` – Get profile
- PATCH `/profile` – Update profile (supports avatar image: field `image`)
- PATCH `/profile/edit-password` – Change password
- PATCH `/profile/edit-email` – Start email change flow
- Cart: GET `/cart/checkout`, POST `/cart`, PATCH `/cart/:productId`, DELETE `/cart/:productId`, DELETE `/cart`
- Wishlist: POST `/wishlist`, DELETE `/wishlist/:productId`, DELETE `/wishlist`
- Address: POST `/address`, PATCH `/address/:addressId`, DELETE `/address/:addressId`
- Sessions: DELETE `/sessions/:sessionId`, DELETE `/sessions`

Admin-In (`/admin`) [Admin JWT]
- POST `/announcement` – Send announcement
- Users: GET `/users/stats`, GET `/users`, GET `/users/:userId`, PATCH `/users/:userId` (role)
- Products: GET `/products`, GET `/products/:productSKU`, POST `/products`, PATCH `/products/:productSKU`, DELETE `/products/:productSKU` (image fields: `mainImage`, `images[]`)
- Orders: GET `/orders`, PATCH `/orders/:orderNumber` (status)
- Reviews: GET `/reviews`, DELETE `/reviews/:reviewId`
- Vouchers: GET `/vouchers`, POST `/vouchers`, PATCH `/vouchers/:voucherId`, DELETE `/vouchers/:voucherId`
- Notifications: GET `/notifications`, PATCH `/notifications/:notificationId`, PATCH `/notifications/read-all`

Authentication
- Access token in `Authorization: Bearer <token>` header
- Refresh sessions stored in user document (`sessions[]`); refresh via `/auth/refresh`

Uploads (Cloudinary)
- Admin product uploads: multipart fields `mainImage` (1), `images` (up to 5)
- User avatar: field `image` (single)
- Review images: field `images` (up to 2)

---

## Data Models (Key Fields)

- User: email, password, role (customer|admin), sessions[], cart[], wishlist[], addresses[], orders[], reviews[], verification/reset fields
- Product: sku, name, description, category/subcategory, tags, stock, price/discount, mainImage, images[], size, avgRating/numReviews, createdBy
- Order: orderNumber, user, products[], subTotal/tax/shipping/discount/total, shippingAddress/billingAddress, status, paymentInfo[], audit fields
- Review: user, product, rating (1–5), comment, images[]
- Voucher: code, type (percentage|fixed), discount, expiry, isActive, minPurchase, usageLimit, timesUsed
- Notification: type (order|review|stock|voucher|system), title, message, link, read, priority, recipientRole, expiresAt

Indexes & TTL
- Unverified users auto-expire after 30 days (partial TTL on `createdAt`)
- Notifications can self-expire via `expiresAt`

---

## Security & Hardening

- Helmet enabled by default
- Login rate limiting (5 attempts per 3 minutes)
- JWT access tokens (1h) + refresh tokens (15d) with session tracking
- 404 handler with consistent JSON structure

---

## Deployment (Vercel)

- `vercel.json` configured to build `server.js` using `@vercel/node`
- Ensure all environment variables are set in the Vercel dashboard
- Consider adding a custom CORS configuration for production domains

---

## Troubleshooting

- MongoDB connection: verify `MONGODB_URI` and IP allowlist (for Atlas)
- JWT errors: confirm `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- Email: use a Gmail App Password; check spam folder and sender limits
- Cloudinary: verify credentials and allowed formats; ensure form-data fields match
- 401/406 responses: send `Authorization: Bearer <accessToken>` header for protected routes
- 413 payloads: if needed, add JSON/body size limits and tune upload settings

---

## Scripts

- `npm run dev` – start with nodemon (development)

---

## License

ISC © Marcelino Saad
