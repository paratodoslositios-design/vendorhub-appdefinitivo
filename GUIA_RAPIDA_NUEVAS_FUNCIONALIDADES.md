# 🚀 Guía Rápida - Nuevas Funcionalidades

## ⚡ Inicio Rápido

### **Paso 1: Regenerar Base de Datos**

La base de datos ahora tiene nuevos modelos. Necesitas crear una nueva migración:

```bash
# Navega al directorio del proyecto
cd vendor-products-app

# Genera el cliente de Prisma
npx prisma generate

# Crea y aplica la migración
npx prisma migrate dev --name add_enterprise_features

# (Opcional) Carga datos de prueba
npm run seed
```

### **Paso 2: Iniciar la Aplicación**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔐 Sistema de Autenticación

### **Crear Usuario Administrador (Primera vez)**

Como no tienes interfaz de registro todavía, puedes crear un usuario directamente en la base de datos:

**Opción 1: Usando Prisma Studio**

```bash
npx prisma studio
```

1. Ve a la tabla `User`
2. Crea un nuevo usuario con:
   - email: `admin@vendorhub.com`
   - password: Hash de tu contraseña (ver más abajo)
   - name: `Administrator`
   - role: `admin`
   - status: `active`

**Opción 2: Script Rápido**

Crea un archivo `create-admin.ts` en la raíz:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createAdmin() {
  // Hash simple (en producción usar bcrypt)
  const password = "admin123"; // Cambiar por tu contraseña
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "salt_key_secret");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedPassword = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const user = await prisma.user.create({
    data: {
      email: "admin@vendorhub.com",
      password: hashedPassword,
      name: "Administrator",
      role: "admin",
      status: "active",
    },
  });

  console.log("✅ Usuario admin creado:", user.email);
}

createAdmin();
```

Ejecuta:

```bash
npx tsx create-admin.ts
```

---

## 💰 Crear una Venta

### **Desde la Interfaz:**

1. Ve a **http://localhost:3000/sales**
2. Clic en **"Nueva Venta"**
3. Completa el formulario:
   - Nombre del cliente (requerido)
   - Email y teléfono (opcional)
   - Selecciona productos
   - Define cantidad y descuentos
   - Selecciona método de pago
   - Revisa el total
4. Clic en **"Crear Venta"**

### **Desde la API:**

```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=TU_TOKEN" \
  -d '{
    "customerName": "Juan Pérez",
    "customerEmail": "juan@email.com",
    "items": [
      {
        "productId": "ID_DEL_PRODUCTO",
        "quantity": 2,
        "unitPrice": 29.99,
        "discount": 0
      }
    ],
    "paymentMethod": "cash",
    "paymentStatus": "paid",
    "tax": 4.80,
    "discount": 0
  }'
```

---

## 📦 Crear una Compra

### **Desde la Interfaz:**

1. Ve a **http://localhost:3000/purchases**
2. Clic en **"Nueva Compra"**
3. Completa el formulario:
   - Selecciona proveedor (requerido)
   - Agrega productos con su costo
   - Define cantidad
   - Número de factura (opcional)
   - Fecha de vencimiento (opcional)
   - Método de pago
4. Clic en **"Crear Compra"**

### **Desde la API:**

```bash
curl -X POST http://localhost:3000/api/purchases \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=TU_TOKEN" \
  -d '{
    "vendorId": "ID_DEL_PROVEEDOR",
    "items": [
      {
        "productId": "ID_DEL_PRODUCTO",
        "quantity": 10,
        "unitCost": 15.00
      }
    ],
    "paymentMethod": "transfer",
    "paymentStatus": "paid",
    "invoiceNumber": "FAC-001",
    "tax": 0,
    "discount": 0
  }'
```

---

## 📊 Navegación de la Aplicación

### **Estructura de Menú:**

```
🏠 Home          → Landing page
📊 Dashboard     → Estadísticas y reportes
🏢 Vendors       → Gestión de proveedores
📦 Products      → Gestión de productos
💰 Ventas        → Módulo de ventas (NUEVO)
📦 Compras       → Módulo de compras (NUEVO)
```

---

## 🎯 Funcionalidades Clave

### **1. Control de Inventario Automático**

Cuando creas una venta:

- ✅ El stock se reduce automáticamente
- ✅ Se crea un registro en `InventoryMovement`
- ✅ Si el stock queda bajo, se genera una alerta
- ✅ Si se agota, se notifica

Cuando creas una compra:

- ✅ El stock se incrementa automáticamente
- ✅ Se actualiza el precio de costo del producto
- ✅ Se registra el movimiento de inventario

### **2. Numeración Automática**

- **Ventas:** VEN-00001, VEN-00002, VEN-00003...
- **Compras:** COM-00001, COM-00002, COM-00003...

Se generan automáticamente y son secuenciales.

### **3. Alertas de Stock**

El sistema monitorea el inventario y:

- Si `stock <= minStock` → Alerta de "Stock Bajo"
- Si `stock <= 0` → Alerta de "Sin Stock"

Las alertas se envían como notificaciones a los usuarios con rol `admin` o `vendor`.

### **4. Auditoría Completa**

Todas las acciones se registran en `AuditLog`:

- LOGIN / LOGOUT
- CREATE / UPDATE / DELETE
- Información de IP y navegador
- Detalles en JSON

---

## 📈 Reportes y Estadísticas

### **Dashboard de Ventas:**

```
┌─────────────────┬──────────────┬─────────────┬──────────────┐
│ Total Ventas    │ Ingresos     │ Pagadas     │ Pendientes   │
├─────────────────┼──────────────┼─────────────┼──────────────┤
│ 150             │ $45,299.99   │ 120         │ 30           │
└─────────────────┴──────────────┴─────────────┴──────────────┘
```

### **Dashboard de Compras:**

```
┌─────────────────┬──────────────┬─────────────┬──────────────┐
│ Total Compras   │ Total Gasto  │ Este Mes    │ Proveedores  │
├─────────────────┼──────────────┼─────────────┼──────────────┤
│ 85              │ $28,750.50   │ 12          │ 8            │
└─────────────────┴──────────────┴─────────────┴──────────────┘
```

---

## 🔍 Filtros Disponibles

### **En Ventas:**

- Búsqueda por nombre de cliente o número de venta
- Filtro por estado (Completado, Cancelado, Reembolsado)
- Filtro por estado de pago (Pagado, Pendiente, Parcial)

### **En Compras:**

- Búsqueda por número o proveedor
- Filtro por estado (Completado, Cancelado)
- Filtro por proveedor específico

### **En Productos:**

- Búsqueda por nombre o SKU
- Filtro por proveedor
- Filtro por categoría
- Filtro por estado

---

## 🛠️ Resolución de Problemas

### **Error: "Property 'user' does not exist on Prisma"**

**Solución:**

```bash
npx prisma generate
```

Reinicia tu servidor de desarrollo.

### **Error: "No autenticado"**

**Causa:** No tienes un token de autenticación válido.

**Solución:**

1. Inicia sesión en `/api/auth/login`
2. El sistema generará una cookie `auth_token`
3. Las siguientes peticiones usarán esa cookie

### **Error: "Producto sin stock"**

**Causa:** Intentas vender un producto que no tiene stock.

**Solución:**

1. Crea una compra para ese producto
2. El sistema aumentará el stock automáticamente
3. Luego podrás venderlo

### **Migración falla**

**Solución 1 - Reset de base de datos (desarrollo):**

```bash
npx prisma migrate reset
npx prisma migrate dev --name init
npm run seed
```

**Solución 2 - Crear migración manual:**

```bash
npx prisma migrate dev --create-only
# Edita el archivo SQL generado si es necesario
npx prisma migrate deploy
```

---

## 🎨 Personalización

### **Cambiar Colores de Ventas/Compras:**

Edita los archivos:

- `src/app/sales/page.tsx`
- `src/app/purchases/page.tsx`

Busca clases de Tailwind como:

- `text-blue-600` → Color de texto
- `bg-green-100` → Color de fondo
- `border-purple-500` → Color de borde

### **Agregar Campos Personalizados:**

1. Actualiza `prisma/schema.prisma`
2. Ejecuta `npx prisma migrate dev`
3. Actualiza los tipos en `src/types/index.ts`
4. Actualiza las interfaces en las páginas

### **Modificar Numeración:**

En `src/app/api/sales/route.ts` busca:

```typescript
const saleNumber = `VEN-${String(...).padStart(5, '0')}`;
```

Cámbialo por tu formato preferido, por ejemplo:

```typescript
const saleNumber = `SALE-${year}-${String(...).padStart(4, '0')}`;
// Resultado: SALE-2025-0001
```

---

## 📚 Recursos Adicionales

### **Documentos del Proyecto:**

- `MEJORAS_PROFESIONALES.md` - Documento completo de mejoras
- `COMPLETE_GUIDE.md` - Guía original del proyecto
- `README.md` - Documentación general

### **Enlaces Útiles:**

- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Framer Motion: https://www.framer.com/motion

---

## 🎯 Checklist de Implementación

### **Para Empezar:**

- [ ] Ejecutar `npx prisma generate`
- [ ] Crear migración con `npx prisma migrate dev`
- [ ] Crear usuario administrador
- [ ] Ejecutar seed (opcional)
- [ ] Iniciar servidor de desarrollo

### **Primera Venta:**

- [ ] Verificar que hay productos en stock
- [ ] Ir a `/sales`
- [ ] Crear nueva venta
- [ ] Verificar que el inventario se actualizó

### **Primera Compra:**

- [ ] Verificar que hay proveedores activos
- [ ] Ir a `/purchases`
- [ ] Crear nueva compra
- [ ] Verificar que el stock aumentó

### **Verificar Funcionalidades:**

- [ ] Ver dashboard actualizado
- [ ] Revisar movimientos de inventario
- [ ] Verificar alertas de stock bajo (si aplica)
- [ ] Revisar logs de auditoría

---

## 💡 Tips Profesionales

### **1. Gestión de Stock:**

- Configura `minStock` y `maxStock` apropiados para cada producto
- Revisa regularmente las alertas de stock bajo
- Usa el histórico de movimientos para análisis

### **2. Control de Costos:**

- Siempre registra el costo en las compras
- Compara precio de venta vs costo para calcular margen
- Analiza qué productos tienen mejor margen

### **3. Gestión de Clientes:**

- Mantén emails actualizados para notificaciones
- Registra teléfonos para seguimiento
- Usa las notas para información adicional

### **4. Reportes:**

- Exporta PDFs regularmente desde el dashboard
- Filtra por fechas para análisis mensuales
- Compara ventas vs compras para ver rentabilidad

### **5. Seguridad:**

- Cambia las contraseñas por defecto
- Usa roles apropiados para cada usuario
- Revisa los logs de auditoría periódicamente

---

## 🚀 ¡Listo para Usar!

Tu aplicación está completamente configurada y lista para:

- ✅ Registrar ventas diarias
- ✅ Gestionar compras a proveedores
- ✅ Controlar inventario automáticamente
- ✅ Generar reportes profesionales
- ✅ Monitorear el negocio en tiempo real

**¡Éxito con tu nueva plataforma empresarial!** 🎊

---

_Guía creada: Octubre 2025_
_VendorHub Enterprise Edition_
