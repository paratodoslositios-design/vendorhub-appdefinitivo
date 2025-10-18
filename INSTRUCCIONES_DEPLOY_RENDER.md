# 🚀 Instrucciones para Deploy en Render

## ⚠️ IMPORTANTE: Cambios Necesarios Antes del Deploy

### 🔴 Problema Actual

El schema de Prisma está configurado para **SQLite** (desarrollo local), pero Render requiere **PostgreSQL** (producción).

Error que verás si no cambias:

```
datasource `db`: the URL must start with the protocol `file:`.
```

---

## ✅ Pasos para Deployment Exitoso

### 1️⃣ **Cambiar Schema de Prisma ANTES de hacer push**

**Archivo:** `prisma/schema.prisma`

**Cambiar de (líneas 7-9):**

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**A:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2️⃣ **Hacer Commit del Cambio**

```bash
git add prisma/schema.prisma
git commit -m "chore: Cambiar datasource a PostgreSQL para deployment en Render"
```

### 3️⃣ **Push a GitHub**

```bash
git push origin main
```

---

## 🔧 Configuración en Render Dashboard

### Variables de Entorno Requeridas:

1. **DATABASE_URL**

   - Render provee esto automáticamente si creas una PostgreSQL database
   - Formato: `postgresql://usuario:password@host:5432/database`
   - **NO uses:** `file:./dev.db`

2. **NODE_ENV**
   - Valor: `production`

### Pasos en Render:

1. **Crear PostgreSQL Database:**

   - Dashboard → New → PostgreSQL
   - Nombre: `vendorhub-db` (o el que prefieras)
   - Plan: Free tier está bien para empezar
   - Guardar la `DATABASE_URL` que te dan

2. **Configurar Web Service:**

   - Conectar tu repositorio de GitHub
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - Start Command: `npm start`
   - Agregar las variables de entorno arriba

3. **Deploy:**
   - Render automáticamente:
     - ✅ Ejecuta `npm install`
     - ✅ Ejecuta `npx prisma generate`
     - ✅ Ejecuta `npx prisma migrate deploy` (aplica migraciones)
     - ✅ Ejecuta `npm run build`
     - ✅ Inicia la app con `npm start`

---

## 📋 Checklist de Deploy

Antes de hacer push a GitHub:

- [ ] ✅ Cambiar `provider = "sqlite"` a `provider = "postgresql"` en schema.prisma
- [ ] ✅ Hacer commit del cambio
- [ ] ✅ Push a GitHub
- [ ] ✅ Verificar que Render tenga PostgreSQL database creada
- [ ] ✅ Verificar variables de entorno en Render
- [ ] ✅ Esperar a que Render complete el build

Después del deploy:

- [ ] ✅ Verificar logs en Render dashboard
- [ ] ✅ Confirmar que migraciones se aplicaron
- [ ] ✅ Probar la aplicación en la URL de Render
- [ ] ✅ Verificar login funciona
- [ ] ✅ Probar crear una venta con proveedor

---

## 🔄 Workflow: Local vs Producción

### Para Desarrollo Local (SQLite):

**Usar:** `provider = "sqlite"`

```bash
npm run dev
# La app usa dev.db (SQLite)
```

### Para Deployment (PostgreSQL):

**Cambiar a:** `provider = "postgresql"`

```bash
git add prisma/schema.prisma
git commit -m "chore: PostgreSQL for production"
git push origin main
# Render usa PostgreSQL automáticamente
```

### Para Volver a Local:

Después del deploy, si quieres seguir trabajando local:

```bash
# Revertir el cambio localmente (sin commit)
git checkout prisma/schema.prisma

# O cambiar manualmente de vuelta a:
provider = "sqlite"
```

---

## ⚡ Opción Alternativa: Usar Variable de Entorno

**Mejor práctica:** Detectar automáticamente según el entorno

**En schema.prisma:**

```prisma
datasource db {
  provider = env("DATABASE_PROVIDER") // "sqlite" o "postgresql"
  url      = env("DATABASE_URL")
}
```

**En .env (local):**

```env
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"
```

**En Render (variables de entorno):**

```env
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://..." (provisto por Render)
```

**Nota:** Esta opción requiere que configures la variable `DATABASE_PROVIDER` en Render.

---

## 🐛 Troubleshooting

### Error: "the URL must start with the protocol `file:`"

**Causa:** Schema configurado para SQLite pero DATABASE_URL es PostgreSQL  
**Solución:** Cambiar provider a "postgresql"

### Error: "P1001: Can't reach database server"

**Causa:** DATABASE_URL incorrecta o database no existe  
**Solución:** Verificar que la PostgreSQL database esté creada en Render

### Error: Migration failed

**Causa:** Migraciones no compatibles entre SQLite y PostgreSQL  
**Solución:** Render aplicará las migraciones automáticamente si están en `/prisma/migrations/`

---

## 📊 Verificación Post-Deploy

### Comandos útiles en Render Shell:

```bash
# Ver schema actual
npx prisma db pull

# Ver estado de migraciones
npx prisma migrate status

# Ver logs de Prisma
cat /var/log/render.log | grep prisma
```

---

## 🎯 Resumen Rápido

**Para hacer deploy AHORA:**

1. Edita `prisma/schema.prisma` → Cambiar línea 8 de `"sqlite"` a `"postgresql"`
2. `git add prisma/schema.prisma`
3. `git commit -m "chore: PostgreSQL for Render"`
4. `git push origin main`
5. Render hará el resto automáticamente

**¡Eso es todo!** 🚀

---

## 📞 Si Algo Sale Mal

Revisa los logs en Render Dashboard → Tu servicio → Logs

Busca estos mensajes:

- ✅ `Generated Prisma Client`
- ✅ `Applying migration 20251018152108_add_vendor_to_sales`
- ✅ `Migration applied successfully`
- ✅ `Build completed successfully`

---

**Fecha:** 2025-10-18  
**Versión del Schema:** Con relaciones proveedores  
**Migraciones Pendientes:** `20251018152108_add_vendor_to_sales`
