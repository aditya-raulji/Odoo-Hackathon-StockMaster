# StockMaster - Inventory Management System

A modern, modular Inventory Management System frontend built with **Next.js 14**, **React 18**, and **Tailwind CSS** featuring a "StockMaster" UI/UX design style with soft rounded cards, glass gradients, and smooth micro-interactions.

[![▶ Live Demo Video](https://img.shields.io/badge/▶%20Live%20Demo%20Video-StockMaster-6C5CE7?style=for-the-badge)](https://drive.google.com/file/d/1JDQ73HCoOAbhQ5GqBf0eOgrfIYaQ0Sxo/view?usp=sharing)


## 🎯 Features

### Core Functionality
- **Product Management**: Full CRUD operations with SKU tracking, categories, and multi-location inventory
- **Stock Movements**: Receipts, Deliveries, Internal Transfers, and Adjustments
- **Cycle Counting**: Inventory counting with reconciliation
- **Warehouse Management**: Multiple location support with capacity tracking
- **Supplier Management**: Supplier CRUD and order history
- **Staff Management**: Role-based access control (Inventory Manager, Warehouse Staff, StockMaster)
- **Reports**: Stock valuation, movement analysis, and ABC classification
- **Audit Log**: Complete system activity tracking

### UI/UX Highlights
- **Comet Design System**: Soft rounded cards, subtle glass gradients, and smooth animations
- **Responsive Layout**: Mobile-first design with collapsible sidebar
- **Data Tables**: Sortable, selectable, paginated tables with bulk actions
- **KPI Dashboard**: Real-time inventory metrics and trends
- **Modal & Toast Notifications**: Elegant feedback mechanisms
- **Role-Based Navigation**: Dynamic menu based on user permissions
- **Accessibility**: Semantic HTML, keyboard navigation, ARIA labels

## 📋 Project Structure

```
StockMaster/
├── pages/                      # Next.js pages (routes)
│   ├── _app.jsx               # App wrapper with providers
│   ├── index.jsx              # Landing page
│   ├── dashboard.jsx          # Main dashboard
│   ├── auth/
│   │   ├── login.jsx
│   │   ├── signup.jsx
│   │   ├── forgot-password.jsx
│   │   └── verify-otp.jsx
│   ├── products/
│   │   ├── index.jsx          # Products list
│   │   ├── [id].jsx           # Product detail
│   │   └── new.jsx            # Create product (optional)
│   ├── receipts/
│   ├── deliveries/
│   ├── transfers/
│   ├── adjustments.jsx
│   ├── counts.jsx
│   ├── locations.jsx
│   ├── suppliers.jsx
│   ├── staff.jsx
│   ├── reports.jsx
│   ├── audit-log.jsx
│   ├── settings.jsx
│   └── help.jsx
├── components/                # Reusable React components
│   ├── Layout.jsx            # Main layout with sidebar & topbar
│   ├── KPICard.jsx           # KPI metric cards
│   ├── DataTable.jsx         # Sortable, paginated table
│   ├── Modal.jsx             # Modal dialog
│   └── Toast.jsx             # Toast notifications
├── lib/
│   ├── api.js                # Axios API client with interceptors
│   ├── auth-context.js       # Auth state management
│   └── constants.js          # App constants (roles, statuses, etc.)
├── styles/
│   └── globals.css           # Tailwind + custom styles
├── public/                   # Static assets
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── jsconfig.json
└── .env.local               # Environment variables
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend API running (see API endpoints below)

### Installation

1. **Clone and navigate to project**
```bash
cd "e:\Coding Geeta\Hackathon\Odoo-Hackathon-StockMaster"
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
Edit `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/realtime
NEXT_PUBLIC_APP_NAME=Comet IMS
```

4. **Run development server**
```bash
npm run dev
```

5. **Open in browser**
Navigate to `http://localhost:3000`

### Build for Production
```bash
npm run build
npm start
```

## 🔐 Authentication

### Supported Flows
1. **Sign Up**: Email + password registration
2. **Login**: Email + password authentication
3. **Forgot Password**: OTP-based password reset
   - Request OTP via email
   - Verify OTP + set new password
   - Automatic login after reset

### Auth State Management
- Uses React Context (`AuthProvider`) for global auth state
- JWT tokens stored in `localStorage`
- Automatic token injection in API requests via axios interceptors
- Session persistence across page reloads

### User Roles
- **Inventory Manager**: Full product CRUD, approve receipts/deliveries, run reports
- **Warehouse Staff**: View products, perform picks/packs, update counts
- **StockMaster**: Super admin with all permissions including staff/location management

## 📡 API Integration

### Base Configuration
```javascript
// lib/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
// Supports GET, POST, PUT, PATCH, DELETE
```

### Key Endpoints Used

**Authentication**
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/request-otp` - Request password reset OTP
- `POST /auth/verify-otp` - Verify OTP and reset password
- `GET /auth/me` - Get current user

**Products**
- `GET /products?search=&category=&status=&page=&limit=` - List products
- `POST /products` - Create product
- `GET /products/:id` - Get product details
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

**Movements (Receipts, Deliveries, Transfers, Adjustments)**
- `GET /movements?type=&status=&page=` - List movements
- `POST /movements/receipts` - Create receipt
- `POST /movements/deliveries` - Create delivery
- `POST /movements/transfers` - Create transfer
- `POST /movements/adjustments` - Create adjustment
- `PUT /movements/:id/status` - Update status

**Other Resources**
- `GET/POST /locations` - Warehouse locations
- `GET/POST /suppliers` - Suppliers
- `GET/POST /staff` - Staff management
- `GET /reports/*` - Various reports
- `GET /audit-log` - System audit trail

## 🎨 Design System

### Color Palette
```css
Primary: #6C5CE7 (Purple)
Primary Dark: #5A4BC4
Primary Light: #8B7FE8
Secondary: #00B894 (Green)
Danger: #FF6B6B (Red)
Warning: #FFD93D (Yellow)
Neutral: Gray scale (50-900)
```

### Component Classes
```css
.card          /* Base card with shadow */
.card-lg       /* Large card with more shadow */
.btn           /* Base button */
.btn-primary   /* Primary action button */
.btn-secondary /* Secondary action button */
.btn-outline   /* Outline button */
.btn-danger    /* Danger/delete button */
.input         /* Form input field */
.badge         /* Status badge */
.glass         /* Glass morphism effect */
```

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔄 State Management

### Global State
- **Auth Context**: User, token, login/logout, role-based permissions
- **Local Component State**: Forms, modals, filters, pagination

### Data Fetching
- Direct API calls via `lib/api.js`
- Optional: Integrate React Query for caching and synchronization
- Mock data in development mode (set `API_MOCK_MODE=true`)

## 📱 Key Pages

### Dashboard (`/dashboard`)
- KPI cards (total products, low stock, pending operations)
- Recent movements table
- Quick action cards
- Inventory health metrics

### Products (`/products`)
- Searchable, filterable product list
- Bulk selection for actions
- Product detail page with tabs (Overview, Movements, Suppliers, Audit)

### Receipts (`/receipts`)
- Incoming stock list
- Create receipt with line items
- Supplier tracking
- Status workflow (Draft → Ready → Done)

### Deliveries (`/deliveries`)
- Outgoing orders list
- Pick list generation
- Shipping tracking
- Customer management

### Transfers (`/transfers`)
- Internal stock movements
- Multi-location support
- Transfer scheduling

### Cycle Counts (`/counts`)
- Create count sessions
- Assign staff
- Real-time counting interface
- Reconciliation reports

### Reports (`/reports`)
- Stock valuation by location
- Movement history analysis
- ABC inventory classification

### Settings (`/settings`)
- Account profile management
- Password change
- Notification preferences
- API key management

## 🛠️ Development

### Adding a New Page
1. Create file in `pages/` directory
2. Import `useAuth` hook for authentication
3. Wrap with `Layout` component (auto-applied in `_app.jsx`)
4. Use existing components (DataTable, Modal, KPICard)

### Adding a New Component
1. Create file in `components/` directory
2. Export as default React component
3. Use Tailwind classes for styling
4. Import Lucide icons as needed

### Styling Guidelines
- Use Tailwind utility classes
- Follow existing color scheme
- Maintain consistent spacing (use 4px grid)
- Add hover/focus states for interactivity
- Use custom CSS classes from `styles/globals.css` for complex styles

## 🔒 Security Best Practices

- JWT tokens stored in `localStorage` (consider httpOnly cookies for production)
- API requests include Authorization header automatically
- Role-based access control enforced on frontend (backend must validate)
- Sensitive data not logged to console in production
- CORS configured on backend

## 📦 Dependencies

### Core
- `next@^14.0.0` - React framework
- `react@^18.2.0` - UI library
- `axios@^1.6.0` - HTTP client

### UI
- `tailwindcss@^3.3.0` - Utility CSS framework
- `lucide-react@^0.294.0` - Icon library

### Build Tools
- `postcss@^8.4.31` - CSS processor
- `autoprefixer@^10.4.16` - CSS vendor prefixes

## 🚦 Next Steps

### Immediate Tasks
1. ✅ Frontend structure complete
2. ⏳ Connect to backend API (update `.env.local`)
3. ⏳ Implement form validations
4. ⏳ Add loading states and error handling
5. ⏳ Integrate real-time updates (WebSocket)

### Future Enhancements
- Offline queue for sync when online
- Advanced filtering and search
- Barcode/QR code scanning
- Mobile app (React Native)
- Dark mode toggle
- Multi-language support
- Advanced analytics dashboard

## 📞 Support

For issues or questions:
1. Check `/help` page for documentation
2. Review API response errors
3. Check browser console for client-side errors
4. Verify backend API is running and accessible

## 📄 License

Proprietary - Odoo Hackathon Project

---

**Built with ❤️ using Next.js, React, and Tailwind CSS**
