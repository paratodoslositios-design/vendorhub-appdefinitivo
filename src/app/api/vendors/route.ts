import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { handlePrismaError } from "@/lib/prismaErrorHandler";
import type { CreateVendorInput } from "@/types";

// GET - List all vendors
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: {
      name?: { contains: string; mode: "insensitive" };
      status?: string;
    } = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (status) where.status = status;

    // Usar const en lugar de let
    const orderBy = { createdAt: "desc" as const };

    try {
      // Intentar obtener vendors con todas las columnas
      const vendors = await prisma.vendor.findMany({
        where,
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await prisma.vendor.count({ where });

      return NextResponse.json({
        vendors: vendors || [],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      // Si hay error, intentar con consulta más simple
      console.error("Error detallado en vendors:", error);

      const vendors = await prisma.vendor.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await prisma.vendor.count({ where });

      return NextResponse.json({
        vendors: vendors || [],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }
  } catch (error) {
    console.error("Get vendors error:", error);
    return handlePrismaError(error);
  }
}

// POST - Create a new vendor
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body: CreateVendorInput = await request.json();
    const { name, email, phone, address, description, status, taxId, website } =
      body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { email },
    });

    if (existingVendor) {
      return NextResponse.json(
        { error: "Ya existe un proveedor con este email" },
        { status: 400 }
      );
    }

    // Create vendor
    const vendor = await prisma.vendor.create({
      data: {
        name,
        email,
        phone: phone || null,
        address: address || null,
        description: description || null,
        status: status || "active",
        taxId: taxId || null,
        website: website || null,
      },
    });

    // Create audit log
    await createAuditLog(user.userId, "CREATE", "Vendor", vendor.id, {
      name: vendor.name,
      email: vendor.email,
    });

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (error) {
    console.error("Create vendor error:", error);
    return handlePrismaError(error);
  }
}
