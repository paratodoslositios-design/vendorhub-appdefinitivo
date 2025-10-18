import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { handlePrismaError } from "@/lib/prismaErrorHandler";
import type { UpdateVendorInput } from "@/types";

// GET by ID - Get a specific vendor
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id } = context.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ vendor });
  } catch (error) {
    console.error("Get vendor error:", error);
    return handlePrismaError(error);
  }
}

// PUT - Update a vendor
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id } = context.params;
    const body: UpdateVendorInput = await request.json();
    const { name, email, phone, address, description, status, taxId, website } = body;

    // Check if vendor exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { id },
    });

    if (!existingVendor) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
    }

    // Check if email already exists (if changed)
    if (email && email !== existingVendor.email) {
      const emailExists = await prisma.vendor.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Ya existe un proveedor con este email" },
          { status: 400 }
        );
      }
    }

    // Update vendor
    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        name: name || existingVendor.name,
        email: email || existingVendor.email,
        phone: phone !== undefined ? phone : existingVendor.phone,
        address: address !== undefined ? address : existingVendor.address,
        description: description !== undefined ? description : existingVendor.description,
        status: status || existingVendor.status,
        taxId: taxId !== undefined ? taxId : existingVendor.taxId,
        website: website !== undefined ? website : existingVendor.website,
      },
    });

    // Create audit log
    await createAuditLog(
      user.userId,
      "UPDATE",
      "Vendor",
      vendor.id,
      { name: vendor.name, email: vendor.email }
    );

    return NextResponse.json({ vendor });
  } catch (error) {
    console.error("Update vendor error:", error);
    return handlePrismaError(error);
  }
}

// DELETE - Delete a vendor
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = context.params;

    // Check if vendor exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { id },
    });

    if (!existingVendor) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
    }

    // Check if vendor has products
    const productCount = await prisma.product.count({
      where: { vendorId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar el proveedor porque tiene productos asociados" },
        { status: 400 }
      );
    }

    // Delete vendor
    await prisma.vendor.delete({
      where: { id },
    });

    // Create audit log
    await createAuditLog(
      user.userId,
      "DELETE",
      "Vendor",
      id,
      { name: existingVendor.name, email: existingVendor.email }
    );

    return NextResponse.json({ message: "Proveedor eliminado exitosamente" });
  } catch (error) {
    console.error("Delete vendor error:", error);
    return handlePrismaError(error);
  }
}