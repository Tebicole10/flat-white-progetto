# 🚀 Guía de Deployment

## Opción 1: Deploy en Netlify (Recomendado - Súper Fácil)

### Paso 1: Prepara el proyecto en GitHub

```bash
# Desde la carpeta del proyecto
git init
git add .
git commit -m "Initial commit: Flat White Progetto"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/flat-white-progetto.git
git push -u origin main
```

### Paso 2: Conecta con Netlify

1. Entra a [netlify.com](https://netlify.com)
2. Haz login/signup con tu GitHub
3. Haz click en "New site from Git"
4. Selecciona tu repositorio `flat-white-progetto`
5. Netlify detecta automáticamente que es un proyecto Vite ✨
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Haz click "Deploy"

¡Listo! Tu app estará en vivo en `https://tu-proyecto.netlify.app` 🎉

**Bonus:** Cada vez que hagas `git push`, Netlify redeploy automáticamente.

---

## Opción 2: Deploy en Vercel (También súper fácil)

### Paso 1: Prepara en GitHub

Sigue los mismos pasos de arriba

### Paso 2: Conecta con Vercel

1. Entra a [vercel.com](https://vercel.com)
2. Haz login/signup con GitHub
3. Haz click "Import Project"
4. Selecciona tu repositorio
5. Vercel detecta automáticamente que es Vite ✨
6. Haz click "Deploy"

¡Listo! Tu app estará en `https://tu-proyecto.vercel.app` 🎉

---

## Compartir con Lauti

Una vez que esté deployado:

1. **Obtén el link público** (ej: `https://flat-white-progetto.netlify.app`)
2. **Compártelo a Lauti** por WhatsApp, Discord, donde sea
3. **Ambos abren el mismo link** y ¡comienzan a agregar cafés!

Los datos se sincronizan automáticamente entre navegadores porque ambos usan localStorage del mismo sitio.

---

## ⚙️ Configuración Opcional

### Si querés un dominio custom

**Netlify:**
- Domain settings → Connect custom domain
- Sigue las instrucciones para apuntar tu dominio

**Vercel:**
- Settings → Domains
- Agrega tu dominio custom

### Si querés agregar Sentry (error tracking)

```bash
npm install @sentry/react
```

Y configura en `src/main.tsx` para rastrear errores en producción.

---

## 📊 Estadísticas de Build

| Métrica | Tamaño |
|---------|--------|
| HTML | 0.46 kB |
| CSS | 30.82 kB (9.83 kB gzipped) |
| JavaScript | ~150 kB (48 kB gzipped) |
| Total | ~180 kB |

**Muy rápido para cargar** ⚡

---

## 🔄 Actualizaciones Futuras

Si queres hacer cambios después:

```bash
# Haz cambios locales
git add .
git commit -m "Descripción del cambio"
git push

# Netlify/Vercel redeploy automáticamente
```

---

## 🆘 Troubleshooting

### "Build failed"
- Verifica que `npm run build` funciona localmente
- Chequea que no hay archivos faltantes

### "Página en blanco"
- Abre DevTools (F12) y ve la consola
- Busca errores de JavaScript
- Verifica que localhost:5173 funciona localmente

### "Los datos se borraron"
- localStorage puede limpiar en ciertos casos
- Solución: implementar sincronización a Supabase/Firebase

---

¡Listo! Tu app está lista para conquistar Buenos Aires ☕🇦🇷
