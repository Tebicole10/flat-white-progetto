import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Cafe, Visita, Pendiente } from '../types';
import { supabase } from '../supabase';

interface CafeContextType {
  cafes: Cafe[];
  pendientes: Pendiente[];
  loading: boolean;
  addCafe: (cafe: Cafe) => Promise<void>;
  updateCafe: (cafeId: string, cafe: Cafe) => Promise<void>;
  deleteCafe: (cafeId: string) => Promise<void>;
  addVisita: (cafeId: string, visita: Visita) => Promise<void>;
  updateVisita: (cafeId: string, visitaId: string, visita: Visita) => Promise<void>;
  deleteVisita: (cafeId: string, visitaId: string) => Promise<void>;
  addPendiente: (p: Pendiente) => Promise<void>;
  updatePendiente: (id: string, p: Pendiente) => Promise<void>;
  deletePendiente: (id: string) => Promise<void>;
  convertirPendiente: (id: string) => Pendiente | null;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

// Helpers para convertir entre formato Supabase y formato app
const rowToCafe = (row: any, visitas: any[]): Cafe => ({
  id: row.id,
  nombre: row.nombre,
  direccion: row.direccion,
  coordenadas: { lat: row.lat, lng: row.lng },
  createdAt: row.created_at,
  visitas: visitas
    .filter(v => v.cafe_id === row.id)
    .map(rowToVisita)
    .sort((a, b) => b.fecha.localeCompare(a.fecha)),
});

const rowToVisita = (row: any): Visita => ({
  id: row.id,
  fecha: row.fecha,
  ratings: {
    cafe: row.rating_cafe,
    comestibles: row.rating_comestibles,
    vajilla: row.rating_vajilla,
    ambientacion: row.rating_ambientacion,
    servicio: row.rating_servicio,
  },
  notas: row.notas || '',
  comestibles: row.comestibles || '',
  precio: row.precio || 0,
  fotos: row.fotos || [],
  invitados: row.invitados || [],
});

const rowToPendiente = (row: any): Pendiente => ({
  id: row.id,
  nombre: row.nombre,
  direccion: row.direccion || '',
  nota: row.nota || '',
  createdAt: row.created_at,
});

export const CafeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [pendientes, setPendientes] = useState<Pendiente[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos al montar
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [{ data: cafesData }, { data: visitasData }, { data: pendientesData }] = await Promise.all([
        supabase.from('cafes').select('*').order('created_at', { ascending: true }),
        supabase.from('visitas').select('*').order('fecha', { ascending: false }),
        supabase.from('pendientes').select('*').order('created_at', { ascending: true }),
      ]);

      if (cafesData && visitasData) {
        setCafes(cafesData.map(c => rowToCafe(c, visitasData)));
      }
      if (pendientesData) {
        setPendientes(pendientesData.map(rowToPendiente));
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Suscripción realtime para que todos vean cambios en tiempo real
  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cafes' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visitas' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pendientes' }, fetchAll)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const addCafe = async (cafe: Cafe) => {
    await supabase.from('cafes').insert({
      id: cafe.id,
      nombre: cafe.nombre,
      direccion: cafe.direccion,
      lat: cafe.coordenadas.lat,
      lng: cafe.coordenadas.lng,
    });
    if (cafe.visitas.length > 0) {
      await addVisita(cafe.id, cafe.visitas[0]);
    }
  };

  const updateCafe = async (cafeId: string, cafe: Cafe) => {
    await supabase.from('cafes').update({
      nombre: cafe.nombre,
      direccion: cafe.direccion,
      lat: cafe.coordenadas.lat,
      lng: cafe.coordenadas.lng,
    }).eq('id', cafeId);
    await fetchAll();
  };

  const deleteCafe = async (cafeId: string) => {
    await supabase.from('cafes').delete().eq('id', cafeId);
    await fetchAll();
  };

  const addVisita = async (cafeId: string, visita: Visita) => {
    await supabase.from('visitas').insert({
      id: visita.id,
      cafe_id: cafeId,
      fecha: visita.fecha,
      rating_cafe: visita.ratings.cafe,
      rating_comestibles: visita.ratings.comestibles,
      rating_vajilla: visita.ratings.vajilla,
      rating_ambientacion: visita.ratings.ambientacion,
      rating_servicio: visita.ratings.servicio,
      notas: visita.notas,
      comestibles: visita.comestibles,
      precio: visita.precio,
      fotos: visita.fotos,
      invitados: visita.invitados,
    });
    await fetchAll();
  };

  const updateVisita = async (_cafeId: string, visitaId: string, visita: Visita) => {
    await supabase.from('visitas').update({
      fecha: visita.fecha,
      rating_cafe: visita.ratings.cafe,
      rating_comestibles: visita.ratings.comestibles,
      rating_vajilla: visita.ratings.vajilla,
      rating_ambientacion: visita.ratings.ambientacion,
      rating_servicio: visita.ratings.servicio,
      notas: visita.notas,
      comestibles: visita.comestibles,
      precio: visita.precio,
      fotos: visita.fotos,
      invitados: visita.invitados,
    }).eq('id', visitaId);
    await fetchAll();
  };

  const deleteVisita = async (_cafeId: string, visitaId: string) => {
    await supabase.from('visitas').delete().eq('id', visitaId);
    await fetchAll();
  };

  const addPendiente = async (p: Pendiente) => {
    await supabase.from('pendientes').insert({
      id: p.id,
      nombre: p.nombre,
      direccion: p.direccion,
      nota: p.nota,
    });
    await fetchAll();
  };

  const updatePendiente = async (id: string, p: Pendiente) => {
    await supabase.from('pendientes').update({
      nombre: p.nombre,
      direccion: p.direccion,
      nota: p.nota,
    }).eq('id', id);
    await fetchAll();
  };

  const deletePendiente = async (id: string) => {
    await supabase.from('pendientes').delete().eq('id', id);
    await fetchAll();
  };

  const convertirPendiente = (id: string): Pendiente | null => {
    return pendientes.find(p => p.id === id) || null;
  };

  return (
    <CafeContext.Provider value={{
      cafes, pendientes, loading,
      addCafe, updateCafe, deleteCafe,
      addVisita, updateVisita, deleteVisita,
      addPendiente, updatePendiente, deletePendiente,
      convertirPendiente,
    }}>
      {children}
    </CafeContext.Provider>
  );
};

export const useCafeContext = () => {
  const context = useContext(CafeContext);
  if (!context) throw new Error('useCafeContext debe usarse dentro de CafeProvider');
  return context;
};
