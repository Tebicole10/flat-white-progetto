# ☕ Flat White Progetto

**Un viaggio per il caffè di Buenos Aires con il mio bro**

Una app web para explorar y documentar cafés en Buenos Aires de forma colaborativa.

## 🚀 Características

✅ **Formulario inteligente** para agregar cafés y revisitas  
✅ **Sistema de ratings multi-categoría** con ponderación automática:
   - ☕ Café (30%)
   - 🥐 Delizie (20%)
   - 🍽️ Vajilla (10%)
   - 🎨 Ambientación (25%)
   - 👥 Servicio (15%)

✅ **Invitados especiales** - agrega quién fue contigo  
✅ **Fotos múltiples** por café (la primera es portada)  
✅ **Galería digital** con búsqueda y filtros  
✅ **Mapa interactivo** con ubicaciones de todos los cafés  
✅ **Exportar a PDF** profesional con todas las visitas  
✅ **Histórico de visitas** para ver cómo evoluciona cada café  
✅ **Sincronización local** - comparte el mismo link con tu amigo  

## 🛠️ Desarrollo

### Instalar dependencias

\`\`\`bash
npm install
\`\`\`

### Correr servidor de desarrollo

\`\`\`bash
npm run dev
\`\`\`

Abre \`http://localhost:5173\` en tu navegador.

### Compilar para producción

\`\`\`bash
npm run build
\`\`\`

## 📦 Tech Stack

- **React 18** + TypeScript
- **Vite** - build tool
- **Leaflet** - mapas interactivos
- **jsPDF** - generación de PDFs
- **Lucide React** - iconos
- **CSS Modules** - estilos encapsulados
- **localStorage** - persistencia local sin servidor

## 🎨 Diseño

Inspirado en **japandi maximalism** con acentos italianos

## 💾 Persistencia

Todo se guarda en localStorage - comparte el URL con tu amigo y ambos tendrán acceso a los mismos datos.

## 🚢 Deploy en Netlify

1. Haz git push a tu repo
2. Conecta a Netlify desde GitHub
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy! 🚀

---

**Hecho con ☕ y mucho amor**
