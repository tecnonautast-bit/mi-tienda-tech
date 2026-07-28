# Mi Tienda Tech — Guía paso a paso

Este proyecto es una tienda online con:
- Catálogo de productos por categorías (estilo Tienda Nube)
- Registro de usuarios "técnicos" que, una vez aprobados, ven precios mayoristas
- Pago con **Mercado Pago**, **transferencia bancaria** o **efectivo en el local**
- Panel simple para aprobar técnicos

No hace falta saber programar para seguir estos pasos, pero sí necesitás paciencia
las primeras veces. Vamos de a uno.

---

## Paso 1: Instalar lo necesario en tu computadora

1. Instalá **Node.js** (versión 18 o superior): https://nodejs.org (descargá la versión "LTS")
2. Instalá un editor de código, recomendado **VS Code**: https://code.visualstudio.com

## Paso 2: Instalar las dependencias del proyecto

Abrí una terminal dentro de la carpeta del proyecto y ejecutá:

```bash
npm install
```

Esto descarga todo lo que el proyecto necesita para funcionar (puede tardar 1-2 minutos).

## Paso 3: Crear tu cuenta en Supabase (la base de datos)

Supabase guarda tus productos, usuarios y pedidos. Tiene un plan gratuito que alcanza
para empezar.

1. Andá a https://supabase.com y creá una cuenta gratis
2. Creá un **New Project** (elegí una contraseña de base de datos y guardala)
3. Esperá 1-2 minutos a que el proyecto esté listo
4. En el menú izquierdo, andá a **SQL Editor** → **New query**
5. Abrí el archivo `supabase/schema.sql` de este proyecto, copiá **todo** su contenido,
   pegalo en el editor de Supabase, y apretá **Run**
   - Esto crea todas las tablas (productos, categorías, usuarios, pedidos) y carga
     3 productos de ejemplo para que veas cómo funciona
6. Andá a **Project Settings** (ícono de engranaje) → **API**
7. Copiá dos valores: **Project URL** y **anon public key** (los vas a necesitar en el paso 5)

## Paso 4: Crear tu cuenta en Mercado Pago Developers

1. Andá a https://www.mercadopago.com.ar/developers/panel
2. Si no tenés cuenta de Mercado Pago, creala primero en mercadopago.com.ar
3. Dentro del panel de developers, andá a **Tus integraciones** → **Crear aplicación**
4. Una vez creada, andá a **Credenciales de producción** (o "de prueba" mientras testeás)
5. Copiá el **Access Token** y la **Public Key**

> Mientras estés probando el sitio, usá las credenciales **de prueba** (empiezan con `TEST-`).
> Recién cuando quieras cobrar de verdad, cambiás a las credenciales de producción.

## Paso 5: Configurar las variables de entorno

1. En la carpeta del proyecto, renombrá el archivo `.env.local.example` a `.env.local`
2. Completá cada valor con lo que copiaste en los pasos 3 y 4:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Paso 6: Probar el sitio en tu computadora

```bash
npm run dev
```

Abrí tu navegador en **http://localhost:3000** y ya deberías ver la tienda funcionando
con los 3 productos de ejemplo.

Probá:
- Ver el catálogo (`/productos`)
- Registrarte tildando "Soy técnico" (`/registro`)
- Agregar productos al carrito y hacer un pedido de prueba

## Paso 7: Cargar tus propios productos

Por ahora, cargar productos se hace desde Supabase directamente (sin necesidad de
código):

1. En Supabase, andá a **Table Editor** → tabla `productos`
2. Apretá **Insert row** y completá: nombre, slug (sin espacios, ej `bateria-iphone-14`),
   categoria_id, precio_minorista, precio_mayorista (opcional), stock, imagen_url
3. Para las imágenes: subilas a **Storage** dentro de Supabase (creá un bucket público
   llamado `productos`) y pegá la URL pública en `imagen_url`

Más adelante, si querés, puedo armarte una pantalla de administración para cargar
productos sin tocar Supabase directamente — avisame.

## Paso 8: Convertirte en administrador (para aprobar técnicos)

1. Registrate normalmente en tu propio sitio
2. En Supabase → **Table Editor** → tabla `profiles` → buscá tu usuario → cambiá la
   columna `rol` de `cliente` a `admin`
3. Entrá a `/admin/tecnicos` en tu sitio: ahí vas a poder aprobar o revocar el acceso
   de cada técnico que se registre

## Paso 9: Configurar el webhook de Mercado Pago (para que los pagos se confirmen solos)

Esto solo funciona cuando el sitio ya está publicado en internet (no en localhost):

1. En el panel de Mercado Pago Developers → **Webhooks**
2. Agregá la URL: `https://tu-dominio.com/api/mercadopago/webhook`
3. Seleccioná el evento **Pagos**

## Paso 10: Publicar el sitio en internet

La forma más simple es con **Vercel** (gratis para empezar):

1. Subí este proyecto a un repositorio de GitHub
2. Andá a https://vercel.com, creá una cuenta con tu GitHub
3. **New Project** → elegí tu repositorio
4. En "Environment Variables", cargá las mismas variables del `.env.local`
5. Apretá **Deploy**
6. Cuando termine, actualizá `NEXT_PUBLIC_SITE_URL` con la URL real que te dio Vercel
   (y volvé a desplegar)

---

## ¿Qué falta / posibles mejoras a futuro?

- Panel de administración visual para cargar productos (hoy se hace desde Supabase)
- Notificaciones por email cuando cambia el estado de un pedido
- Cálculo automático de costo de envío
- Buscador de productos por texto
- Reseñas de productos

Si querés que avancemos con alguna de estas, decime cuál y seguimos.
