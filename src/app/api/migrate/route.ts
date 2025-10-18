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
    const warnings = [];

    // Verificar estado actual de la base de datos
    try {
      // Verificar si la columna cost existe en Product
      const costResult = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Product' 
        AND column_name = 'cost'
      `;

      if (!Array.isArray(costResult) || costResult.length === 0) {
        try {
          await prisma.$executeRaw`
            ALTER TABLE "Product" 
            ADD COLUMN "cost" REAL
          `;
          results.push("✅ Columna 'cost' agregada a la tabla Product");
        } catch (columnError) {
          const typedError = columnError as Error;
          if (!typedError.message?.includes("already exists")) {
            warnings.push(
              `⚠️ Error al agregar columna 'cost': ${typedError.message}`
            );
          } else {
            results.push("✅ La columna 'cost' ya existe en la tabla Product");
          }
        }
      } else {
        results.push("✅ La columna 'cost' ya existe en la tabla Product");
      }

      // Verificar si la columna taxId existe en Vendor
      const taxIdResult = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Vendor' 
        AND column_name = 'taxId'
      `;

      if (!Array.isArray(taxIdResult) || taxIdResult.length === 0) {
        try {
          await prisma.$executeRaw`
            ALTER TABLE "Vendor" 
            ADD COLUMN "taxId" TEXT
          `;
          results.push("✅ Columna 'taxId' agregada a la tabla Vendor");
        } catch (columnError) {
          const typedError = columnError as Error;
          if (!typedError.message?.includes("already exists")) {
            warnings.push(
              `⚠️ Error al agregar columna 'taxId': ${typedError.message}`
            );
          } else {
            results.push("✅ La columna 'taxId' ya existe en la tabla Vendor");
          }
        }
      } else {
        results.push("✅ La columna 'taxId' ya existe en la tabla Vendor");
      }

      // Verificar si la columna totalSales existe en Vendor
      const totalSalesResult = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Vendor' 
        AND column_name = 'totalSales'
      `;

      if (!Array.isArray(totalSalesResult) || totalSalesResult.length === 0) {
        try {
          await prisma.$executeRaw`
            ALTER TABLE "Vendor" 
            ADD COLUMN "totalSales" REAL DEFAULT 0
          `;
          results.push("✅ Columna 'totalSales' agregada a la tabla Vendor");
        } catch (columnError) {
          const typedError = columnError as Error;
          if (!typedError.message?.includes("already exists")) {
            warnings.push(
              `⚠️ Error al agregar columna 'totalSales': ${typedError.message}`
            );
          } else {
            results.push(
              "✅ La columna 'totalSales' ya existe en la tabla Vendor"
            );
          }
        }
      } else {
        results.push("✅ La columna 'totalSales' ya existe en la tabla Vendor");
      }

      // Verificar si la columna vendorId existe en Sale
      const vendorIdResult = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Sale' 
        AND column_name = 'vendorId'
      `;

      if (!Array.isArray(vendorIdResult) || vendorIdResult.length === 0) {
        try {
          await prisma.$executeRaw`
            ALTER TABLE "Sale" 
            ADD COLUMN "vendorId" TEXT REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE
          `;
          results.push("✅ Columna 'vendorId' agregada a la tabla Sale");
        } catch (columnError) {
          const typedError = columnError as Error;
          if (!typedError.message?.includes("already exists")) {
            warnings.push(
              `⚠️ Error al agregar columna 'vendorId': ${typedError.message}`
            );
          } else {
            results.push("✅ La columna 'vendorId' ya existe en la tabla Sale");
          }
        }
      } else {
        results.push("✅ La columna 'vendorId' ya existe en la tabla Sale");
      }

      // Verificar si existe la tabla _prisma_migrations
      try {
        const migrationTable = await prisma.$queryRaw`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_name = '_prisma_migrations'
        `;

        if (!Array.isArray(migrationTable) || migrationTable.length === 0) {
          warnings.push(
            "⚠️ Tabla _prisma_migrations no encontrada - algunas migraciones pueden no estar registradas"
          );
        }
      } catch (tableError) {
        warnings.push("⚠️ No se pudo verificar la tabla de migraciones");
      }

      return NextResponse.json({
        message: "Migraciones aplicadas exitosamente",
        results,
        warnings,
        status: "completed",
      });
    } catch (migrationError) {
      const typedError = migrationError as Error;
      console.error("Error aplicando migraciones:", typedError);

      return NextResponse.json(
        {
          message: "Migración completada con advertencias",
          results,
          warnings: [
            ...warnings,
            `⚠️ Error general en migración: ${typedError.message}`,
          ],
          status: "completed_with_warnings",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error en migración:", error);

    const typedError = error as Error;
    return NextResponse.json(
      {
        error: "Error crítico al ejecutar migración",
        details: typedError.message,
        status: "error",
      },
      { status: 500 }
    );
  }
}
