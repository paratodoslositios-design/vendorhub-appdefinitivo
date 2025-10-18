import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  // Verificar token de autorización (debe coincidir con la variable de entorno)
  if (authHeader !== `Bearer ${process.env.MIGRATE_TOKEN}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Verificar si la columna cost existe
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Product' 
      AND column_name = 'cost'
    `;

    if (Array.isArray(result) && result.length > 0) {
      return NextResponse.json({
        message: "La columna 'cost' ya existe en la tabla Product",
      });
    }

    // Si no existe, intentar agregarla
    await prisma.$executeRaw`
      ALTER TABLE "Product" 
      ADD COLUMN "cost" REAL
    `;

    return NextResponse.json({
      message: "Columna 'cost' agregada exitosamente a la tabla Product",
    });
  } catch (error) {
    console.error("Error en migración:", error);

    // Verificar si es un error con mensaje
    const typedError = error as Error;

    // Si el error es porque la columna ya existe, retornar éxito
    if (
      typedError.message?.includes("column") &&
      typedError.message?.includes("already exists")
    ) {
      return NextResponse.json({
        message: "La columna 'cost' ya existe (no se realizó ningún cambio)",
      });
    }

    return NextResponse.json(
      {
        error: "Error al ejecutar migración",
        details: typedError.message,
      },
      { status: 500 }
    );
  }
}
