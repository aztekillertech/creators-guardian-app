# Aztekiller UGC Guardian

Herramienta de seguridad para creadores UGC con checklist, generador de contrasenas, verificador de correos/links/archivos, inventario de cuentas y protocolo de respuesta ante hackeo.

## Probar localmente

```bash
npm install
npm run dev
```

## Crear version para Netlify

```bash
npm run build
```

Netlify debe usar:

- Build command: `npm run build`
- Publish directory: `dist`

La app guarda datos solo en `localStorage` del navegador. No sube archivos: calcula el SHA-256 localmente y abre la consulta en VirusTotal.

## Acceso por creador

La version actual usa Supabase Auth. Cada usuario entra con correo y contrasena, y sus datos quedan separados con Row Level Security.

Antes de usarla en produccion, corre el archivo `supabase-schema.sql` en el SQL Editor de Supabase.

## Variables para Cloudflare Pages

Configura estas variables en Cloudflare Pages:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Build:

- Build command: `npm run build`
- Output directory: `dist`
