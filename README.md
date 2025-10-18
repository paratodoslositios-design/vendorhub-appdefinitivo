# VendorHub Enterprise - Complete Business Management System 🚀

A **professional enterprise-grade** full-stack application built with Next.js for complete business management including vendors, products, sales, purchases, inventory control, and advanced analytics.

## ⭐ Enterprise Features

### 🔐 **Authentication & Authorization**

- Multi-role user system (Admin, Vendor, Viewer)
- Secure authentication with JWT tokens
- Role-based access control
- Session management

### 💰 **Sales Management**

- Complete sales tracking system
- Customer management
- Multi-product invoices
- Payment tracking (Cash, Card, Transfer, Credit)
- Automatic numbering (VEN-00001, VEN-00002...)
- Real-time inventory updates
- Sales statistics and analytics

### 📦 **Purchase Management**

- Purchase order system
- Vendor invoice tracking
- Multi-item purchases
- Payment status monitoring
- Automatic numbering (COM-00001, COM-00002...)
- Cost tracking and updates
- Purchase analytics

### 📊 **Advanced Inventory Control**

- Real-time stock tracking
- Automatic inventory movements
- Stock alerts (low stock, out of stock)
- Min/Max stock configuration
- Barcode support
- Cost vs Price tracking
- Movement history (In, Out, Adjustment, Return)

### 🔔 **Notification System**

- Real-time notifications
- Stock alerts
- Transaction confirmations
- Multi-type notifications (Info, Warning, Error, Success)
- Read/Unread status

### 📝 **Audit & Logging**

- Complete action tracking
- User activity logs
- IP address and User Agent logging
- Action types: CREATE, UPDATE, DELETE, LOGIN, LOGOUT
- Detailed JSON information

### 📈 **Reports & Analytics**

- Sales dashboard with statistics
- Purchase analytics
- Inventory reports
- Product performance
- Vendor analysis
- PDF export with professional formatting

### 🏢 **Core Features (Original)**

- Vendor Management (CRUD operations)
- Product Management (Inventory system)
- Advanced filtering and search
- Dark mode support
- Professional UI/UX
- Fully responsive design

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Full type safety)
- **Database**: PostgreSQL (production) / SQLite (development)
- **ORM**: Prisma (10 interconnected models)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Charts**: Recharts
- **PDF Generation**: jsPDF + jspdf-autotable
- **Icons**: Lucide React
- **Authentication**: JWT with HTTP-only cookies
- **API**: Next.js API Routes (RESTful)

## 📊 Database Models

The application includes **10 comprehensive models**:

1. **User** - Authentication and authorization
2. **Vendor** - Supplier management
3. **Product** - Inventory with cost tracking
4. **Sale** - Sales transactions
5. **SaleItem** - Individual sale items
6. **Purchase** - Purchase orders
7. **PurchaseItem** - Individual purchase items
8. **InventoryMovement** - Stock movement tracking
9. **Notification** - User notifications
10. **AuditLog** - Complete audit trail

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd vendor-products-app
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# (Optional) Load sample data
npm run seed
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints ⭐
│   │   ├── sales/         # Sales management ⭐
│   │   ├── purchases/     # Purchase management ⭐
│   │   ├── vendors/       # Vendor endpoints
│   │   ├── products/      # Product endpoints
│   │   └── reports/       # Reports endpoint
│   ├── sales/             # Sales page ⭐
│   ├── purchases/         # Purchases page ⭐
│   ├── vendors/           # Vendors page
│   ├── products/          # Products page
│   ├── dashboard/         # Analytics dashboard
│   └── page.tsx           # Landing page
├── components/            # Reusable components
├── contexts/              # React contexts
├── lib/                   # Utilities
│   ├── auth.ts           # Authentication utils ⭐
│   ├── audit.ts          # Audit logging ⭐
│   ├── notifications.ts  # Notification system ⭐
│   ├── db.ts             # Database connection
│   └── pdfExport.ts      # PDF generation
└── types/                 # TypeScript types (expanded) ⭐
```

⭐ = New/Enhanced in Enterprise Edition

## 🎯 Features Overview

### 🏠 Landing Page

- Professional hero section
- Feature showcase
- Benefits presentation
- Call-to-action buttons

### 📊 Dashboard

- Real-time business statistics
- Interactive charts (Bar, Pie)
- Product distribution analytics
- Vendor performance metrics
- Recent activity overview
- Advanced filtering
- PDF export functionality

### 💰 Sales Module

- Create and track sales
- Customer information management
- Multi-product invoices
- Discount and tax handling
- Payment method selection
- Payment status tracking
- Automatic inventory updates
- Sales statistics
- Filtering by status and payment

### 📦 Purchase Module

- Purchase order creation
- Vendor selection
- Multi-item purchases
- Cost tracking
- Invoice number management
- Due date tracking
- Automatic stock updates
- Purchase analytics
- Vendor filtering

### 🏢 Vendor Management

- Complete CRUD operations
- Contact information
- Tax ID / Business info
- Rating system
- Total purchases tracking
- Search and filter
- Status management

### 📦 Product Management

- Full inventory control
- Cost and price tracking
- Min/Max stock levels
- Barcode support
- Category organization
- Multi-vendor products
- Status management
- Stock alerts

### 🔐 User Management

- Role-based access (Admin, Vendor, Viewer)
- Secure authentication
- User profiles
- Activity tracking
- Session management

### 🔔 Notifications

- Stock alerts
- Transaction notifications
- System messages
- Read/Unread tracking

### 📝 Audit Logs

- Complete action history
- User activity tracking
- IP and browser logging
- Searchable audit trail

## 📚 Documentation

### Quick Start

- **[Quick Start Guide](./GUIA_RAPIDA_NUEVAS_FUNCIONALIDADES.md)** - Get started with new features
- **[Professional Improvements](./MEJORAS_PROFESIONALES.md)** - Complete feature documentation
- **[Complete Guide](./COMPLETE_GUIDE.md)** - Original project guide

### Deployment

- **[Quick Deploy to Render](./QUICK_DEPLOY_RENDER.md)** - 5-minute deployment
- **[Complete Deployment Guide](./RENDER_DEPLOY.md)** - Step-by-step instructions
- **[Deployment Checklist](./RENDER_CHECKLIST.md)** - Deployment checklist
- **[Useful Commands](./RENDER_COMMANDS.md)** - CLI commands

### Features

- **[PDF Export Guide](./PDF_EXPORT_GUIDE.md)** - PDF generation documentation
- **[Landing Page](./LANDING_PAGE.md)** - Landing page features

#### Quick Deployment Steps:

1. Create PostgreSQL database on Render
2. Create Web Service and connect your GitHub repo
3. Set environment variables (DATABASE_URL, NODE_ENV)
4. Deploy and run migrations
5. Your app is live! 🚀

**Features on Render:**

- ✅ Free tier available
- ✅ Automatic deployments from Git
- ✅ Built-in PostgreSQL database
- ✅ Free SSL certificates
- ✅ Easy scaling

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables:
   - `DATABASE_URL`: Your database connection string
4. Deploy!

The [Vercel Platform](https://vercel.com) is also a great option for Next.js apps.

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
```

For production, use a proper database URL (PostgreSQL, MySQL, etc.)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma Studio (Database GUI)
- `npx prisma generate` - Generate Prisma Client
- `npx prisma db push` - Push schema changes to database

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Author

Built with ❤️ using Next.js and modern web technologies.
