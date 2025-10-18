import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import type { CreateSaleInput } from "@/types";

// GET - List all sales
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const vendorId = searchParams.get("vendorId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (vendorId) where.vendorId = vendorId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate)
        (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
      if (endDate)
        (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                image: true,
                vendorId: true,
                vendor: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sales });
  } catch (error) {
    console.error("Get sales error:", error);
    return NextResponse.json(
      { error: "Error al obtener ventas" },
      { status: 500 }
    );
  }
}

// POST - Create a new sale
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body: CreateSaleInput = await request.json();
    const {
      vendorId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      paymentMethod,
      paymentStatus = "pending",
      notes,
      tax = 0,
      discount = 0,
    } = body;

    // Validate input
    if (!customerName || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Nombre del cliente y productos son requeridos" },
        { status: 400 }
      );
    }

    // Validate vendor if provided
    if (vendorId) {
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
      });
      if (!vendor) {
        return NextResponse.json(
          { error: "Proveedor no encontrado" },
          { status: 404 }
        );
      }
    }

    // Validate that all products exist and belong to the vendor if specified
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Producto con ID ${item.productId} no encontrado` },
          { status: 404 }
        );
      }

      // If vendor is specified, ensure product belongs to that vendor
      if (vendorId && product.vendorId !== vendorId) {
        return NextResponse.json(
          {
            error: `El producto "${product.name}" no pertenece al proveedor seleccionado`,
          },
          { status: 400 }
        );
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para el producto "${product.name}". Disponible: ${product.stock}`,
          },
          { status: 400 }
        );
      }
    }

    // Generate sale number
    const lastSale = await prisma.sale.findFirst({
      orderBy: { createdAt: "desc" },
      select: { saleNumber: true },
    });
    const saleNumber = `VEN-${String(
      (lastSale ? parseInt(lastSale.saleNumber.split("-")[1]) : 0) + 1
    ).padStart(5, "0")}`;

    // Calculate totals
    let subtotal = 0;
    const itemsWithSubtotal = items.map((item) => {
      const itemSubtotal =
        item.unitPrice * item.quantity - (item.discount || 0);
      subtotal += itemSubtotal;
      return {
        ...item,
        subtotal: itemSubtotal,
      };
    });

    const total = subtotal + tax - discount;

    // Create sale with items
    const sale = await prisma.sale.create({
      data: {
        saleNumber,
        vendorId: vendorId || null,
        customerName,
        customerEmail,
        customerPhone,
        subtotal,
        tax,
        discount,
        total,
        paymentMethod,
        paymentStatus,
        notes,
        createdById: user.userId,
        items: {
          create: itemsWithSubtotal.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        vendor: true,
      },
    });

    // Update product stock and create inventory movements
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (product) {
        const newStock = product.stock - item.quantity;
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: newStock },
        });

        // Create inventory movement with vendor information
        await prisma.inventoryMovement.create({
          data: {
            productId: item.productId,
            vendorId: product.vendorId,
            type: "out",
            quantity: item.quantity,
            previousStock: product.stock,
            newStock,
            reason: "Venta",
            reference: saleNumber,
          },
        });

        // Check for low stock alert
        if (newStock <= product.minStock && newStock > 0) {
          await createNotification(
            user.userId,
            "warning",
            "Stock bajo",
            `El producto "${product.name}" tiene stock bajo (${newStock}/${product.minStock})`,
            `/products?search=${product.name}`
          );
        } else if (newStock <= 0) {
          await createNotification(
            user.userId,
            "error",
            "Sin stock",
            `El producto "${product.name}" se ha agotado`,
            `/products?search=${product.name}`
          );
        }
      }
    }

    // Update vendor total sales if vendor is specified
    if (vendorId) {
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
      });
      if (vendor) {
        await prisma.vendor.update({
          where: { id: vendorId },
          data: {
            totalSales: vendor.totalSales + total,
          },
        });
      }
    }

    // Create audit log
    await createAuditLog(user.userId, "CREATE", "Sale", sale.id, {
      saleNumber,
      total,
      customerName,
    });

    return NextResponse.json({ sale }, { status: 201 });
  } catch (error) {
    console.error("Create sale error:", error);
    return NextResponse.json(
      { error: "Error al crear venta" },
      { status: 500 }
    );
  }
}
