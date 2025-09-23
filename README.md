<div align="center">

# G2M Backend API

Reliable, production-ready e‑commerce backend for the G2M store. Built with Node.js, Express 5, and MongoDB (Mongoose), featuring JWT auth with HTTP-only cookie sessions, file uploads to Cloudinary, email flows, admin tooling, and Vercel deployment.

</div>

---

## Overview

This repository provides the REST API powering the G2M e‑commerce platform:

- **Secure Authentication** with JWT access/refresh tokens stored in HTTP-only cookies
- **Category Management** with full CRUD operations and image uploads
- **User Management** with profiles, addresses, cart, wishlist, and session control
- **Product Catalog** with category relationships, images, ratings, and moderation
- **Order System** with vouchers, pricing breakdown, and comprehensive status lifecycle
- **Review System** with optional images and rating aggregation
- **Admin Dashboard** endpoints for categories, products, orders, users, reviews, vouchers, and notifications
- **File Upload** integration via Cloudinary (products, categories, avatars, reviews)
- **Email Delivery** using Gmail via Nodemailer for verification and notifications
- **Security Hardening** with Helmet, rate limiting, and API key protection
- **Production Ready** with Vercel serverless deployment support

Health check: GET `/api` returns uptime and database state.

---

## Tech Stack

- **Runtime**: Node.js (recommended ≥ 18)
- **Framework**: Express 5
- **Database/ODM**: MongoDB + Mongoose
- **Authentication**: JSON Web Tokens (JWT) with HTTP-only cookie sessions
- **File Storage**: Cloudinary via multer-storage-cloudinary
- **Email**: Nodemailer (Gmail)
- **Scheduling**: node-cron (daily cleanup)
- **Security**: Helmet, express-rate-limit, CORS, API key middleware
- **Deploy**: Vercel (@vercel/node)
- **Dev Tools**: Swagger UI for API documentation

---

## Project Structure

```
g2m-backend/
├─ config/                # Database and Cloudinary configuration
│  ├─ db.js
│  └─ cloudinary.js
├─ controllers/           # Route handlers grouped by domain
│  ├─ adminIn/           # Admin-only actions
│  │  ├─ categoriesControl/    # Category CRUD (add, edit, delete, get)
│  │  ├─ notificationsSystem/  # Notification management
│  │  ├─ ordersControl/        # Order status management
│  │  ├─ productsControl/      # Product CRUD with category validation
│  │  ├─ reviewsControl/       # Review moderation
│  │  ├─ usersControl/         # User management and stats
│  │  ├─ vouchersControl/      # Voucher CRUD
│  │  └─ sendAnnouncement.js   # System announcements
│  ├─ category/          # Public category endpoints
│  │  └─ getCategories.js      # List active categories
│  ├─ order/             # Order management for users
│  │  ├─ addOrder.js          # Create new orders
│  │  ├─ cancelOrder.js       # Cancel user orders
│  │  ├─ getOrder.js          # Get single order
│  │  └─ getOrders.js         # List user orders
│  ├─ product/           # Public product queries
│  │  ├─ getProduct.js        # Get single product with reviews
│  │  └─ getProducts.js       # List/search products with filters
│  ├─ review/            # Review system
│  │  ├─ addReview.js         # Add reviews with images
│  │  └─ getReviews.js        # List reviews by product
│  ├─ userAuth/          # Authentication flow
│  │  ├─ forgetPassword.js    # Initiate password reset
│  │  ├─ login.js             # Login with cookie-based tokens
│  │  ├─ logout.js            # Logout and clear cookies
│  │  ├─ refreshToken.js      # Refresh access tokens via cookies
│  │  ├─ register.js          # User registration
│  │  ├─ resetPassword.js     # Complete password reset
│  │  └─ verifyEmail.js       # Email verification
│  ├─ userIn/            # Authenticated user actions
│  │  ├─ address/            # Address management
│  │  ├─ cart/               # Shopping cart and checkout
│  │  ├─ profile/            # Profile management
│  │  ├─ session/            # Session management
│  │  ├─ wishlist/           # Wishlist management
|  |  ├─ addTicket.js        # Send support ticket
│  │  └─ getProfile.js       # Get user profile
│  └─ voucher/           # Voucher validation
│     └─ getVoucher.js        # Validate and apply vouchers
├─ middleware/
│  ├─ adminInAuth.js      # Admin role verification (cookie-based JWT)
│  ├─ apiKey.js          # API key validation for production
│  ├─ rateLimit.js       # Login rate limiting
│  ├─ userInAuth.js      # User authentication (cookie-based JWT)
│  └─ whiteListOrigins.js # Origin whitelist for production
├─ models/               # Mongoose schemas
│  ├─ Category.js        # Product categories with image and count tracking
│  ├─ Notification.js    # System notifications
│  ├─ Order.js          # Orders with enhanced status workflow
│  ├─ Product.js        # Products with category references and sort tags
│  ├─ Review.js         # Product reviews with images
│  ├─ User.js           # Users with cookie-based session tracking
│  └─ Voucher.js        # Discount vouchers
├─ routes/               # API routers mounted under /api/*
│  ├─ adminIn.js        # Admin routes with category management
│  ├─ orders.js         # Order management routes
│  ├─ product.js        # Public product and category routes
│  ├─ reviews.js        # Review system routes
│  ├─ userAuth.js       # Authentication routes
│  └─ userIn.js         # User account management routes
├─ utils/
│  ├─ cleanPendingEmails.js   # Daily cron for expired email cleanup
│  ├─ createNotification.js    # Notification creation helper
│  ├─ multer.js              # Multi-storage configs (products, categories, avatars, reviews)
│  ├─ sendEmail.js           # Nodemailer email helper
│  └─ token.js               # JWT token generation utilities
├─ docs/
│  ├─ openapi.yaml          # OpenAPI 3.0 specification
│  └─ G2M.postman_collection.json  # Postman collection
├─ server.js             # App bootstrapping, middleware, routes, health endpoint
├─ vercel.json          # Serverless deployment configuration
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

# API Key (for production security)
API_KEY=your_secure_api_key

# Environment mode
NODE_ENV=development

# Frontend URL (for email links)
CLIENT_URL=https://your-frontend-domain
```

Notes:
- **Gmail Setup**: Requires an App Password when 2FA is enabled
- **Security**: In production, API key and origin whitelist are enforced
- **Cookie Authentication**: Tokens are stored in HTTP-only cookies for enhanced security
- **Database**: MongoDB Atlas recommended for production deployments

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

### Authentication & Sessions (`/auth`)
- `POST /register` – Create new user account
- `POST /login` – User login (rate-limited, sets HTTP-only cookies)
- `GET /verify/:token/:email` – Email verification
- `POST /forget-password` – Initiate password reset flow
- `POST /reset-password/:token/:email` – Complete password reset
- `POST /logout` – Logout and clear session cookies
- `POST /refresh` – Refresh access token using cookies

### Categories (`/products/c/categories`)
- `GET /categories` – List all active categories (public)

### Products (`/products`)
- `GET /` – List products with filtering and search (public)
- `GET /:productId` – Get single product with details (public)

### Reviews (`/reviews`) [Auth Required]
- `POST /:productId` – Add product review (supports image uploads)
- `GET /` – List user's reviews

### Orders (`/orders`) [Auth Required]
- `GET /voucher` – Validate voucher for current cart
- `GET /` – List user orders with pagination
- `GET /:orderNumber` – Get specific order details
- `POST /` – Create new order
- `PATCH /:orderNumber` – Cancel order

### User Account (`/user`) [Auth Required]
- `GET /profile` – Get user profile
- `PATCH /profile` – Update profile (supports avatar upload: field `image`)
- `PATCH /profile/edit-password` – Change password
- `PATCH /profile/edit-email` – Initiate email change flow

#### Cart Management
- `GET /cart/checkout` – Get cart items with calculated totals
- `POST /cart` – Add item to cart
- `PATCH /cart/:productId` – Update cart item quantity
- `DELETE /cart/:productId` – Remove specific cart item
- `DELETE /cart` – Clear entire cart

#### Wishlist Management
- `POST /wishlist` – Add item to wishlist
- `DELETE /wishlist/:productId` – Remove item from wishlist
- `DELETE /wishlist` – Clear entire wishlist

#### Address Management
- `POST /address` – Add new address
- `PATCH /address/:addressId` – Update address
- `DELETE /address/:addressId` – Delete address

#### Session Management
- `DELETE /sessions/:sessionId` – Logout from specific device
- `DELETE /sessions` – Logout from all devices

#### Support Tickets
- `POST /tickets` – Submit support ticket to admin team

### Admin Panel (`/admin`) [Admin Auth Required]
- `POST /announcement` – Send system announcement

#### User Management
- `GET /users/stats` – Get user statistics dashboard
- `GET /users` – List all users with filters
- `GET /users/:userId` – Get specific user details
- `PATCH /users/:userId` – Update user role

#### Category Management
- `GET /categories` – List all categories (admin view)
- `POST /categories` – Create new category (image upload: `image`)
- `PATCH /categories/:categoryName` – Update category (image upload: `image`)
- `DELETE /categories/:categoryName` – Delete category (with safety checks)

#### Product Management
- `GET /products` – List all products with advanced filtering (admin view)
- `GET /products/:productSKU` – Get product details (admin view)
- `POST /products` – Create new product (uploads: `mainImage`, `images[]`)
- `PATCH /products/:productSKU` – Update product (uploads: `mainImage`, `images[]`)
- `DELETE /products/:productSKU` – Delete product

#### Order Management
- `GET /orders` – List all orders with filtering
- `PATCH /orders/:orderNumber` – Update order status

#### Review Management
- `GET /reviews` – List all reviews for moderation
- `DELETE /reviews/:reviewId` – Delete review

#### Voucher Management
- `GET /vouchers` – List all vouchers
- `POST /vouchers` – Create new voucher
- `PATCH /vouchers/:voucherId` – Update voucher
- `DELETE /vouchers/:voucherId` – Delete voucher

#### Notification System
- `GET /notifications` – Get admin notifications
- `PATCH /notifications/:notificationId` – Mark notification as read
- `PATCH /notifications/a/read-all` – Mark all notifications as read

### Authentication Methods
- **Cookie-Based**: HTTP-only cookies store access tokens (enhanced security)
- **Session Tracking**: Refresh tokens stored in user sessions with device/IP tracking
- **Auto-Refresh**: Automatic token refresh via cookie-based refresh flow

### File Upload Support (Cloudinary)
- **Product Images**: `mainImage` (required), `images` (up to 5 additional)
- **Category Images**: `image` (single image per category)
- **User Avatars**: `image` (single profile image)
- **Review Images**: `images` (up to 2 per review)

---

## Data Models (Key Fields)

### User Model
- **Core**: `email`, `password`, `role` (customer|admin), `name`, `phone`, `birthdate`, `image`
- **Verification**: `isVerified`, `pendingEmail`, `resetPasswordToken`
- **Shopping**: `cart[]`, `wishlist[]`, `addresses[]`, `orders[]`, `reviews[]`
- **Sessions**: `sessions[]` (with `accessToken`, `refreshToken`, `device`, `ip`, `lastUsed`)
- **Settings**: `getUpdates`, `isFirstLogin`, `orderCount`

### Category Model
- **Core**: `name` (unique), `description`, `image`, `isActive`
- **Tracking**: `productCount` (auto-updated)
- **Audit**: `createdBy`, `lastUpdatedBy`, `timestamps`

### Product Model
- **Identity**: `sku` (unique), `name`, `description`
- **Classification**: `category` (ObjectId ref), `subcategory`, `tags[]`, `sortTag`
- **Pricing**: `price`, `discountPrice`, `discountActive`
- **Inventory**: `stock`, `sold`, `isActive`
- **Media**: `mainImage`, `images[]`, `size` (width/height/depth)
- **Reviews**: `avgRating`, `numReviews`, `reviews[]` (refs)
- **Audit**: `createdBy`, `lastUpdatedBy`, `timestamps`

### Order Model
- **Identity**: `orderNumber` (auto-generated), `user` (ref)
- **Products**: `products[]` (with `sku`, `name`, `mainImage`, `quantity`, `priceAtPurchase`)
- **Pricing**: `subTotal`, `tax`, `shippingCost`, `discountAmount`, `totalAmount`
- **Addresses**: `shippingAddress`, `billingAddress` (full address objects)
- **Status**: `status` (pending|confirmed|packaged|shipped|delivered|cancelled|refunded)
- **Dates**: `shippedAt`, `deliveredAt`, `canceledAt`
- **Payment**: `paymentInfo[]` (transactions with method/status/amount)
- **Voucher**: `usedVoucher` (ref), notes
- **Audit**: `createdBy`, `lastUpdatedBy`, `timestamps`

### Review Model
- **Core**: `user` (ref), `product` (ref), `rating` (1-5), `comment`
- **Media**: `images[]` (optional)
- **Audit**: `timestamps`

### Voucher Model
- **Identity**: `code` (unique), `type` (percentage|fixed), `discount`
- **Validity**: `expiryDate`, `isActive`, `minPurchase`
- **Usage**: `usageLimit`, `timesUsed`
- **Audit**: `createdBy`, `lastUpdatedBy`, `timestamps`

### Notification Model
- **Content**: `type`, `title`, `message`, `link`
- **Targeting**: `recipientRole` (admin|customer|all)
- **Status**: `read`, `priority` (low|medium|high)
- **Lifecycle**: `expiresAt` (optional auto-cleanup)
- **Audit**: `timestamps`

### Indexes & TTL
- **Security**: Unverified users auto-expire after 30 days
- **Performance**: Strategic indexes on frequently queried fields
- **Cleanup**: Notifications can self-expire via `expiresAt`

---

## Security & Hardening

- **HTTP-Only Cookies**: Access tokens stored in secure, HTTP-only cookies (no XSS exposure)
- **Helmet Protection**: Security headers enabled by default
- **Rate Limiting**: Login attempts limited (5 attempts per 3 minutes per IP)
- **JWT Security**: Short-lived access tokens (1h) + refresh tokens (15d) with session tracking
- **API Key Protection**: Production endpoints require valid API key
- **Origin Whitelist**: CORS origin validation in production environment
- **Input Validation**: Comprehensive request validation and sanitization
- **Error Handling**: Consistent error responses without sensitive data leakage

---

## Deployment (Vercel)

- `vercel.json` configured to build `server.js` using `@vercel/node`
- Ensure all environment variables are set in the Vercel dashboard
- Consider adding a custom CORS configuration for production domains

---

## Troubleshooting

### Common Issues

**MongoDB Connection**
- Verify `MONGODB_URI` connection string
- Check IP allowlist for MongoDB Atlas
- Ensure database user has proper permissions

**Authentication Issues**
- Confirm `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set
- Check cookie settings in browser developer tools
- Verify tokens haven't expired (access: 1h, refresh: 15d)

**Email Delivery**
- Use Gmail App Password (not regular password) when 2FA enabled
- Check spam/junk folders for verification emails
- Verify `EMAIL_USER` and `EMAIL_PASS` environment variables

**File Upload Problems**
- Verify Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
- Check file format restrictions (jpg, png, jpeg only)
- Ensure form-data field names match expected values

**Production Deployment**
- Set `NODE_ENV=production` to enable security middleware
- Configure `API_KEY` for API access protection (enforced in all environments)
- Update `CORS_ORIGIN` with your frontend domain(s)
- Verify all environment variables are set in hosting platform
- Swagger UI documentation is automatically disabled in production

### **API Response Codes**
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `204 No Content`: Request successful, no content returned
- `400 Bad Request`: Invalid request data or business logic violation
- `401 Unauthorized`: Invalid or expired tokens
- `403 Forbidden`: Missing API key or insufficient permissions
- `404 Not Found`: Resource not found or missing authentication token
- `406 Not Acceptable`: Token expired (use refresh endpoint)
- `413 Payload Too Large`: File or request size exceeds limits
- `429 Too Many Requests`: Rate limit exceeded

---

## Scripts

- `npm start` – Start production server
- `npm run dev` – Start development server with nodemon (auto-reload)

---

## License

ISC © Marcelino Saad
