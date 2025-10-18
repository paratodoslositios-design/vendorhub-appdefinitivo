# 📝 Notas Importantes - Deployment en Render

## ✅ Estado Actual

**Último deployment exitoso:** Render
**Entorno local:** SQLite (desarrollo)
**Entorno producción:** PostgreSQL (Render)

---

## ⚠️ IMPORTANTE: Configuración Dual

El proyecto está configurado para usar **SQLite en desarrollo** y **PostgreSQL en producción (Render)**.

### **Configuración Actual (Desarrollo):**

**`prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**`.env`:**

```env
DATABASE_URL="file:./dev.db"
```

### **Configuración para Render (Producción):**

**`prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "postgresql"  // ⚠️ CAMBIAR ANTES DE DEPLOYAR
  url      = env("DATABASE_URL")
}
```

**Variables de entorno en Render:**

```env
DATABASE_URL="postgresql://usuario:password@host:5432/database"
NODE_ENV="production"
```

---

## 🚀 Checklist Pre-Deployment en Render

### **1. Cambiar Base de Datos a PostgreSQL**

```bash
# Editar prisma/schema.prisma
# Cambiar: provider = "sqlite"
# Por:     provider = "postgresql"
```

### **2. Commit y Push a GitHub**

```bash
git add .
git commit -m "chore: switch to postgresql for render deployment"
git push origin main
```

### **3. En Render Dashboard**

- ✅ Verificar que DATABASE_URL está configurado (PostgreSQL)
- ✅ Verificar que NODE_ENV=production
- ✅ Trigger deploy manual o automático desde GitHub

### **4. Post-Deployment**

Render ejecutará automáticamente (según `render.yaml`):

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

---

## 🔄 Volver a Desarrollo Local

**Después de deployar**, si necesitas volver a desarrollo local:

```bash
# 1. Cambiar schema.prisma de nuevo a SQLite
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

# 2. Regenerar Prisma
npx prisma generate

# 3. Reiniciar servidor
npm run dev
```

---

## 📊 Modelos Incluidos en la Base de Datos

Tu aplicación ahora tiene **10 modelos**:

1. ✅ **User** - Usuarios y autenticación
2. ✅ **Vendor** - Proveedores (con campos mejorados)
3. ✅ **Product** - Productos (con inventario avanzado)
4. ✅ **Sale** - Ventas
5. ✅ **SaleItem** - Items de venta
6. ✅ **Purchase** - Compras
7. ✅ **PurchaseItem** - Items de compra
8. ✅ **InventoryMovement** - Movimientos de inventario
9. ✅ **Notification** - Notificaciones
10. ✅ **AuditLog** - Logs de auditoría

---

## 🛠️ Comandos Útiles

### **Desarrollo Local:**

```bash
# Iniciar servidor
npm run dev

# Ver base de datos
npx prisma studio

# Regenerar cliente
npx prisma generate

# Nueva migración
npx prisma migrate dev --name nombre_migracion

# Reset completo (⚠️ borra datos)
npx prisma migrate reset
```

### **Producción (Render):**

```bash
# Aplicar migraciones (en Render se hace automático)
npx prisma migrate deploy

# Ver logs
# Desde Render Dashboard → Logs
```

---

## 🔍 Verificar Deployment

Después de deployar en Render:

1. ✅ Visita tu URL de Render
2. ✅ Verifica que el dashboard carga
3. ✅ Prueba crear un vendor
4. ✅ Prueba crear un product
5. ✅ Prueba crear una sale (nuevo)
6. ✅ Prueba crear una purchase (nuevo)
7. ✅ Verifica que el inventario se actualiza

---

## ⚡ Script de Cambio Rápido

### **Para Deployar a Render:**

```bash
# Edita prisma/schema.prisma y cambia la línea 7:
# provider = "postgresql"

git add .
git commit -m "chore: switch to postgresql for render"
git push
```

### **Para Volver a Local:**

```bash
# Edita prisma/schema.prisma y cambia la línea 7:
# provider = "sqlite"

npx prisma generate
npm run dev
```

---

## 📚 Documentación Relacionada

- **RENDER_DEPLOY.md** - Guía completa de deployment
- **QUICK_DEPLOY_RENDER.md** - Deploy rápido en 5 minutos
- **RENDER_CHECKLIST.md** - Checklist completo
- **DATABASE_FIX.md** - Soluciones a problemas de BD

---

## 🎯 Mejores Prácticas

### **1. Siempre hacer commit antes de cambiar provider:**

```bash
git add .
git commit -m "chore: prepare for deployment"
```

### **2. Nunca deployar con SQLite:**

SQLite no funciona en entornos serverless como Render. **Siempre usar PostgreSQL en producción.**

### **3. Verificar variables de entorno:**

Antes de deployar, verifica en Render Dashboard que:

- DATABASE_URL apunta a PostgreSQL
- NODE_ENV está en "production"

### **4. Backup de datos locales (opcional):**

```bash
# Exportar datos antes de cambiar provider
npx prisma db push --force-reset
```

---

## 🔐 Seguridad en Producción

### **Variables que NUNCA deben estar en el código:**

- ❌ DATABASE_URL con credenciales reales
- ❌ Claves secretas
- ❌ Tokens de API

### **Usar siempre variables de entorno en Render:**

```env
DATABASE_URL=postgresql://...  # Desde Render Dashboard
NODE_ENV=production
```

---

## 🆘 Troubleshooting Común

### **Error: "Migration failed"**

**Causa:** Schema desincronizado
**Solución:**

```bash
# En Render Shell:
npx prisma migrate deploy
```

### **Error: "Cannot find module '@prisma/client'"**

**Causa:** Cliente no generado
**Solución:**

```bash
npx prisma generate
```

### **Error: "P1001: Can't reach database server"**

**Causa:** DATABASE_URL incorrecto
**Solución:** Verificar variable en Render Dashboard

### **Error: "Provider mismatch"**

**Causa:** Schema en SQLite pero BD es PostgreSQL
**Solución:** Cambiar provider en schema.prisma a "postgresql"

---

## ✅ Estado de Funcionalidades

Todas las funcionalidades están listas para producción:

- ✅ Autenticación y autorización
- ✅ Gestión de vendors
- ✅ Gestión de products
- ✅ Módulo de ventas (Sales)
- ✅ Módulo de compras (Purchases)
- ✅ Control de inventario
- ✅ Notificaciones
- ✅ Auditoría
- ✅ Dashboard con estadísticas
- ✅ Reportes PDF

---

## 🎉 ¡Listo para Producción!

Tu aplicación **VendorHub Enterprise** está completamente preparada para:

- ✅ Deployment en Render
- ✅ Manejo de múltiples usuarios
- ✅ Transacciones en tiempo real
- ✅ Escalamiento horizontal

**Recuerda:** Cambiar a PostgreSQL antes de cada deployment a Render.

---

_Última actualización: Octubre 2025_
_VendorHub Enterprise Edition v2.0_
