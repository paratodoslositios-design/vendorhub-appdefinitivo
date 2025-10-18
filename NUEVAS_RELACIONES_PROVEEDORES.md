# 🔗 Nuevas Relaciones: Ventas y Compras con Proveedores

## 📋 Resumen de Cambios

Se han implementado **relaciones estrictas** entre ventas, compras y proveedores para mejorar la trazabilidad y control del negocio.

## ✅ Cambios Implementados

### 1. **Schema de Base de Datos** (`prisma/schema.prisma`)

#### Modelo `Sale` (Ventas)

- ✅ Agregado campo `vendorId` opcional
- ✅ Relación con `Vendor` para rastrear el proveedor de los productos vendidos
- ✅ Los productos vendidos pueden pertenecer a diferentes proveedores o a un proveedor específico

#### Modelo `Vendor` (Proveedores)

- ✅ Agregado campo `totalSales` para rastrear ventas totales del proveedor
- ✅ Relación con `Sale` para ver todas las ventas de productos del proveedor

### 2. **API Backend**

#### `/api/sales/route.ts` (Ventas)

**Nuevas Validaciones:**

- ✅ Validación de existencia del proveedor si se especifica
- ✅ Validación de que los productos pertenecen al proveedor seleccionado
- ✅ Validación de stock disponible antes de crear la venta
- ✅ Actualización automática del campo `totalSales` del proveedor
- ✅ Registro de movimientos de inventario con información del proveedor

**Nuevos Filtros:**

- ✅ Filtrar ventas por proveedor (`?vendorId=xxx`)
- ✅ Incluye información del proveedor en la respuesta

#### `/api/purchases/route.ts` (Compras)

**Validaciones Mejoradas:**

- ✅ Validación estricta de que el proveedor existe
- ✅ Validación de que **TODOS** los productos pertenecen al proveedor seleccionado
- ✅ Mensaje de error descriptivo si un producto no pertenece al proveedor

### 3. **Frontend UI**

#### Página de Ventas (`/src/app/sales/page.tsx`)

**Nuevas Características:**

- ✅ Selector de proveedor (opcional) en el formulario de nueva venta
- ✅ Filtro de productos por proveedor seleccionado
- ✅ Validación en tiempo real de productos según proveedor
- ✅ Filtro adicional de ventas por proveedor en la lista
- ✅ Muestra el nombre del proveedor en cada producto del selector
- ✅ Limpia items seleccionados al cambiar de proveedor

#### Página de Compras (`/src/app/purchases/page.tsx`)

- ✅ Ya tenía validaciones, se mejoraron con mensajes más descriptivos

### 4. **Tipos TypeScript** (`/src/types/index.ts`)

- ✅ Actualizado `Sale` interface con `vendorId` y `vendor`
- ✅ Actualizado `Vendor` interface con `totalSales`
- ✅ Actualizado `CreateSaleInput` con `vendorId` opcional

## 🗄️ Migración de Base de Datos

**Migración:** `20251018152108_add_vendor_to_sales`

```sql
-- Agregado a la tabla Sale:
- vendorId (TEXT, NULL, FK a Vendor)

-- Agregado a la tabla Vendor:
- totalSales (REAL, DEFAULT 0)
```

## 📊 Flujo de Trabajo

### Compras (Purchases)

1. Seleccionar un proveedor (obligatorio)
2. Solo se pueden agregar productos que pertenecen a ese proveedor
3. Si intentas agregar un producto de otro proveedor → ❌ Error
4. Al completar la compra:
   - ✅ Se actualiza el stock del producto
   - ✅ Se actualiza `totalPurchases` del proveedor
   - ✅ Se crea movimiento de inventario con referencia al proveedor

### Ventas (Sales)

1. Opcionalmente seleccionar un proveedor
2. **Si seleccionas un proveedor:**
   - Solo se muestran productos de ese proveedor
   - Se valida que todos los productos pertenezcan a ese proveedor
3. **Si NO seleccionas proveedor:**
   - Se muestran productos de todos los proveedores
   - Se pueden mezclar productos de diferentes proveedores
4. Al completar la venta:
   - ✅ Se valida stock disponible
   - ✅ Se reduce el stock de cada producto
   - ✅ Se actualiza `totalSales` del proveedor (si aplica)
   - ✅ Se crea movimiento de inventario con referencia al proveedor

## 🚀 Deployment en Render

### ⚠️ IMPORTANTE: Acciones Requeridas

#### Opción 1: Deploy Automático (Recomendado)

Render detectará automáticamente la nueva migración y la aplicará durante el deployment:

1. **Hacer commit de los cambios:**

   ```bash
   git add .
   git commit -m "feat: Agregar relaciones de proveedores en ventas y compras"
   git push origin main
   ```

2. **Render ejecutará automáticamente:**

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

3. **Verificar logs** en Render Dashboard para confirmar la migración exitosa

#### Opción 2: Deploy Manual

Si necesitas aplicar la migración manualmente:

1. **Conectarse a Render Shell:**

   - Ve a tu servicio en Render Dashboard
   - Click en "Shell" tab

2. **Ejecutar comandos:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

### ✅ Verificación Post-Deploy

1. **Verificar la base de datos:**

   - Tabla `Sale` debe tener columna `vendorId`
   - Tabla `Vendor` debe tener columna `totalSales`

2. **Probar funcionalidades:**
   - ✅ Crear una compra (debe validar proveedor)
   - ✅ Crear una venta sin proveedor (debe funcionar)
   - ✅ Crear una venta con proveedor (debe filtrar productos)
   - ✅ Intentar agregar producto de otro proveedor (debe fallar)

## 🎯 Beneficios

1. **Trazabilidad Completa:**

   - Sabes de qué proveedor provienen los productos vendidos
   - Puedes generar reportes de ventas por proveedor

2. **Control de Integridad:**

   - No puedes comprar productos que no pertenecen al proveedor
   - Validaciones automáticas previenen errores de datos

3. **Métricas Mejoradas:**

   - `totalPurchases`: Total comprado al proveedor
   - `totalSales`: Total vendido de productos del proveedor

4. **Inventario Preciso:**
   - Movimientos de inventario rastrean el proveedor
   - Mejor visibilidad de stock por proveedor

## 📝 Notas Importantes

- La relación `vendorId` en `Sale` es **opcional** para mantener flexibilidad
- Las compras **siempre** requieren un proveedor
- Los productos existentes no se ven afectados
- Las ventas existentes mantendrán `vendorId = null`

## 🔧 Comandos Útiles

```bash
# Verificar estado de migraciones
npx prisma migrate status

# Aplicar migraciones pendientes
npx prisma migrate deploy

# Regenerar Prisma Client
npx prisma generate

# Ver schema actual
npx prisma db pull
```

## 🐛 Troubleshooting

### Error: "El producto no pertenece al proveedor"

**Causa:** Intentaste agregar un producto de un proveedor diferente al seleccionado
**Solución:** Cambia el proveedor o selecciona un producto del proveedor correcto

### Error: "Stock insuficiente"

**Causa:** No hay suficiente stock del producto
**Solución:** Verifica el stock disponible o crea una compra primero

### Migración no se aplica automáticamente

**Causa:** Render no detectó los cambios
**Solución:** Ejecuta manualmente `npx prisma migrate deploy` desde Render Shell

---

**Fecha de Implementación:** 2025-10-18  
**Versión:** 1.0.0  
**Migración:** `20251018152108_add_vendor_to_sales`
