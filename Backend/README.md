# StockMaster - Inventory Management System Backend

Enterprise-grade backend for an Inventory Management System (IMS) built with Node.js, Express, PostgreSQL, and Prisma ORM.

## Features

- **Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - OTP-based email verification
  - Role-based access control (RBAC)
  - Login history tracking

- **Product Management**
  - Full CRUD operations for products
  - Category management
  - Batch and expiry tracking
  - Multi-location stock tracking
  - Image uploads

- **Stock Movements**
  - Receipt, Delivery, Transfer, and Adjustment movements
  - Complete status workflow (Draft → Waiting → Ready → Done → Canceled)
  - Movement line tracking with batch support
  - Automatic stock updates

- **Inventory Counts**
  - Create and manage inventory count tasks
  - Assign staff to count tasks
  - Compare expected vs counted quantities
  - Automatic reconciliation

- **Warehouse Management**
  - Location management (Warehouse, Store, Transit, etc.)
  - Supplier management
  - Staff management with role assignment

- **Reporting**
  - Stock valuation reports
  - Movement reports with filtering
  - ABC analysis for inventory optimization

- **Search & Notifications**
  - Full-text search for products and suppliers
  - Real-time notifications
  - Low stock alerts

- **Audit & Security**
  - Complete audit logging
  - IP tracking
  - User activity monitoring
  - SendGrid email integration

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcryptjs
- **Email**: SendGrid
- **File Upload**: Multer (local storage / S3 ready)
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 12 or higher
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/stockmaster

# JWT
JWT_SECRET=your-jwt-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret-key
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# Email (SendGrid)
SENDER_EMAIL=noreply@stockmaster.com
SENDGRID_API_KEY=your-sendgrid-api-key

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Set up the database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database (optional)
npm run prisma:seed
```

### 5. Start the server

**Development mode (with auto-reload):**
```bash
npm run start:dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:3000
```

### Health Check
```
GET /health
```

### Authentication Endpoints

#### Sign Up
```
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

#### Request OTP
```
POST /auth/request-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify OTP
```
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Get Current User
```
GET /auth/me
Authorization: Bearer <access_token>
```

#### Refresh Token
```
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

#### Logout
```
POST /auth/logout
Authorization: Bearer <access_token>
```

### Products Endpoints

#### Get All Products
```
GET /products?page=1&limit=20&search=laptop&categoryId=<id>
Authorization: Bearer <access_token>
```

#### Create Product
```
POST /products
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "sku": "PROD-001",
  "name": "Laptop",
  "description": "High-performance laptop",
  "categoryId": "<category-id>",
  "minStockLevel": 5,
  "maxStockLevel": 50,
  "reorderPoint": 10,
  "unitPrice": 999.99
}
```

#### Get Product by ID
```
GET /products/<id>
Authorization: Bearer <access_token>
```

#### Update Product
```
PUT /products/<id>
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "unitPrice": 1099.99
}
```

#### Delete Product
```
DELETE /products/<id>
Authorization: Bearer <access_token>
```

#### Bulk Create Products
```
POST /products/bulk
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "products": [
    {
      "sku": "PROD-002",
      "name": "Product 2",
      "unitPrice": 99.99
    }
  ]
}
```

### Stock Movements Endpoints

#### Get All Movements
```
GET /movements?page=1&limit=20&type=RECEIPT&status=DRAFT
Authorization: Bearer <access_token>
```

#### Get Movement by ID
```
GET /movements/<id>
Authorization: Bearer <access_token>
```

#### Create Receipt
```
POST /movements/receipts
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "toLocationId": "<location-id>",
  "supplierId": "<supplier-id>",
  "productId": "<product-id>",
  "notes": "Initial stock",
  "lines": [
    {
      "productId": "<product-id>",
      "quantity": 10,
      "batchId": "<batch-id>"
    }
  ]
}
```

#### Create Delivery
```
POST /movements/deliveries
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "fromLocationId": "<location-id>",
  "productId": "<product-id>",
  "lines": [
    {
      "productId": "<product-id>",
      "quantity": 5
    }
  ]
}
```

#### Create Transfer
```
POST /movements/transfers
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "fromLocationId": "<from-location-id>",
  "toLocationId": "<to-location-id>",
  "productId": "<product-id>",
  "lines": [
    {
      "productId": "<product-id>",
      "quantity": 10
    }
  ]
}
```

#### Create Adjustment
```
POST /movements/adjustments
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "locationId": "<location-id>",
  "productId": "<product-id>",
  "lines": [
    {
      "productId": "<product-id>",
      "quantity": 5
    }
  ]
}
```

#### Update Movement Status
```
PUT /movements/<id>/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "READY"
}
```

#### Confirm Pick
```
POST /movements/<id>/confirm-pick
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "pickedLines": [
    {
      "lineId": "<line-id>",
      "pickedQuantity": 10
    }
  ]
}
```

#### Complete Movement
```
POST /movements/<id>/complete
Authorization: Bearer <access_token>
```

### Inventory Counts Endpoints

#### Get All Counts
```
GET /counts?page=1&limit=20&status=DRAFT
Authorization: Bearer <access_token>
```

#### Create Count
```
POST /counts
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "locationId": "<location-id>"
}
```

#### Update Count Line
```
PUT /counts/<id>/line
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "productId": "<product-id>",
  "countedQuantity": 15,
  "notes": "Verified"
}
```

#### Reconcile Count
```
POST /counts/<id>/reconcile
Authorization: Bearer <access_token>
```

### Locations Endpoints

#### Get All Locations
```
GET /locations?page=1&limit=20&type=WAREHOUSE
Authorization: Bearer <access_token>
```

#### Create Location
```
POST /locations
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "code": "WH-002",
  "name": "Secondary Warehouse",
  "type": "WAREHOUSE",
  "address": "789 Industrial Ave",
  "capacity": 5000
}
```

#### Update Location
```
PUT /locations/<id>
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "capacity": 6000
}
```

#### Delete Location
```
DELETE /locations/<id>
Authorization: Bearer <access_token>
```

### Suppliers Endpoints

#### Get All Suppliers
```
GET /suppliers?page=1&limit=20&search=tech
Authorization: Bearer <access_token>
```

#### Create Supplier
```
POST /suppliers
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Tech Supplies Co",
  "email": "contact@techsupplies.com",
  "phone": "+1-555-0100",
  "address": "123 Supply St",
  "city": "Tech City",
  "state": "TC",
  "country": "USA",
  "zipCode": "12345"
}
```

#### Update Supplier
```
PUT /suppliers/<id>
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Delete Supplier
```
DELETE /suppliers/<id>
Authorization: Bearer <access_token>
```

### Staff Endpoints

#### Get All Staff
```
GET /staff?page=1&limit=20&locationId=<id>
Authorization: Bearer <access_token>
```

#### Create Staff
```
POST /staff
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "userId": "<user-id>",
  "locationId": "<location-id>",
  "department": "Warehouse Operations"
}
```

#### Update Staff
```
PUT /staff/<id>
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "locationId": "<location-id>",
  "department": "Inventory Management"
}
```

#### Update Staff Role (StockMaster only)
```
PUT /staff/<id>/role
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "role": "INVENTORY_MANAGER"
}
```

#### Delete Staff
```
DELETE /staff/<id>
Authorization: Bearer <access_token>
```

### Reports Endpoints

#### Stock Valuation Report
```
GET /reports/stock-val?locationId=<id>&categoryId=<id>
Authorization: Bearer <access_token>
```

#### Movements Report
```
GET /reports/movements?type=RECEIPT&status=DONE&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <access_token>
```

#### ABC Analysis Report
```
GET /reports/abc-analysis
Authorization: Bearer <access_token>
```

### Search Endpoints

#### Search Products
```
GET /search/products?q=laptop&categoryId=<id>&locationId=<id>
Authorization: Bearer <access_token>
```

#### Search Suppliers
```
GET /search/suppliers?q=tech
Authorization: Bearer <access_token>
```

### Notifications Endpoints

#### Get Notifications
```
GET /notifications?page=1&limit=20
Authorization: Bearer <access_token>
```

#### Mark Notification as Read
```
POST /notifications/mark-read
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "notificationId": "<notification-id>"
}
```

#### Mark All as Read
```
POST /notifications/mark-all-read
Authorization: Bearer <access_token>
```

### Audit Log Endpoints (StockMaster only)

#### Get Audit Logs
```
GET /audit-log?page=1&limit=20&entity=Product&action=CREATE
Authorization: Bearer <access_token>
```

#### Get Audit Log by ID
```
GET /audit-log/<id>
Authorization: Bearer <access_token>
```

#### Get Audit Logs by Entity
```
GET /audit-log/entity/<entity>/<entityId>
Authorization: Bearer <access_token>
```

### Uploads Endpoints

#### Upload File
```
POST /uploads
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: <binary-file>
```

#### Get File
```
GET /uploads/<fileId>
Authorization: Bearer <access_token>
```

#### Delete File
```
DELETE /uploads/<fileId>
Authorization: Bearer <access_token>
```

## Response Format

All responses follow a consistent format:

### Success Response
```json
{
  "ok": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "ok": false,
  "error": {
    "code": 400,
    "message": "Error message",
    "details": { ... }
  }
}
```

## Database Schema

The database includes the following main tables:

- **users**: User accounts with roles
- **otp_requests**: OTP verification records
- **sessions**: User session management
- **login_history**: Login tracking
- **products**: Product catalog
- **categories**: Product categories
- **product_batches**: Batch tracking
- **product_locations**: Stock levels by location
- **stock_movements**: Movement records
- **stock_movement_lines**: Movement line items
- **inventory_counts**: Count tasks
- **inventory_count_lines**: Count line items
- **locations**: Warehouse/store locations
- **suppliers**: Supplier information
- **staff**: Staff assignments
- **notifications**: User notifications
- **audit_log**: Audit trail
- **files**: Uploaded files

## Role-Based Access Control

### Roles

- **STOCKMASTER**: Full system access, can manage users and roles
- **INVENTORY_MANAGER**: Can manage products, movements, counts, and reports
- **WAREHOUSE_STAFF**: Can perform picking, packing, and count operations

### Permission Matrix

| Resource | StockMaster | Inventory Manager | Warehouse Staff |
|----------|-------------|-------------------|-----------------|
| Products | CRUD | CRUD | Read |
| Movements | CRUD | CRUD | Read/Confirm |
| Counts | CRUD | CRUD | Update Lines |
| Locations | CRUD | CRUD | Read |
| Suppliers | CRUD | CRUD | Read |
| Staff | CRUD | CRUD | Read |
| Reports | Read | Read | - |
| Audit Log | Read | - | - |
| Users | CRUD | - | - |

## Docker Deployment

### Build Docker Image

```bash
docker build -t stockmaster-backend .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running
2. Check DATABASE_URL in .env
3. Ensure database exists: `createdb stockmaster`

### Email Not Sending

1. Verify SENDGRID_API_KEY is correct
2. Check SENDER_EMAIL is valid
3. Review SendGrid account status

### File Upload Issues

1. Ensure uploads directory exists
2. Check file size limits
3. Verify file permissions

## Security Best Practices

1. **Environment Variables**: Never commit .env files
2. **Passwords**: Always use bcrypt hashing
3. **JWT**: Keep secrets secure and rotate regularly
4. **CORS**: Configure for your frontend domain
5. **Rate Limiting**: Adjust based on your needs
6. **Audit Logging**: Monitor all critical operations
7. **HTTPS**: Use in production
8. **SQL Injection**: Prisma ORM prevents this automatically

## Performance Optimization

1. **Database Indexing**: Indexes on frequently queried fields
2. **Pagination**: Always paginate large result sets
3. **Caching**: Consider Redis for frequently accessed data
4. **Connection Pooling**: Prisma handles this automatically
5. **Query Optimization**: Use includes selectively

## Monitoring & Logging

Logs are stored in the `logs/` directory:

- `logs/error.log`: Error logs
- `logs/combined.log`: All logs

Configure log level with `LOG_LEVEL` environment variable.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please contact the development team.
