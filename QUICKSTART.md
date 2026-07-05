# ⚡ Quick Start - Flat White Progetto

## 1️⃣ Setup (5 minutos)

```bash
# Descargar y entrar al proyecto
unzip flat-white-progetto.zip
cd flat-white-progetto

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre `http://localhost:5173` en tu navegador. ¡Ya está! 🎉

---

## 2️⃣ Cómo Usar la App

### Agregar un café
1. Haz click en botón "➕ Agregar café"
2. Llena:
   - Nombre del café
   - Dirección (ej: Balvanera, Palermo, etc)
   - Coordenadas (abrí Google Maps, click derecho, copia lat/lng)
3. Puntuá en 5 categorías (1-5 estrellas)
4. Agrega fotos (la primera será portada)
5. ¡Invitados! Agrega quién fue contigo (opcional)
6. Dale "Agregar café" ✓

### Revisitar un café
1. En la galería, expande el café
2. Haz click "🔄 Revisitar"
3. Rellena nueva visita (todo es independiente)
4. ¡Guarda! El café ahora tiene 2 visitas

### Ver en mapa
1. Haz click en pestaña "📍 Mapa"
2. Ves todos los cafés ubicados
3. Click en marcador = ver detalles

### Descargar guía en PDF
1. Haz click "📥 Descargar"
2. Si hay revisitas, marca "Mostrar histórico completo"
3. Click "Descargar PDF"
4. ¡Listo! Tienes una guía profesional para compartir

---

## 3️⃣ Compartir con Lauti

**Una vez deployado** (ej: en Netlify):

```
1. Obtenés link: https://flat-white-progetto.netlify.app
2. Se lo pasás a Lauti
3. Ambos abren el MISMO link
4. ¡Los datos se sincronizan automáticamente!
```

**Los dos pueden**:
- Agregar cafés independientemente
- Ver los mismos datos actualizados
- Exportar la guía compartida

---

## 4️⃣ Sistema de Puntuaciones

Cada categoría vale diferente:

| Categoría | Peso | Qué es |
|-----------|------|--------|
| ☕ Café | 30% | Gusto, temperatura, presentación |
| 🥐 Delizie | 20% | Croissant, medialunas, pasteles |
| 🍽️ Vajilla | 10% | Tazas, platos, cuchara |
| 🎨 Ambientación | 25% | Decoración, luz, vibe |
| 👥 Servicio | 15% | Atención, velocidad, simpatía |

**Rating Final = promedio ponderado automático** ⭐

---

## 5️⃣ Índice Flat White

El precio de un **café con leche estándar** = tu "índice":
- $800 = barato
- $1200 = medio
- $1800+ = caro

Sirve para comparar cafés y medir inflación ☕📈

---

## 6️⃣ Deploy en 2 minutos

### En Netlify:
```bash
# 1. Crear repo en GitHub
git init && git add . && git commit -m "init"
git push

# 2. Entra a netlify.com
# 3. "New site from Git" → Selecciona repo
# 4. Listo! Deploy automático ✓
```

### En Vercel:
```bash
# Igual que Netlify, pero en vercel.com
# Incluso más fácil 😎
```

---

## 7️⃣ Los datos se guardan dónde?

**localStorage del navegador** = local del usuario
- Sin servidor
- Sin costo
- Totalmente privado
- Sincronizado por URL compartida

Si abrís en otra computadora, los datos **no van a estar**. Pero si compartís el link con Lauti en la misma red/navegador, ¡sincroniza! 🔄

---

## 8️⃣ Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| "Error al agregar foto" | Recarga la página, intenta de nuevo |
| "El mapa no aparece" | Espera 2 segundos, recarga |
| "Los datos desaparecieron" | localStorage se limpió, vuelve a agregar |
| "PDF no descarga" | Intenta otro navegador |

---

## 9️⃣ Próximos pasos opcionales

- ✨ Cambiar colores (edita `--color-primary` en `src/App.module.css`)
- 🗺️ Agregar más categorías de ratings
- 📱 Hacer PWA (app mobile nativa)
- 🔄 Agregar sincronización en tiempo real (Firebase)
- 🌐 Compartir guías públicamente

---

## 🎯 Resumen Rápido

```
Setup (5 min) → Agregar cafés → Compartir link → ¡Explorar juntos!
```

**El regalo de Lauti está listo.** ☕✨

¿Querés cambiar algo de diseño, agregar campos, o directamente deployar?
