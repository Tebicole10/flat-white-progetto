# 📁 Estructura del Proyecto

```
flat-white-progetto/
│
├── 📄 README.md                    # Documentación principal
├── 📄 DEPLOYMENT.md                # Guía de deployment
├── 📄 package.json                 # Dependencias y scripts
├── 📄 package-lock.json            # Lock de versiones
├── 📄 tsconfig.json                # Config de TypeScript
├── 📄 vite.config.ts              # Config de Vite
├── 📄 .env.example                # Variables de entorno de ejemplo
├── 📄 .gitignore                  # Archivos a ignorar en git
├── 📄 setup.sh                    # Script de setup
│
├── 📁 public/                     # Archivos estáticos
│   └── favicon.svg
│
├── 📁 src/                        # Código fuente
│   ├── App.tsx                   # Componente raíz
│   ├── App.module.css            # Estilos globales
│   ├── main.tsx                  # Entrada de React
│   ├── index.css                 # Reset y fonts globales
│   ├── types.ts                  # Tipos TypeScript (Cafe, Visita, Ratings)
│   ├── utils.ts                  # Funciones de utilidad (cálculos, storage)
│   │
│   ├── 📁 context/
│   │   └── CafeContext.tsx       # Context global para estado de cafés
│   │
│   └── 📁 components/
│       ├── FormularioCafe.tsx    # Modal para agregar/editar cafés
│       ├── FormularioCafe.module.css
│       │
│       ├── Galeria.tsx           # Vista de galería digital
│       ├── Galeria.module.css
│       │
│       ├── Mapa.tsx              # Mapa interactivo con Leaflet
│       ├── Mapa.module.css
│       │
│       ├── ExportPDF.tsx         # Generador de PDF
│       └── ExportPDF.module.css
│
└── 📁 dist/                      # Build de producción (después de npm run build)
```

## 📊 Componentes Principales

### `App.tsx` - Orquestador Principal
- Maneja la navegación entre vistas (Galería, Mapa, Export)
- Control del formulario (agregar/revisitar)
- Layout principal con header y nav

### `CafeContext.tsx` - Estado Global
```typescript
- cafes: Cafe[]
- addCafe(cafe)
- updateCafe(id, cafe)
- deleteCafe(id)
- addVisita(cafeId, visita)
- updateVisita(cafeId, visitaId, visita)
- deleteVisita(cafeId, visitaId)
```

### `FormularioCafe.tsx` - Entrada de Datos
- Modal con campos para:
  - Información del café (nombre, dirección, coordenadas)
  - Sistema de 5 ratings (café, comestibles, vajilla, ambientación, servicio)
  - Índice Flat White (precio)
  - Notas personales
  - Upload de fotos múltiples
  - Agregar invitados especiales
- Validación automática
- Precarga de datos para revisitas

### `Galeria.tsx` - Visualización
- Grid de cafés con thumbnails
- Búsqueda/filtro por nombre
- Cards expandibles con:
  - Todas las fotos
  - Detalles de ratings
  - Información de precio y notas
  - Histórico de revisitas
  - Invitados
- Botones de revisitar y borrar

### `Mapa.tsx` - Geolocalización
- Mapa de Leaflet/OpenStreetMap
- Marcadores customizados por rating
- Popups informativos
- Auto-centra en los cafés
- Responsive

### `ExportPDF.tsx` - Exportación
- Genera PDF con:
  - Portada personalizada
  - Índice de cafés
  - Una página por café
  - Fotos, ratings, detalles
  - Opción de mostrar histórico completo
- Descarga directa al navegador

## 💾 Tipos de Datos

### `Cafe`
```typescript
{
  id: string
  nombre: string
  direccion: string
  coordenadas: { lat: number, lng: number }
  visitas: Visita[]
  createdAt: ISO date string
}
```

### `Visita`
```typescript
{
  id: string
  fecha: ISO date string
  ratings: Ratings
  notas: string
  comestibles: string
  precio: number
  fotos: string[] // base64
  invitados: string[]
}
```

### `Ratings`
```typescript
{
  cafe: 1-5
  comestibles: 1-5
  vajilla: 1-5
  ambientacion: 1-5
  servicio: 1-5
}
```

## 🎨 Sistema de Estilos

- **CSS Modules** para componentes
- **Variables CSS** globales en `App.module.css`:
  - Colores: `--color-primary`, `--color-secondary`, `--color-light`
  - Fuentes: `--font-serif`, `--font-sans`
- **Japandi Design**: minimalista, limpio, con whitespace
- **Responsive**: mobile-first approach

## 🔄 Flujo de Datos

```
Cafe Provider (Context)
    ↓
App (Router de vistas)
    ├─→ Galeria (lee cafes, muestra, controla expansión)
    ├─→ Mapa (lee cafes, renderiza marcadores)
    ├─→ ExportPDF (lee cafes, genera PDF)
    └─→ FormularioCafe (agrega/edita visitassobre)
         ↓
         localStorage (sincronización)
```

## 📦 Dependencias Clave

- **react** - Framework UI
- **react-dom** - Renderizado DOM
- **typescript** - Type safety
- **vite** - Build tool (10x faster than webpack)
- **leaflet** - Mapas interactivos
- **jspdf** - Generación de PDFs
- **html2canvas** - Captura de HTML para PDF
- **lucide-react** - Iconos bonitos

## 🚀 Scripts Disponibles

```bash
npm run dev      # Inicia servidor de desarrollo (localhost:5173)
npm run build    # Compila para producción (carpeta dist/)
npm run preview  # Vista previa de build de producción
npm run lint     # Verifica código con ESLint (opcional)
```

## 💡 Patrones Usados

1. **React Hooks** - useState, useEffect, useContext
2. **Context API** - Gestión global de estado
3. **CSS Modules** - Estilos encapsulados por componente
4. **TypeScript** - Type safety en todo el proyecto
5. **Componentes funcionales** - No hay clases
6. **localStorage** - Persistencia sin backend

## 🔐 Seguridad

- Las fotos se guardan como base64 en localStorage
- No hay servidor backend
- Los datos son solo del navegador (aislado por dominio)
- Para sincronización real entre usuarios, usarías Supabase/Firebase

## 📈 Posibles Mejoras

1. Sincronización en tiempo real (Supabase)
2. Autenticación de usuarios
3. Compartir guías públicamente
4. Google Maps autocompletar
5. Filtros avanzados
6. Estadísticas y analytics
7. Integración con redes sociales
8. PWA (Progressive Web App)

---

**Notas de Desarrollo:**
- TypeScript en modo strict (`verbatimModuleSyntax` activado)
- CSS Modules para evitar conflictos de clase
- Components funcionan sin props requeridos (máxima flexibilidad)
- localStorage es la fuente única de verdad (sin backend)
