# ✅ Checklist de Deployment - Relaciones Proveedores

## 📋 Pre-Deployment

### Local (Tu Computadora)

- [x] ✅ Schema Prisma actualizado (`vendorId` en Sale, `totalSales` en Vendor)
- [x] ✅ Migración creada: `20251018152108_add_vendor_to_sales`
- [x] ✅ Migración aplicada localmente
- [x] ✅ Prisma Client regenerado
- [x] ✅ Tipos TypeScript actualizados
- [x] ✅ API Backend modificada (`/api/sales`, `/api/purchases`)
- [x] ✅ Frontend UI actualizada (`/sales/page.tsx`)
- [x] ✅ Servidor de desarrollo funciona sin errores
- [x] ✅ Documentación creada

---

## 🚀 Deployment a Render

### Paso 1: Commit y Push

```bash
# En tu terminal local
cd vendor-products-app

# Verificar cambios
git status

# Agregar todos los archivos
git add .

# Commit con mensaje descriptivo
git commit -m "feat: Agregar relaciones estrictas entre ventas/compras y proveedores

- Agregado vendorId a modelo Sale
- Agregado totalSales a modelo Vendor
- Validaciones estrictas en compras
- Selector de proveedor opcional en ventas
- Filtros mejorados
- Migración: 20251018152108_add_vendor_to_sales"

# Push a GitHub/GitLab
git push origin main
```

**Checklist:**

- [ ] ✅ `git add .` ejecutado
- [ ] ✅ `git commit` ejecutado
- [ ] ✅ `git push origin main` ejecutado
- [ ] ✅ Push exitoso (sin errores)

---

### Paso 2: Verificar en GitHub/GitLab

**Ir a tu repositorio web:**

- [ ] ✅ Commit visible en GitHub/GitLab
- [ ] ✅ Archivos modificados correctos
- [ ] ✅ Nueva migración presente en `/prisma/migrations/`

---

### Paso 3: Render Auto-Deploy

**Render detectará el push automáticamente:**

1. Ve a: [https://dashboard.render.com](https://dashboard.render.com)
2. Selecciona tu servicio
3. Ve a "Events" tab

**Deberías ver:**

```
🔵 Deploy started
   Commit: feat: Agregar relaciones estrictas...
   Branch: main
```

**Checklist:**

- [ ] ✅ Deploy iniciado automáticamente
- [ ] ✅ Logs de build visibles

---

### Paso 4: Monitorear Build Logs

**En Render Dashboard → Tu Servicio → Logs**

**Busca estas líneas (en orden):**

```bash
# 1. Instalación de dependencias
✅ npm install

# 2. Generación de Prisma Client
✅ npx prisma generate
   ✔ Generated Prisma Client

# 3. Migración de base de datos
✅ npx prisma migrate deploy
   Applying migration `20251018152108_add_vendor_to_sales`
   ✔ Migration applied successfully

# 4. Build de Next.js
✅ npm run build
   ✔ Compiled successfully

# 5. Inicio del servidor
✅ npm start
   ▲ Next.js ready on http://0.0.0.0:3000
```

**Checklist de Logs:**

- [ ] ✅ `npm install` completado
- [ ] ✅ `prisma generate` completado
- [ ] ✅ `prisma migrate deploy` ejecutado
- [ ] ✅ Migración `20251018152108_add_vendor_to_sales` aplicada
- [ ] ✅ `npm run build` exitoso
- [ ] ✅ Servidor iniciado sin errores

---

### Paso 5: Verificar Estado del Deploy

**En Render Dashboard:**

```
Estado: 🟢 Live
Último Deploy: Exitoso
Tiempo: ~5-10 minutos
```

**Checklist:**

- [ ] ✅ Estado = "Live" (verde)
- [ ] ✅ Sin errores en logs
- [ ] ✅ Sin warnings críticos

---

## 🧪 Post-Deployment Testing

### Paso 1: Acceder a la Aplicación

**URL de tu app:** `https://tu-app.onrender.com`

**Checklist:**

- [ ] ✅ Página carga correctamente
- [ ] ✅ Login funciona
- [ ] ✅ Dashboard visible

---

### Paso 2: Pruebas de Compras

**Test 1: Crear Compra Válida**

1. Ir a `/purchases`
2. Click "Nueva Compra"
3. Seleccionar proveedor
4. Agregar productos del mismo proveedor
5. Completar compra

**Resultado esperado:**

- [ ] ✅ Compra creada exitosamente
- [ ] ✅ Stock actualizado
- [ ] ✅ `totalPurchases` del proveedor actualizado

**Test 2: Intentar Compra Inválida**

1. Seleccionar "Proveedor A"
2. Intentar agregar producto de "Proveedor B"

**Resultado esperado:**

- [ ] ✅ Error: "El producto X no pertenece al proveedor Y"
- [ ] ✅ No se crea la compra

---

### Paso 3: Pruebas de Ventas

**Test 3: Venta SIN Proveedor**

1. Ir a `/sales`
2. Click "Nueva Venta"
3. NO seleccionar proveedor
4. Agregar productos de diferentes proveedores
5. Completar venta

**Resultado esperado:**

- [ ] ✅ Venta creada exitosamente
- [ ] ✅ Stock reducido
- [ ] ✅ `vendorId = null` en la venta

**Test 4: Venta CON Proveedor**

1. Click "Nueva Venta"
2. Seleccionar "Proveedor A"
3. Solo se muestran productos de "Proveedor A"
4. Agregar productos
5. Completar venta

**Resultado esperado:**

- [ ] ✅ Solo productos de Proveedor A visibles
- [ ] ✅ Venta creada con `vendorId = Proveedor A`
- [ ] ✅ Stock reducido
- [ ] ✅ `totalSales` del proveedor actualizado

**Test 5: Cambiar Proveedor**

1. Crear nueva venta
2. Seleccionar "Proveedor A"
3. Agregar productos
4. Cambiar a "Proveedor B"

**Resultado esperado:**

- [ ] ✅ Items anteriores eliminados automáticamente
- [ ] ✅ Lista de productos actualizada a Proveedor B

**Test 6: Validación de Stock**

1. Intentar vender más productos de los disponibles

**Resultado esperado:**

- [ ] ✅ Error: "Stock insuficiente. Disponible: X"

---

### Paso 4: Pruebas de Filtros

**Test 7: Filtrar Ventas por Proveedor**

1. Ir a `/sales`
2. Usar filtro de proveedor
3. Seleccionar "Proveedor A"

**Resultado esperado:**

- [ ] ✅ Solo muestra ventas con `vendorId = Proveedor A`
- [ ] ✅ Ventas sin proveedor (null) no aparecen

---

### Paso 5: Verificar Base de Datos

**Opción A: Render Shell**

```bash
# En Render Dashboard → Shell
npx prisma studio

# O verificar schema
npx prisma db pull
```

**Opción B: Revisar datos**

```bash
# Ver migraciones aplicadas
npx prisma migrate status
```

**Checklist:**

- [ ] ✅ Tabla `Sale` tiene columna `vendorId`
- [ ] ✅ Tabla `Vendor` tiene columna `totalSales`
- [ ] ✅ Foreign key `Sale.vendorId → Vendor.id` existe
- [ ] ✅ Datos existentes intactos

---

## 🔍 Troubleshooting

### Problema 1: Migración no se aplicó

**Síntomas:**

- Error: "Column vendorId does not exist"
- 500 Internal Server Error al crear venta

**Solución:**

```bash
# En Render Shell
npx prisma migrate deploy
npx prisma generate

# Reiniciar servicio
# Render Dashboard → Settings → Manual Deploy
```

**Checklist:**

- [ ] ✅ Ejecutar `prisma migrate deploy`
- [ ] ✅ Ejecutar `prisma generate`
- [ ] ✅ Reiniciar servicio
- [ ] ✅ Verificar logs

---

### Problema 2: Frontend no muestra selector de proveedor

**Síntomas:**

- No aparece el campo "Proveedor" en ventas
- Lista de productos no cambia

**Solución:**

```bash
# Verificar que el código esté en producción
git log  # Ver último commit
git push origin main  # Asegurar push exitoso

# Limpiar caché de Next.js en Render
# Render Dashboard → Settings → Clear build cache
```

**Checklist:**

- [ ] ✅ Código pusheado a Git
- [ ] ✅ Render hizo pull del código
- [ ] ✅ Build exitoso
- [ ] ✅ Caché limpiado si es necesario

---

### Problema 3: Errores 500 en API

**Revisar logs:**

```bash
# En Render Dashboard → Logs
# Buscar stack traces
```

**Checklist:**

- [ ] ✅ Revisar logs de error
- [ ] ✅ Verificar variables de entorno
- [ ] ✅ Verificar DATABASE_URL
- [ ] ✅ Reiniciar servicio

---

## 📊 Métricas de Éxito

### Indicadores de Deploy Exitoso:

- [ ] ✅ **Tiempo de Build:** < 10 minutos
- [ ] ✅ **Estado:** Live (verde)
- [ ] ✅ **Errores:** 0
- [ ] ✅ **Warnings críticos:** 0
- [ ] ✅ **Migración aplicada:** Sí
- [ ] ✅ **Tests pasados:** 7/7
- [ ] ✅ **Uptime:** 100%

---

## 📞 Contacto de Emergencia

### Si algo falla:

1. **Revisar logs** en Render Dashboard
2. **Consultar documentación:**
   - `DEPLOY_RENDER_RELACIONES.md`
   - `NUEVAS_RELACIONES_PROVEEDORES.md`
3. **Rollback si necesario:**
   ```bash
   git revert HEAD
   git push origin main
   ```

---

## ✅ Checklist Final

### Deploy Completado:

- [ ] ✅ Código pusheado a Git
- [ ] ✅ Render detectó cambios
- [ ] ✅ Build exitoso
- [ ] ✅ Migración aplicada
- [ ] ✅ Servicio en estado "Live"
- [ ] ✅ Tests de compras pasados (2/2)
- [ ] ✅ Tests de ventas pasados (4/4)
- [ ] ✅ Test de filtros pasado (1/1)
- [ ] ✅ Base de datos verificada
- [ ] ✅ Sin errores en logs
- [ ] ✅ Documentación revisada

---

## 🎉 ¡DEPLOYMENT EXITOSO!

**Si todos los checkboxes están marcados:**

```
╔════════════════════════════════════════════════════╗
║                                                    ║
║         🎉 ¡DEPLOYMENT EXITOSO! 🎉                ║
║                                                    ║
║  Las relaciones entre ventas/compras/proveedores   ║
║  están funcionando correctamente en producción.    ║
║                                                    ║
║  Tu aplicación ahora tiene:                        ║
║  ✅ Validaciones estrictas                         ║
║  ✅ Trazabilidad completa                          ║
║  ✅ Métricas por proveedor                         ║
║  ✅ Filtros avanzados                              ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

**Próximos pasos sugeridos:**

1. Monitorear métricas durante 24 horas
2. Entrenar usuarios en nuevas funcionalidades
3. Generar reportes de ventas por proveedor
4. Analizar métricas de `totalSales` y `totalPurchases`

---

**Fecha:** **\_**/**\_**/**\_**  
**Hora de inicio:** **\_**:**\_**  
**Hora de finalización:** **\_**:**\_**  
**Responsable:** ********\_\_\_********  
**Estado final:** ⬜ Exitoso ⬜ Con observaciones ⬜ Fallido
