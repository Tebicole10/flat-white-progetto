-- Tabla principal de cafés
CREATE TABLE cafes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  direccion TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de visitas (cada visita pertenece a un café)
CREATE TABLE visitas (
  id TEXT PRIMARY KEY,
  cafe_id TEXT NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  fecha TEXT NOT NULL,
  rating_cafe INTEGER,
  rating_comestibles INTEGER,
  rating_vajilla INTEGER,
  rating_ambientacion INTEGER,
  rating_servicio INTEGER,
  notas TEXT DEFAULT '',
  comestibles TEXT DEFAULT '',
  precio INTEGER DEFAULT 0,
  fotos TEXT[] DEFAULT '{}',
  invitados TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de pendientes (cafés que quieren visitar)
CREATE TABLE pendientes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  direccion TEXT DEFAULT '',
  nota TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar acceso público (sin autenticación individual)
-- Todos los que conocen la URL pueden leer y escribir
ALTER TABLE cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pendientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso publico cafes" ON cafes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso publico visitas" ON visitas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso publico pendientes" ON pendientes FOR ALL USING (true) WITH CHECK (true);
