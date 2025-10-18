"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  DollarSign,
  Package,
  Calendar,
  Search,
  Filter,
  Plus,
  X,
} from "lucide-react";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Modal from "@/components/Modal";
import type { Purchase, Product, Vendor } from "@/types";

interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");

  // New purchase form
  const [vendorId, setVendorId] = useState("");
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  // Product selection
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);

  useEffect(() => {
    fetchPurchases();
    fetchProducts();
    fetchVendors();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await fetch("/api/purchases");
      if (response.ok) {
        const data = await response.json();
        setPurchases(data.purchases || []);
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
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
    if (!product || unitCost <= 0) return;

    const subtotal = unitCost * quantity;

    const newItem: PurchaseItem = {
      productId: product.id,
      productName: product.name,
      quantity,
      unitCost,
      subtotal,
    };

    setPurchaseItems([...purchaseItems, newItem]);
    setSelectedProduct("");
    setQuantity(1);
    setUnitCost(0);
  };

  const removeItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = purchaseItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    const total = subtotal + tax - discount;
    return { subtotal, total };
  };

  const handleCreatePurchase = async () => {
    if (!vendorId || purchaseItems.length === 0) {
      alert("Por favor complete los campos requeridos");
      return;
    }

    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          items: purchaseItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
          paymentMethod,
          paymentStatus,
          invoiceNumber: invoiceNumber || undefined,
          dueDate: dueDate || undefined,
          notes,
          tax,
          discount,
        }),
      });

      if (response.ok) {
        fetchPurchases();
        setShowCreateModal(false);
        resetForm();
        alert("Compra creada exitosamente");
      } else {
        const error = await response.json();
        alert(error.error || "Error al crear compra");
      }
    } catch (error) {
      console.error("Error creating purchase:", error);
      alert("Error al crear compra");
    }
  };

  const resetForm = () => {
    setVendorId("");
    setPurchaseItems([]);
    setPaymentMethod("cash");
    setPaymentStatus("paid");
    setInvoiceNumber("");
    setDueDate("");
    setNotes("");
    setDiscount(0);
    setTax(0);
  };

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.purchaseNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (purchase.vendor &&
        purchase.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || purchase.status === statusFilter;
    const matchesVendor = !vendorFilter || purchase.vendorId === vendorFilter;
    return matchesSearch && matchesStatus && matchesVendor;
  });

  const { subtotal, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              📦 Compras
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona tus compras a proveedores
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto">
            <Plus className="w-5 h-5 mr-2" />
            Nueva Compra
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Compras
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {purchases.length}
                </p>
              </div>
              <ShoppingBag className="w-10 h-10 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Gastado
                </p>
                <p className="text-2xl font-bold text-red-600">
                  ${purchases.reduce((sum, p) => sum + p.total, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-red-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Este Mes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    purchases.filter((p) => {
                      const date = new Date(p.createdAt);
                      const now = new Date();
                      return (
                        date.getMonth() === now.getMonth() &&
                        date.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
              <Calendar className="w-10 h-10 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Proveedores
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(purchases.map((p) => p.vendorId)).size}
                </p>
              </div>
              <Package className="w-10 h-10 text-green-500" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Buscar por número o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </Select>
            <Select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}>
              <option value="">Todos los proveedores</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </Select>
            <Button
              variant="secondary"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setVendorFilter("");
              }}>
              <Filter className="w-5 h-5 mr-2" />
              Limpiar
            </Button>
          </div>
        </Card>

        {/* Purchases List */}
        {loading ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Cargando compras...
            </p>
          </Card>
        ) : filteredPurchases.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron compras
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPurchases.map((purchase) => (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}>
                <Card className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl font-bold text-purple-600">
                          {purchase.purchaseNumber}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            purchase.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                          {purchase.status}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            purchase.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}>
                          {purchase.paymentStatus === "paid"
                            ? "Pagado"
                            : "Pendiente"}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {purchase.vendor ? purchase.vendor.name : "N/A"}
                      </h3>
                      {purchase.invoiceNumber && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Factura: {purchase.invoiceNumber}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        {new Date(purchase.createdAt).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-red-600">
                        ${purchase.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Subtotal: ${purchase.subtotal.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {purchase.paymentMethod.toUpperCase()}
                      </p>
                      {purchase.items && purchase.items.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          {purchase.items.length} producto(s)
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

      {/* Create Purchase Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Nueva Compra">
        <div className="space-y-4">
          {/* Vendor Selection */}
          <Select
            label="Proveedor *"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}>
            <option value="">Seleccionar proveedor</option>
            {vendors &&
              vendors
                .filter((v) => v.status === "active")
                .map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
          </Select>

          {/* Add Products */}
          <div>
            <h3 className="font-semibold mb-3">Productos</h3>
            <div className="grid grid-cols-12 gap-2 mb-3">
              <div className="col-span-5">
                <Select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}>
                  <option value="">Seleccionar producto</option>
                  {products &&
                    products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
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
                  value={unitCost}
                  onChange={(e) => setUnitCost(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  placeholder="Costo"
                />
              </div>
              <div className="col-span-2">
                <Button
                  onClick={addItem}
                  disabled={!selectedProduct || unitCost <= 0}
                  className="w-full">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Items List */}
            {purchaseItems.length > 0 && (
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                {purchaseItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-gray-600">
                        {item.quantity} x ${item.unitCost.toFixed(2)}
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

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Número de Factura"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="FAC-001"
            />
            <Input
              label="Fecha de Vencimiento"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Totals */}
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
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-red-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              rows={2}
              placeholder="Notas adicionales..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreatePurchase}
              disabled={!vendorId || purchaseItems.length === 0}
              className="flex-1">
              Crear Compra
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
