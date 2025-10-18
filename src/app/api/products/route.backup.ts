import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { handlePrismaError } from "@/lib/prismaErrorHandler";
import type { CreateProductInput, UpdateProductInput } from "@/types";

// GET - List all products
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const vendorId = searchParams.get("vendorId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: {
      name?: { contains: string; mode: "insensitive" };
      category?: string;
      status?: string;
      vendorId?: string;
    } = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (category) where.category = category;
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;

    // Usar const en lugar de let
    const orderBy = { createdAt: "desc" as const };

    try {
      // Intentar obtener productos con todas las columnas
      const products = await prisma.product.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await prisma.product.count({ where });

      return NextResponse.json({
        products: products || [],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      // Si hay error, intentar con consulta más simple
      console.error("Error detallado en productos:", error);

      const products = await prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await prisma.product.count({ where });

      return NextResponse.json({
        products: products || [],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }
  } catch (error) {
    console.error("Get products error:", error);
    return handlePrismaError(error);
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body: CreateProductInput = await request.json();
    const {
      name,
      description,
      price,
      cost,
      stock,
      sku,
      category,
      status,
      image,
      vendorId,
    } = body;

    // Validate required fields
    if (!name || !price || !sku || !category || !vendorId) {
      return NextResponse.json(
        { error: "Nombre, precio, SKU, categoría y proveedor son requeridos" },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Ya existe un producto con este SKU" },
        { status: 400 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price.toString()),
        cost:
          cost !== undefined
            ? cost
              ? parseFloat(cost.toString())
              : null
            : null,
        stock: parseInt(stock.toString()),
        sku,
        category,
        status: status || "available",
        image: image || null,
        vendorId,
      },
      include: {
        vendor: true,
      },
    });

    // Create audit log
    await createAuditLog(user.userId, "CREATE", "Product", product.id, {
      name: product.name,
      sku: product.sku,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return handlePrismaError(error);
  }
}

// GET by ID - Get a specific product
export async function GET_BY_ID(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id } = context.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        vendor: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Get product error:", error);
    return handlePrismaError(error);
  }
}

// PUT - Update a product
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id } = context.params;
    const body: UpdateProductInput = await request.json();
    const {
      name,
      description,
      price,
      cost,
      stock,
      sku,
      category,
      status,
      image,
      vendorId,
    } = body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Check if SKU already exists (if changed)
    if (sku && sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku },
      });

      if (skuExists) {
        return NextResponse.json(
          { error: "Ya existe un producto con este SKU" },
          { status: 400 }
        );
      }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name || existingProduct.name,
        description:
          description !== undefined ? description : existingProduct.description,
        price:
          price !== undefined
            ? parseFloat(price.toString())
            : existingProduct.price,
        cost:
          cost !== undefined
            ? cost
              ? parseFloat(cost.toString())
              : null
            : existingProduct.cost,
        stock:
          stock !== undefined
            ? parseInt(stock.toString())
            : existingProduct.stock,
        sku: sku || existingProduct.sku,
        category: category || existingProduct.category,
        status: status || existingProduct.status,
        image: image !== undefined ? image : existingProduct.image,
        vendorId: vendorId || existingProduct.vendorId,
      },
      include: {
        vendor: true,
      },
    });

    // Create audit log
    await createAuditLog(user.userId, "UPDATE", "Product", product.id, {
      name: product.name,
      sku: product.sku,
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Update product error:", error);
    return handlePrismaError(error);
  }
}

// DELETE - Delete a product
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = context.params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Delete product
    await prisma.product.delete({
      where: { id },
    });

    // Create audit log
    await createAuditLog(user.userId, "DELETE", "Product", id, {
      name: existingProduct.name,
      sku: existingProduct.sku,
    });

    return NextResponse.json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("Delete product error:", error);
    return handlePrismaError(error);
  }
}
