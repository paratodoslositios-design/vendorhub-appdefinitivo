// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string; // admin, vendor, viewer
  status: string;
  avatar: string | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  description: string | null;
  status: string;
  taxId: string | null;
  website: string | null;
  rating: number;
  totalPurchases: number;
  totalSales: number;
  createdAt: Date;
  updatedAt: Date;
  products?: Product[];
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost: number | null;
  stock: number;
  minStock: number;
  maxStock: number;
  sku: string;
  barcode: string | null;
  category: string;
  status: string;
  image: string | null;
  vendorId: string;
  createdAt: Date;
  updatedAt: Date;
  vendor?: Vendor;
}

// Sale types
export interface Sale {
  id: string;
  saleNumber: string;
  vendorId: string | null;
  customerId: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  notes: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  items?: SaleItem[];
  vendor?: Vendor;
  createdBy?: User;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  createdAt: Date;
  product?: Product;
}

export interface CreateSaleInput {
  vendorId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  paymentMethod: string;
  paymentStatus?: string;
  notes?: string;
  tax?: number;
  discount?: number;
}

// Purchase types
export interface Purchase {
  id: string;
  purchaseNumber: string;
  vendorId: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  invoiceNumber: string | null;
  dueDate: Date | null;
  notes: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  items?: PurchaseItem[];
  vendor?: Vendor;
  createdBy?: User;
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  createdAt: Date;
  product?: Product;
}

export interface CreatePurchaseInput {
  vendorId: string;
  items: {
    productId: string;
    quantity: number;
    unitCost: number;
  }[];
  paymentMethod: string;
  paymentStatus?: string;
  invoiceNumber?: string;
  dueDate?: string;
  notes?: string;
  tax?: number;
  discount?: number;
}

// Inventory types
export interface InventoryMovement {
  id: string;
  productId: string;
  vendorId: string | null;
  type: string; // in, out, adjustment, return
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  reference: string | null;
  createdAt: Date;
  product?: Product;
  vendor?: Vendor;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: string; // info, warning, error, success
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: Date;
}

// Audit log types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user?: User;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  products?: Product[];
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string;
  category: string;
  status: string;
  image: string | null;
  vendorId: string;
  createdAt: Date;
  updatedAt: Date;
  vendor?: Vendor;
}

export interface CreateVendorInput {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  description?: string;
  status?: string;
  taxId?: string;
  website?: string;
}

export interface UpdateVendorInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  status?: string;
  taxId?: string;
  website?: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  sku: string;
  category: string;
  status?: string;
  image?: string;
  vendorId: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  stock?: number;
  sku?: string;
  category?: string;
  status?: string;
  image?: string;
  vendorId?: string;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  vendorId?: string;
  category?: string;
  status?: string;
}

export interface SalesReport {
  totalProducts: number;
  totalVendors: number;
  totalValue: number;
  productsByCategory: { category: string; count: number; value: number }[];
  productsByVendor: { vendorName: string; count: number; value: number }[];
  productsByStatus: { status: string; count: number }[];
  recentProducts: Product[];
}
