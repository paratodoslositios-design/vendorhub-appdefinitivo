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

    // Aplicar migraciones de Prisma automáticamente
    try {
      // Este endpoint aplicará todas las migraciones pendientes
      // Similar a ejecutar "npx prisma migrate deploy" pero programáticamente

      // Verificar si la columna cost existe en Product
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

      // Verificar si la columna taxId existe en Vendor
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

      // Verificar si la columna totalSales existe en Vendor
      const totalSalesResult = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Vendor' 
        AND column_name = 'totalSales'
      `;

      if (!Array.isArray(totalSalesResult) || totalSalesResult.length === 0) {
        await prisma.$executeRaw`
          ALTER TABLE "Vendor" 
          ADD COLUMN "totalSales" REAL DEFAULT 0
        `;
        results.push("Columna 'totalSales' agregada a la tabla Vendor");
      } else {
        results.push("La columna 'totalSales' ya existe en la tabla Vendor");
      }

      // Verificar si la columna vendorId existe en Sale
      const vendorIdResult = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Sale' 
        AND column_name = 'vendorId'
      `;

      if (!Array.isArray(vendorIdResult) || vendorIdResult.length === 0) {
        await prisma.$executeRaw`
          ALTER TABLE "Sale" 
          ADD COLUMN "vendorId" TEXT REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE
        `;
        results.push("Columna 'vendorId' agregada a la tabla Sale");
      } else {
        results.push("La columna 'vendorId' ya existe en la tabla Sale");
      }

      return NextResponse.json({
        message: "Migraciones aplicadas exitosamente",
        results,
      });
    } catch (error) {
      const typedError = error as Error;
      console.error("Error aplicando migraciones:", typedError);

      // Si hay error pero queremos continuar, registrar y seguir
      results.push(`Error parcial: ${typedError.message}`);

      return NextResponse.json(
        {
          message: "Migración completada con algunos errores",
          results,
          error: typedError.message,
        },
        { status: 200 }
      ); // 200 para continuar aunque haya errores parciales
    }
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
