import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  // Verificar token de autorización
  if (authHeader !== `Bearer ${process.env.MIGRATE_TOKEN}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const diagnosis = {
      timestamp: new Date().toISOString(),
      database: {
        status: "unknown",
        error: null as string | null,
        tables: [] as string[],
      },
      api: {
        products: {
          status: "unknown",
          error: null as string | null,
          count: 0,
        },
        vendors: {
          status: "unknown",
          error: null as string | null,
          count: 0,
        },
      },
      migrations: {
        status: "unknown",
        error: null as string | null,
        missingColumns: [] as string[],
      },
    };

    // Verificar conexión a base de datos
    try {
      await prisma.$queryRaw`SELECT 1`;
      diagnosis.database.status = "connected";

      // Obtener lista de tablas
      const tables = (await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `) as Array<{ table_name: string }>;

      diagnosis.database.tables = tables.map((t) => t.table_name);
    } catch (error) {
      const typedError = error as Error;
      diagnosis.database.status = "error";
      diagnosis.database.error = typedError.message;
    }

    // Verificar productos
    try {
      const count = await prisma.product.count();
      diagnosis.api.products.status = "ok";
      diagnosis.api.products.count = count;
    } catch (error) {
      const typedError = error as Error;
      diagnosis.api.products.status = "error";
      diagnosis.api.products.error = typedError.message;

      // Verificar columnas faltantes
      const missingColumns = [];

      try {
        await prisma.$queryRaw`SELECT "id" FROM "Product" LIMIT 1`;
      } catch {
        missingColumns.push("Product table");
      }

      try {
        await prisma.$queryRaw`SELECT "cost" FROM "Product" LIMIT 1`;
      } catch {
        missingColumns.push("Product.cost");
      }

      diagnosis.migrations.missingColumns = [
        ...diagnosis.migrations.missingColumns,
        ...missingColumns,
      ];
    }

    // Verificar proveedores
    try {
      const count = await prisma.vendor.count();
      diagnosis.api.vendors.status = "ok";
      diagnosis.api.vendors.count = count;
    } catch (error) {
      const typedError = error as Error;
      diagnosis.api.vendors.status = "error";
      diagnosis.api.vendors.error = typedError.message;

      // Verificar columnas faltantes
      const missingColumns = [];

      try {
        await prisma.$queryRaw`SELECT "id" FROM "Vendor" LIMIT 1`;
      } catch {
        missingColumns.push("Vendor table");
      }

      try {
        await prisma.$queryRaw`SELECT "taxId" FROM "Vendor" LIMIT 1`;
      } catch {
        missingColumns.push("Vendor.taxId");
      }

      diagnosis.migrations.missingColumns = [
        ...diagnosis.migrations.missingColumns,
        ...missingColumns,
      ];
    }

    return NextResponse.json({
      message: "Diagnóstico completado",
      diagnosis,
    });
  } catch (error) {
    console.error("Error en diagnóstico:", error);
    const typedError = error as Error;
    return NextResponse.json(
      {
        error: "Error al ejecutar diagnóstico",
        details: typedError.message,
      },
      { status: 500 }
    );
  }
}
