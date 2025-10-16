# 🔧 Solución de Errores de Base de Datos en Render

## 📋 Problemas Identificados

1. **Error 500 en `/api/vendors`**: La API no puede conectarse a la base de datos
2. **Error `toLocaleString`**: Datos undefined debido a fallas en la API

## ✅ Soluciones Implementadas

### 1. Protección contra valores undefined

- ✅ Dashboard ahora maneja `totalValue` con valor por defecto: `(report.totalValue || 0)`
- ✅ Mensajes de error amigables agregados en Dashboard y Vendors
- ✅ Botón de "Reintentar" para reconectar
- ✅ Mejor logging de errores en las APIs

### 2. Mejoras en la API de Vendors

- ✅ Logging detallado de errores
- ✅ Mensajes de error informativos
- ✅ Validación de respuestas HTTP

## 🚀 Configuración Requerida en Render

### Paso 1: Crear una Base de Datos PostgreSQL

1. **Ve a tu dashboard de Render**
2. **Haz clic en "New +"** → **PostgreSQL**
3. **Configura la base de datos:**

   - Name: `ventas-compras-leo-db`
   - Database: `ventas_compras_leo`
   - User: (se genera automáticamente)
   - Region: Elige la misma región que tu web service
   - Plan: **Free**

4. **Haz clic en "Create Database"**

### Paso 2: Conectar la Base de Datos a tu Web Service

1. **Ve a tu Web Service** (`ventas-compras-leo`)
2. **Ve a la sección "Environment"**
3. **Busca la variable `DATABASE_URL`**
4. **Copia la "Internal Database URL" de tu PostgreSQL:**

   - Ve a tu PostgreSQL database
   - Busca "Internal Database URL"
   - Copia la URL completa (ejemplo: `postgresql://user:password@hostname:5432/database`)

5. **Pega la URL en la variable `DATABASE_URL`** de tu Web Service
6. **Guarda los cambios**

### Paso 3: Redeploy con Seed (Opcional)

Si quieres poblar la base de datos con datos de prueba:

1. **En Environment Variables**, cambia:

   ```
   SEED_DATABASE=true
   ```

2. **Guarda y espera el redeploy automático**

3. **Después del deploy exitoso**, cambia de nuevo a:
   ```
   SEED_DATABASE=false
   ```

### Paso 4: Verificar el Deploy

1. **Monitorea los logs** en Render:

   ```
   📦 Generando cliente de Prisma...
   🗄️ Ejecutando migraciones de base de datos...
   🌱 Poblando base de datos... (si SEED_DATABASE=true)
   ✅ Inicialización completada!
   ```

2. **Verifica que no haya errores** de conexión

3. **Abre tu aplicación** y verifica:
   - Dashboard carga sin errores
   - Vendors se muestran correctamente
   - Products funcionan correctamente

## 🔍 Diagnóstico de Errores

### Si sigues viendo Error 500:

1. **Revisa los logs de Render:**

   ```
   Error: Can't reach database server at...
   ```

2. **Verifica que:**

   - La variable `DATABASE_URL` está configurada
   - La base de datos PostgreSQL está en estado "Available"
   - Ambos servicios están en la misma región

3. **Prueba la conexión manualmente:**
   - Ve a "Shell" en tu Web Service
   - Ejecuta: `npx prisma db push`
   - Debería conectarse sin errores

### Si los datos no se cargan:

1. **Verifica que las migraciones se ejecutaron:**

   ```bash
   npx prisma migrate status
   ```

2. **Si es necesario, resetea la base de datos:**

   ```bash
   npx prisma migrate reset --force
   ```

3. **Ejecuta el seed manualmente:**
   ```bash
   npm run seed
   ```

## 📝 Variables de Entorno Necesarias

```env
DATABASE_URL=postgresql://user:password@hostname:5432/database
NODE_ENV=production
NODE_VERSION=20.11.0
SEED_DATABASE=false
```

## 🎯 Checklist Final

- [ ] PostgreSQL database creada en Render
- [ ] `DATABASE_URL` configurada en Web Service
- [ ] Web Service redeployado
- [ ] Logs muestran conexión exitosa
- [ ] Dashboard carga correctamente
- [ ] API `/api/vendors` retorna datos
- [ ] API `/api/products` retorna datos
- [ ] API `/api/reports` retorna datos

## 💡 Consejos Adicionales

1. **Usa Internal Database URL**: Es más rápida y gratuita dentro de Render
2. **No uses SQLite en producción**: Render es stateless, los archivos se pierden
3. **Monitorea los logs regularmente**: Para detectar problemas temprano
4. **Mantén `SEED_DATABASE=false`** después del primer deploy para evitar duplicados

## 🆘 Soporte

Si después de seguir estos pasos sigues teniendo problemas:

1. Revisa los logs completos en Render
2. Verifica que todas las dependencias estén instaladas
3. Asegúrate de que el `buildCommand` se complete exitosamente
4. Contacta al soporte de Render si el problema persiste

---

**Última actualización**: 2025-10-16
