# Guía de Configuración Local para Stripe (Equipo de Desarrollo)

Para poder probar la pasarela de pagos, los límites del plan Free y el cambio de planes en entorno local (`localhost`), cada desarrollador debe configurar su propio puente (webhook) con Stripe. 

A continuación, los pasos para dejar tu entorno listo.

## 1. Configurar las Variables de Entorno base
Abre tu archivo `.env.local` y asegúrate de tener las siguientes variables. (Pídele a un administrador del equipo que te pase los valores exactos):

```env
# Claves de la API de Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# IDs de los Productos (Precios)
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
STRIPE_PRICE_ENTERPRISE_ANNUAL=price_...
```
*(Nota: Deja el espacio para `STRIPE_WEBHOOK_SECRET` vacío por ahora, lo generaremos en el paso 3).*

## 2. Instalar y Autorizar Stripe CLI
Como Stripe en la nube no puede enviarle notificaciones de pago a tu computadora privada (`localhost`), usaremos la herramienta oficial de Stripe.

1. Descarga e instala **Stripe CLI** según tu sistema operativo desde la [documentación oficial](https://docs.stripe.com/stripe-cli).
2. Abre una nueva terminal y ejecuta:
   ```bash
   stripe login
   ```
3. Se abrirá una pestaña en tu navegador web. **Inicia sesión** con la cuenta de Stripe del proyecto (o con tu cuenta si te han invitado como desarrollador al Workspace de Stripe) y haz clic en "Permitir acceso".

## 3. Crear el Túnel del Webhook
Una vez autorizado, debemos decirle a Stripe que envíe los eventos a nuestra ruta de Next.js.

1. En la misma terminal de Stripe CLI, ejecuta:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
2. La terminal mostrará un mensaje indicando que está lista y te arrojará una clave que dice: 
   > *Your webhook signing secret is `whsec_...`*
3. **Copia ese secreto (`whsec_...`)** y pégalo en tu archivo `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_el_secreto_que_te_dio_la_consola
   ```

> ⚠️ **IMPORTANTE:** Cada vez que corras este comando en una computadora distinta, se generará un `whsec_` único. Nunca compartas tu Webhook Secret local con otro desarrollador.

## 4. Reiniciar y Probar
1. **Reinicia tu servidor de Next.js**. Es obligatorio apagar (`Ctrl + C`) y volver a ejecutar `npm run dev` para que lea el nuevo secreto de tu `.env.local`.
2. **NO cierres la terminal del Stripe CLI**. Déjala corriendo en segundo plano, si la cierras, los pagos no se registrarán en tu base de datos local.
3. Ve a la aplicación (ej: `http://localhost:3000/dashboard/configuracion/planes`).
4. Intenta mejorar tu plan usando la tarjeta mágica de pruebas de Stripe:
   - **Tarjeta:** `4242 4242 4242 4242`
   - **Fecha de expiración:** Cualquier fecha futura (ej: `12/34`)
   - **CVC:** Cualquier número (ej: `123`)

Si ves en la terminal de Stripe CLI que dice `[200] POST /api/stripe/webhook`, significa que todo está funcionando perfectamente y tu plan se ha actualizado en la base de datos local. ¡Felicidades! 🎉
