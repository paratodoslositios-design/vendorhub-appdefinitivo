import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import type { CreatePurchaseInput } from "@/types";

// GET - List all purchases
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Record<string, unknown> = {};
    if (vendorId) where.vendorId = vendorId;
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate)
        (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
      if (endDate)
        (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
    }

    const purchases = await prisma.purchase.findMany({
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

    return NextResponse.json({ purchases });
  } catch (error) {
    console.error("Get purchases error:", error);
    return NextResponse.json(
      { error: "Error al obtener compras" },
      { status: 500 }
    );
  }
}

// POST - Create a new purchase
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body: CreatePurchaseInput = await request.json();
    const {
      vendorId,
      items,
      paymentMethod,
      paymentStatus = "pending",
      invoiceNumber,
      dueDate,
      notes,
      tax = 0,
      discount = 0,
    } = body;

    // Validate input
    if (!vendorId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Proveedor y productos son requeridos" },
        { status: 400 }
      );
    }

    // Validate vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });
    if (!vendor) {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    // Validate that all products exist and belong to the vendor
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

      // Ensure product belongs to the vendor
      if (product.vendorId !== vendorId) {
        return NextResponse.json(
          {
            error: `El producto "${product.name}" no pertenece al proveedor "${vendor.name}"`,
          },
          { status: 400 }
        );
      }
    }

    // Generate purchase number
    const lastPurchase = await prisma.purchase.findFirst({
      orderBy: { createdAt: "desc" },
      select: { purchaseNumber: true },
    });
    const purchaseNumber = `COM-${String(
      (lastPurchase ? parseInt(lastPurchase.purchaseNumber.split("-")[1]) : 0) +
        1
    ).padStart(5, "0")}`;

    // Calculate totals
    let subtotal = 0;
    const itemsWithSubtotal = items.map((item) => {
      const itemSubtotal = item.unitCost * item.quantity;
      subtotal += itemSubtotal;
      return {
        ...item,
        subtotal: itemSubtotal,
      };
    });

    const total = subtotal + tax - discount;

    // Create purchase with items
    const purchase = await prisma.purchase.create({
      data: {
        purchaseNumber,
        vendorId,
        subtotal,
        tax,
        discount,
        total,
        paymentMethod,
        paymentStatus,
        invoiceNumber,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        createdById: user.userId,
        items: {
          create: itemsWithSubtotal.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
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

    // Update product stock, cost, and create inventory movements
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (product) {
        const newStock = product.stock + item.quantity;
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: newStock,
            cost: item.unitCost, // Update cost with latest purchase price
          },
        });

        // Create inventory movement
        await prisma.inventoryMovement.create({
          data: {
            productId: item.productId,
            vendorId,
            type: "in",
            quantity: item.quantity,
            previousStock: product.stock,
            newStock,
            reason: "Compra",
            reference: purchaseNumber,
          },
        });
      }
    }

    // Update vendor total purchases
    const vendorToUpdate = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });
    if (vendorToUpdate) {
      await prisma.vendor.update({
        where: { id: vendorId },
        data: {
          totalPurchases: vendorToUpdate.totalPurchases + total,
        },
      });
    }

    // Create audit log
    await createAuditLog(user.userId, "CREATE", "Purchase", purchase.id, {
      purchaseNumber,
      total,
      vendorId,
    });

    // Create notification
    await createNotification(
      user.userId,
      "success",
      "Compra registrada",
      `Compra ${purchaseNumber} registrada exitosamente por $${total.toFixed(
        2
      )}`,
      `/purchases/${purchase.id}`
    );

    return NextResponse.json({ purchase }, { status: 201 });
  } catch (error) {
    console.error("Create purchase error:", error);
    return NextResponse.json(
      { error: "Error al crear compra" },
      { status: 500 }
    );
  }
}
