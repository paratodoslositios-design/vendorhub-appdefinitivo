# 📖 Ejemplos de Uso: Relaciones Proveedores

## 🛒 Caso 1: Crear una Compra (Purchase)

### Escenario: Comprar productos de "Proveedor Tech SA"

**Paso 1:** Seleccionar Proveedor

```
Formulario de Nueva Compra
├─ Proveedor: [Proveedor Tech SA ▼]  ← OBLIGATORIO
├─ Método de Pago: [Efectivo ▼]
└─ Estado de Pago: [Pagado ▼]
```

**Paso 2:** Agregar Productos

```
Productos Disponibles (solo de Proveedor Tech SA):
├─ Laptop Dell XPS ($1200) - Stock: 5
├─ Mouse Logitech ($25) - Stock: 50
└─ Teclado Mecánico ($80) - Stock: 30

✅ Agregar: Laptop Dell XPS, Cantidad: 10, Costo: $1150
✅ Agregar: Mouse Logitech, Cantidad: 20, Costo: $22
```

**Paso 3:** Validación Automática

```
✅ Laptop Dell XPS → Pertenece a Proveedor Tech SA
✅ Mouse Logitech → Pertenece a Proveedor Tech SA
✅ Todos los productos válidos
```

**Resultado:**

```json
{
  "purchaseNumber": "COM-00001",
  "vendor": {
    "id": "vendor-123",
    "name": "Proveedor Tech SA"
  },
  "items": [
    {
      "product": "Laptop Dell XPS",
      "quantity": 10,
      "unitCost": 1150,
      "subtotal": 11500
    },
    {
      "product": "Mouse Logitech",
      "quantity": 20,
      "unitCost": 22,
      "subtotal": 440
    }
  ],
  "total": 11940
}
```

**Efectos:**

- ✅ Stock actualizado: Laptop (5 → 15), Mouse (50 → 70)
- ✅ `totalPurchases` de Proveedor Tech SA: +$11,940
- ✅ Movimientos de inventario creados con referencia al proveedor

---

### ❌ Caso 1B: Intento de Compra Inválida

**Escenario:** Intentar agregar producto de otro proveedor

```
Proveedor Seleccionado: Proveedor Tech SA

Intentar agregar:
❌ "Coca Cola 2L" (Pertenece a "Distribuidora Bebidas")

Resultado:
┌─────────────────────────────────────────────────────┐
│ ❌ ERROR                                             │
│ El producto "Coca Cola 2L" no pertenece al         │
│ proveedor "Proveedor Tech SA"                       │
└─────────────────────────────────────────────────────┘
```

---

## 💰 Caso 2: Crear Venta CON Proveedor Específico

### Escenario: Vender solo productos de "Proveedor Tech SA"

**Paso 1:** Seleccionar Proveedor (Opcional)

```
Formulario de Nueva Venta
├─ Proveedor: [Proveedor Tech SA ▼]  ← Opcional
├─ Cliente: [Juan Pérez]  ← OBLIGATORIO
├─ Email: juan@email.com
└─ Teléfono: +123456789
```

**Paso 2:** Productos Filtrados Automáticamente

```
Productos Disponibles (SOLO de Proveedor Tech SA):
├─ Laptop Dell XPS ($1300) - Stock: 15 - Proveedor Tech SA
├─ Mouse Logitech ($30) - Stock: 70 - Proveedor Tech SA
└─ Teclado Mecánico ($95) - Stock: 30 - Proveedor Tech SA

⚠️ Nota: Solo se muestran productos de Proveedor Tech SA

✅ Agregar: Laptop Dell XPS, Cantidad: 2
✅ Agregar: Mouse Logitech, Cantidad: 5
```

**Paso 3:** Validación y Creación

```
Validaciones:
✅ Laptop Dell XPS → Proveedor Tech SA → OK
✅ Mouse Logitech → Proveedor Tech SA → OK
✅ Stock disponible: Laptop (15 ≥ 2), Mouse (70 ≥ 5) → OK
```

**Resultado:**

```json
{
  "saleNumber": "VEN-00001",
  "vendor": {
    "id": "vendor-123",
    "name": "Proveedor Tech SA"
  },
  "customer": {
    "name": "Juan Pérez",
    "email": "juan@email.com"
  },
  "items": [
    {
      "product": "Laptop Dell XPS",
      "quantity": 2,
      "unitPrice": 1300,
      "subtotal": 2600
    },
    {
      "product": "Mouse Logitech",
      "quantity": 5,
      "unitPrice": 30,
      "subtotal": 150
    }
  ],
  "total": 2750
}
```

**Efectos:**

- ✅ Stock actualizado: Laptop (15 → 13), Mouse (70 → 65)
- ✅ `totalSales` de Proveedor Tech SA: +$2,750
- ✅ Movimientos de inventario con referencia al proveedor

---

## 💰 Caso 3: Crear Venta SIN Proveedor (Todos los Productos)

### Escenario: Venta mezclando productos de diferentes proveedores

**Paso 1:** NO Seleccionar Proveedor

```
Formulario de Nueva Venta
├─ Proveedor: [Todos los proveedores ▼]  ← Por defecto
├─ Cliente: [María García]
└─ Email: maria@email.com
```

**Paso 2:** Todos los Productos Disponibles

```
Productos Disponibles (TODOS):
├─ Laptop Dell XPS ($1300) - Stock: 13 - Proveedor Tech SA
├─ Mouse Logitech ($30) - Stock: 65 - Proveedor Tech SA
├─ Coca Cola 2L ($2.5) - Stock: 100 - Distribuidora Bebidas
├─ Pepsi 2L ($2.5) - Stock: 80 - Distribuidora Bebidas
└─ Galletas Oreo ($3) - Stock: 150 - Distribuidora Alimentos

✅ Agregar: Laptop Dell XPS (Tech SA), Cantidad: 1
✅ Agregar: Coca Cola 2L (Bebidas), Cantidad: 10
✅ Agregar: Galletas Oreo (Alimentos), Cantidad: 5
```

**Paso 3:** Validación

```
Validaciones:
✅ Laptop Dell XPS → Stock: 13 ≥ 1 → OK
✅ Coca Cola 2L → Stock: 100 ≥ 10 → OK
✅ Galletas Oreo → Stock: 150 ≥ 5 → OK
⚠️ No hay proveedor seleccionado → Permitir mezcla
```

**Resultado:**

```json
{
  "saleNumber": "VEN-00002",
  "vendorId": null,  ← No hay proveedor específico
  "customer": {
    "name": "María García",
    "email": "maria@email.com"
  },
  "items": [
    {
      "product": "Laptop Dell XPS",
      "quantity": 1,
      "unitPrice": 1300,
      "subtotal": 1300
    },
    {
      "product": "Coca Cola 2L",
      "quantity": 10,
      "unitPrice": 2.5,
      "subtotal": 25
    },
    {
      "product": "Galletas Oreo",
      "quantity": 5,
      "unitPrice": 3,
      "subtotal": 15
    }
  ],
  "total": 1340
}
```

**Efectos:**

- ✅ Stock actualizado para cada producto
- ❌ NO actualiza `totalSales` de ningún proveedor (vendorId = null)
- ✅ Movimientos de inventario creados con proveedor de cada producto

---

## 🔄 Caso 4: Cambiar Proveedor en Venta

### Escenario: Usuario cambia de proveedor mientras crea venta

**Paso 1:** Seleccionar Proveedor "Tech SA"

```
Proveedor: [Proveedor Tech SA ▼]
Items agregados:
├─ Laptop Dell XPS x 2 = $2600
└─ Mouse Logitech x 5 = $150
```

**Paso 2:** Cambiar a "Distribuidora Bebidas"

```
Usuario cambia proveedor a: [Distribuidora Bebidas ▼]

⚠️ Acción Automática:
┌─────────────────────────────────────────────────────┐
│ Los items seleccionados serán eliminados porque    │
│ pertenecen a un proveedor diferente.               │
│                                                     │
│ Items eliminados:                                  │
│ - Laptop Dell XPS (Proveedor Tech SA)              │
│ - Mouse Logitech (Proveedor Tech SA)               │
└─────────────────────────────────────────────────────┘

Productos Disponibles ahora (SOLO Distribuidora Bebidas):
├─ Coca Cola 2L ($2.5) - Stock: 100
├─ Pepsi 2L ($2.5) - Stock: 80
└─ Fanta 2L ($2.5) - Stock: 60
```

---

## 📊 Caso 5: Filtrar Ventas por Proveedor

### Escenario: Ver solo ventas de productos de "Proveedor Tech SA"

**Filtros Aplicados:**

```
┌─────────────────────────────────────────────────────┐
│ Filtros de Ventas                                   │
├─────────────────────────────────────────────────────┤
│ Búsqueda: [              ]                         │
│ Proveedor: [Proveedor Tech SA ▼]  ← Filtro activo │
│ Estado: [Todos ▼]                                  │
│ Pago: [Todos ▼]                                    │
└─────────────────────────────────────────────────────┘
```

**Resultados:**

```
📊 Ventas de Proveedor Tech SA

VEN-00001
├─ Cliente: Juan Pérez
├─ Proveedor: Proveedor Tech SA
├─ Items: Laptop Dell XPS (2), Mouse Logitech (5)
└─ Total: $2,750

VEN-00003
├─ Cliente: Carlos López
├─ Proveedor: Proveedor Tech SA
├─ Items: Teclado Mecánico (3)
└─ Total: $285

Total: 2 ventas encontradas
Suma: $3,035
```

---

## ⚠️ Casos de Error Comunes

### Error 1: Stock Insuficiente

```
Intentando agregar:
❌ Laptop Dell XPS, Cantidad: 20
   Stock disponible: 13

Resultado:
┌─────────────────────────────────────────────────────┐
│ ❌ Stock insuficiente                               │
│ Stock insuficiente para el producto "Laptop Dell    │
│ XPS". Disponible: 13                                │
└─────────────────────────────────────────────────────┘
```

### Error 2: Producto No Encontrado

```
API Request con productId inválido:
{
  "items": [
    { "productId": "prod-999999", "quantity": 1 }
  ]
}

Resultado:
┌─────────────────────────────────────────────────────┐
│ ❌ Producto no encontrado                           │
│ Producto con ID prod-999999 no encontrado           │
└─────────────────────────────────────────────────────┘
```

### Error 3: Proveedor No Encontrado

```
API Request con vendorId inválido:
{
  "vendorId": "vendor-999999",
  "items": [...]
}

Resultado:
┌─────────────────────────────────────────────────────┐
│ ❌ Proveedor no encontrado                          │
│ Proveedor no encontrado                             │
└─────────────────────────────────────────────────────┘
```

---

## 📈 Caso 6: Ver Métricas de Proveedor

### Escenario: Ver estadísticas de "Proveedor Tech SA"

**Antes de las Ventas/Compras:**

```json
{
  "id": "vendor-123",
  "name": "Proveedor Tech SA",
  "totalPurchases": 0,
  "totalSales": 0
}
```

**Después de Compra (COM-00001) y Venta (VEN-00001):**

```json
{
  "id": "vendor-123",
  "name": "Proveedor Tech SA",
  "totalPurchases": 11940,  ← Compra de $11,940
  "totalSales": 2750,       ← Venta de $2,750
  "profit": -9190           ← Diferencia (aún no implementado)
}
```

---

## 🎯 Resumen de Comportamientos

| Acción                  | Proveedor Seleccionado | Productos Mostrados | Validación |
| ----------------------- | ---------------------- | ------------------- | ---------- |
| **Compra**              | ✅ Obligatorio         | Solo del proveedor  | Estricta   |
| **Venta CON proveedor** | ✅ Sí                  | Solo del proveedor  | Estricta   |
| **Venta SIN proveedor** | ❌ No                  | Todos               | Solo stock |
| **Cambio de proveedor** | ⚠️ Limpia items        | Actualiza lista     | N/A        |
| **Filtrar ventas**      | 🔍 Como filtro         | N/A                 | N/A        |

---

## 💡 Tips y Buenas Prácticas

### ✅ DO (Hacer):

- Seleccionar proveedor en ventas cuando quieras rastrear qué proveedor genera más ventas
- Usar filtros de proveedor para análisis de rendimiento
- Validar stock antes de crear venta
- Revisar métricas de `totalPurchases` y `totalSales` por proveedor

### ❌ DON'T (No hacer):

- Intentar agregar productos de diferentes proveedores cuando hay uno seleccionado
- Olvidar que el proveedor en ventas es opcional
- Mezclar productos en compras (siempre un solo proveedor)

---

**Documentación Relacionada:**

- `RESUMEN_EJECUTIVO_RELACIONES.md` - Overview completo
- `NUEVAS_RELACIONES_PROVEEDORES.md` - Detalles técnicos
- `DEPLOY_RENDER_RELACIONES.md` - Guía de deployment
