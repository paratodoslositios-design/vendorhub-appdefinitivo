"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  DollarSign,
  ShoppingCart,
  Calendar,
  Search,
  Filter,
  Plus,
  X,
  Check,
} from "lucide-react";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Modal from "@/components/Modal";
import type { Sale, Product, Vendor } from "@/types";

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");

  // New sale form
  const [vendorId, setVendorId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  // Product selection for adding items
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [itemDiscount, setItemDiscount] = useState(0);

  useEffect(() => {
    fetchSales();
    fetchProducts();
    fetchVendors();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await fetch("/api/sales");
      if (response.ok) {
        const data = await response.json();
        setSales(data.sales || []);
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch("/api/vendors");
      if (response.ok) {
        const data = await response.json();
        setVendors(data.vendors || []);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const addItem = () => {
    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    // If vendor is selected, check product belongs to vendor
    if (vendorId && product.vendorId !== vendorId) {
      alert("El producto seleccionado no pertenece al proveedor seleccionado");
      return;
    }

    // Check stock availability
    if (product.stock < quantity) {
      alert(`Stock insuficiente. Disponible: ${product.stock}`);
      return;
    }

    const unitPrice = product.price;
    const subtotal = unitPrice * quantity - itemDiscount;

    const newItem: SaleItem = {
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice,
      discount: itemDiscount,
      subtotal,
    };

    setSaleItems([...saleItems, newItem]);
    setSelectedProduct("");
    setQuantity(1);
    setItemDiscount(0);
  };

  const removeItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal + tax - discount;
    return { subtotal, total };
  };

  const handleCreateSale = async () => {
    if (!customerName || saleItems.length === 0) {
      alert("Por favor complete los campos requeridos");
      return;
    }

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendorId || undefined,
          customerName,
          customerEmail,
          customerPhone,
          items: saleItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
          })),
          paymentMethod,
          paymentStatus,
          notes,
          tax,
          discount,
        }),
      });

      if (response.ok) {
        fetchSales();
        setShowCreateModal(false);
        resetForm();
        alert("Venta creada exitosamente");
      } else {
        const error = await response.json();
        alert(error.error || "Error al crear venta");
      }
    } catch (error) {
      console.error("Error creating sale:", error);
      alert("Error al crear venta");
    }
  };

  const resetForm = () => {
    setVendorId("");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setSaleItems([]);
    setPaymentMethod("cash");
    setPaymentStatus("paid");
    setNotes("");
    setDiscount(0);
    setTax(0);
  };

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || sale.status === statusFilter;
    const matchesPayment =
      !paymentFilter || sale.paymentStatus === paymentFilter;
    const matchesVendor = !vendorFilter || sale.vendorId === vendorFilter;
    return matchesSearch && matchesStatus && matchesPayment && matchesVendor;
  });

  // Get available products based on selected vendor
  const availableProducts = vendorId
    ? products.filter(
        (p) =>
          p.vendorId === vendorId && p.status === "available" && p.stock > 0
      )
    : products.filter((p) => p.status === "available" && p.stock > 0);

  const { subtotal, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              💰 Ventas
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona todas las ventas de tu negocio
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto">
            <Plus className="w-5 h-5 mr-2" />
            Nueva Venta
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Ventas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sales.length}
                </p>
              </div>
              <ShoppingCart className="w-10 h-10 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ingresos
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ${sales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pagadas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sales.filter((s) => s.paymentStatus === "paid").length}
                </p>
              </div>
              <Check className="w-10 h-10 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pendientes
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {sales.filter((s) => s.paymentStatus === "pending").length}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Buscar por cliente o número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}>
              <option value="">Todos los proveedores</option>
              {vendors &&
                vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
              <option value="refunded">Reembolsado</option>
            </Select>
            <Select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}>
              <option value="">Todos los pagos</option>
              <option value="paid">Pagado</option>
              <option value="pending">Pendiente</option>
              <option value="partial">Parcial</option>
            </Select>
            <Button
              variant="secondary"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setPaymentFilter("");
                setVendorFilter("");
              }}>
              <Filter className="w-5 h-5 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </Card>

        {/* Sales List */}
        {loading ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Cargando ventas...
            </p>
          </Card>
        ) : filteredSales.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron ventas
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredSales.map((sale) => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}>
                <Card className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl font-bold text-blue-600">
                          {sale.saleNumber}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            sale.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : sale.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                          {sale.status}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            sale.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800"
                              : sale.paymentStatus === "pending"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                          {sale.paymentStatus === "paid"
                            ? "Pagado"
                            : sale.paymentStatus === "pending"
                            ? "Pendiente"
                            : "Parcial"}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {sale.customerName}
                      </h3>
                      {sale.customerEmail && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {sale.customerEmail}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        {new Date(sale.createdAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">
                        ${sale.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Subtotal: ${sale.subtotal.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {sale.paymentMethod.toUpperCase()}
                      </p>
                      {sale.items && sale.items.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          {sale.items.length} producto(s)
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Sale Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Nueva Venta">
        <div className="space-y-4">
          {/* Vendor Selection */}
          <div>
            <h3 className="font-semibold mb-3">Proveedor (Opcional)</h3>
            <Select
              value={vendorId}
              onChange={(e) => {
                setVendorId(e.target.value);
                // Clear selected items when vendor changes
                setSaleItems([]);
              }}>
              <option value="">Todos los proveedores</option>
              {vendors &&
                vendors
                  .filter((v) => v.status === "active")
                  .map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
            </Select>
            {vendorId && (
              <p className="text-xs text-gray-500 mt-1">
                Solo se mostrarán productos de este proveedor
              </p>
            )}
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="font-semibold mb-3">Información del Cliente</h3>
            <div className="space-y-3">
              <Input
                label="Nombre del Cliente *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nombre completo"
              />
              <Input
                label="Email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="cliente@email.com"
              />
              <Input
                label="Teléfono"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+1234567890"
              />
            </div>
          </div>

          {/* Add Products */}
          <div>
            <h3 className="font-semibold mb-3">Productos</h3>
            <div className="grid grid-cols-12 gap-2 mb-3">
              <div className="col-span-5">
                <Select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}>
                  <option value="">Seleccionar producto</option>
                  {availableProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (${product.price}) - Stock: {product.stock}
                      {product.vendor && ` - ${product.vendor.name}`}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="1"
                  placeholder="Cant."
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  value={itemDiscount}
                  onChange={(e) => setItemDiscount(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  placeholder="Desc."
                />
              </div>
              <div className="col-span-2">
                <Button
                  onClick={addItem}
                  disabled={!selectedProduct}
                  className="w-full">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Items List */}
            {saleItems.length > 0 && (
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                {saleItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-gray-600">
                        {item.quantity} x ${item.unitPrice.toFixed(2)}
                        {item.discount > 0 && ` - $${item.discount.toFixed(2)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        ${item.subtotal.toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Info */}
          <div>
            <h3 className="font-semibold mb-3">Información de Pago</h3>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Método de Pago"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
                <option value="credit">Crédito</option>
              </Select>
              <Select
                label="Estado de Pago"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}>
                <option value="paid">Pagado</option>
                <option value="pending">Pendiente</option>
                <option value="partial">Parcial</option>
              </Select>
            </div>
          </div>

          {/* Totals */}
          <div>
            <h3 className="font-semibold mb-3">Totales</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Descuento"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
                <Input
                  label="Impuesto"
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Descuento:</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Impuesto:</span>
                  <span>+${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              rows={3}
              placeholder="Notas adicionales..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreateSale}
              disabled={!customerName || saleItems.length === 0}
              className="flex-1">
              Crear Venta
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
