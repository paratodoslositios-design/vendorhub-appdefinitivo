import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  // Verificar token de autorización (debe coincidir con la variable de entorno)
  if (authHeader !== `Bearer ${process.env.MIGRATE_TOKEN}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const results = [];

    // Verificar y agregar columna cost en Product si no existe
    try {
      const costResult = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Product' 
        AND column_name = 'cost'
      `;

      if (!Array.isArray(costResult) || costResult.length === 0) {
        await prisma.$executeRaw`
          ALTER TABLE "Product" 
          ADD COLUMN "cost" REAL
        `;
        results.push("Columna 'cost' agregada a la tabla Product");
      } else {
        results.push("La columna 'cost' ya existe en la tabla Product");
      }
    } catch (error) {
      const typedError = error as Error;
      if (!typedError.message?.includes("already exists")) {
        throw typedError;
      }
      results.push("La columna 'cost' ya existe en la tabla Product");
    }

    // Verificar y agregar columna taxId en Vendor si no existe
    try {
      const taxIdResult = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Vendor' 
        AND column_name = 'taxId'
      `;

      if (!Array.isArray(taxIdResult) || taxIdResult.length === 0) {
        await prisma.$executeRaw`
          ALTER TABLE "Vendor" 
          ADD COLUMN "taxId" TEXT
        `;
        results.push("Columna 'taxId' agregada a la tabla Vendor");
      } else {
        results.push("La columna 'taxId' ya existe en la tabla Vendor");
      }
    } catch (error) {
      const typedError = error as Error;
      if (!typedError.message?.includes("already exists")) {
        throw typedError;
      }
      results.push("La columna 'taxId' ya existe en la tabla Vendor");
    }

    return NextResponse.json({
      message: "Migración completada exitosamente",
      results,
    });
  } catch (error) {
    console.error("Error en migración:", error);

    const typedError = error as Error;
    return NextResponse.json(
      {
        error: "Error al ejecutar migración",
        details: typedError.message,
      },
      { status: 500 }
    );
  }
}
