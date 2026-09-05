import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Cafe, Visita, Pendiente } from '../types';
import { db } from '../firebase';
import {
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc,
  getDocs, query, where, writeBatch,
} from 'firebase/firestore';

/* ────────────────────────────────────────────────────────────────
   Modelo en Firestore (migrado desde supabase-setup.sql)

     cafes/{id}      → { nombre, direccion, lat, lng, createdAt }
     visitas/{id}    → { cafeId, fecha, ratings{...}, notas, comestibles,
                         precio, invitados: string[], fotos: string[] (IDs), createdAt }
     pendientes/{id} → { nombre, direccion, nota, createdAt }
     fotos/{id}      → { cafeId, visitaId, data }

   Los ratings van como mapa anidado en vez de columnas rating_* sueltas:
   Postgres obligaba a aplanarlos, Firestore no.

   Las FOTOS van en su propia colección porque un documento de Firestore no
   puede pasar 1 MiB y cada foto en base64 pesa 150–400 KB. Hacia afuera esto
   es invisible: Visita.fotos sigue siendo string[] de data URLs, igual que
   antes, así que ningún componente cambia.
   ──────────────────────────────────────────────────────────────── */

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
  reordenarCafes: (idsEnOrden: string[]) => Promise<void>;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

const cafesCol = collection(db, 'cafes');
const visitasCol = collection(db, 'visitas');
const pendientesCol = collection(db, 'pendientes');
const fotosCol = collection(db, 'fotos');

const nuevoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

type CafeRow = { id: string; nombre: string; direccion: string; lat: number; lng: number; createdAt: string; orden?: number };
type VisitaRow = {
  id: string; cafeId: string; fecha: string; ratings: Visita['ratings'];
  notas: string; comestibles: string; precio: number; invitados: string[];
  fotos: string[]; createdAt: string;
};
type PendienteRow = { id: string; nombre: string; direccion: string; nota: string; createdAt: string };

export const CafeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cafesRaw, setCafesRaw] = useState<CafeRow[]>([]);
  const [visitasRaw, setVisitasRaw] = useState<VisitaRow[]>([]);
  const [pendientesRaw, setPendientesRaw] = useState<PendienteRow[]>([]);
  const [fotosPorId, setFotosPorId] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  // dataURL → id, para no volver a subir una foto que ya está guardada.
  const idPorData = useRef<Map<string, string>>(new Map());
  // Última lista de fotos escrita por visita, para borrar las que se sacaron.
  const visitasRef = useRef<VisitaRow[]>([]);
  visitasRef.current = visitasRaw;

  /* ── Listeners en vivo (reemplazan al postgres_changes de Supabase) ── */
  useEffect(() => {
    const listos = { cafes: false, visitas: false, pendientes: false, fotos: false };
    const marcar = (k: keyof typeof listos) => {
      listos[k] = true;
      if (listos.cafes && listos.visitas && listos.pendientes && listos.fotos) setLoading(false);
    };

    const unsubs = [
      onSnapshot(cafesCol, snap => {
        setCafesRaw(snap.docs.map(d => ({ id: d.id, ...d.data() } as CafeRow)));
        marcar('cafes');
      }, e => { console.error('cafes:', e); marcar('cafes'); }),

      onSnapshot(visitasCol, snap => {
        setVisitasRaw(snap.docs.map(d => ({ id: d.id, ...d.data() } as VisitaRow)));
        marcar('visitas');
      }, e => { console.error('visitas:', e); marcar('visitas'); }),

      onSnapshot(pendientesCol, snap => {
        setPendientesRaw(snap.docs.map(d => ({ id: d.id, ...d.data() } as PendienteRow)));
        marcar('pendientes');
      }, e => { console.error('pendientes:', e); marcar('pendientes'); }),

      onSnapshot(fotosCol, snap => {
        const m = new Map<string, string>();
        snap.docs.forEach(d => {
          const data = (d.data() as { data?: string }).data;
          if (data) { m.set(d.id, data); idPorData.current.set(data, d.id); }
        });
        setFotosPorId(m);
        marcar('fotos');
      }, e => { console.error('fotos:', e); marcar('fotos'); }),
    ];

    // Si Firestore no contesta (red caída, config mal puesta), los listeners
    // reintentan en silencio para siempre. Sin esto la app se queda colgada en
    // loading: a los 8 segundos la soltamos y que se use igual — los datos
    // entran solos cuando el snapshot llegue.
    const timeout = setTimeout(() => setLoading(false), 8000);

    return () => {
      clearTimeout(timeout);
      unsubs.forEach(u => u());
    };
  }, []);

  /* ── Armado del modelo que ven los componentes ── */
  const cafes = useMemo<Cafe[]>(() => {
    return cafesRaw
      .map(row => ({
        id: row.id,
        nombre: row.nombre,
        direccion: row.direccion,
        coordenadas: { lat: row.lat, lng: row.lng },
        createdAt: row.createdAt,
        orden: row.orden,
        visitas: visitasRaw
          .filter(v => v.cafeId === row.id)
          .map<Visita>(v => ({
            id: v.id,
            fecha: v.fecha,
            ratings: v.ratings,
            notas: v.notas || '',
            comestibles: v.comestibles || '',
            precio: v.precio || 0,
            invitados: v.invitados || [],
            // IDs → data URLs. Las que todavía no bajaron se omiten.
            fotos: (v.fotos || []).map(id => fotosPorId.get(id)).filter((d): d is string => !!d),
          }))
          .sort((a, b) => b.fecha.localeCompare(a.fecha)),
      }))
      .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  }, [cafesRaw, visitasRaw, fotosPorId]);

  const pendientes = useMemo<Pendiente[]>(() =>
    pendientesRaw
      .map(p => ({ id: p.id, nombre: p.nombre, direccion: p.direccion || '', nota: p.nota || '', createdAt: p.createdAt }))
      .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || '')),
    [pendientesRaw]);

  /* ── Fotos: data URLs → documentos propios ── */
  const guardarFotos = async (cafeId: string, visitaId: string, fotos: string[]): Promise<string[]> => {
    const ids: string[] = [];
    for (const foto of fotos) {
      const existente = idPorData.current.get(foto);
      if (existente) { ids.push(existente); continue; }
      const id = nuevoId();
      await setDoc(doc(fotosCol, id), { cafeId, visitaId, data: foto });
      idPorData.current.set(foto, id);
      ids.push(id);
    }
    return ids;
  };

  const borrarFotos = async (ids: string[]) => {
    await Promise.all(ids.map(id => deleteDoc(doc(fotosCol, id)).catch(() => {})));
  };

  // Fotos que estaban en la visita y ya no están → quedan huérfanas, se borran.
  const limpiarHuerfanas = async (visitaId: string, nuevosIds: string[]) => {
    const anterior = visitasRef.current.find(v => v.id === visitaId);
    if (!anterior) return;
    const sobrantes = (anterior.fotos || []).filter(id => !nuevosIds.includes(id));
    if (sobrantes.length) await borrarFotos(sobrantes);
  };

  const escribirVisita = async (cafeId: string, visita: Visita) => {
    const fotoIds = await guardarFotos(cafeId, visita.id, visita.fotos || []);
    await setDoc(doc(visitasCol, visita.id), {
      cafeId,
      fecha: visita.fecha,
      ratings: visita.ratings,
      notas: visita.notas || '',
      comestibles: visita.comestibles || '',
      precio: visita.precio || 0,
      invitados: visita.invitados || [],
      fotos: fotoIds,
      createdAt: new Date().toISOString(),
    });
    return fotoIds;
  };

  /* ── CRUD (misma interfaz que ya consumían los componentes) ── */
  const addCafe = async (cafe: Cafe) => {
    await setDoc(doc(cafesCol, cafe.id), {
      nombre: cafe.nombre,
      direccion: cafe.direccion,
      lat: cafe.coordenadas.lat,
      lng: cafe.coordenadas.lng,
      createdAt: cafe.createdAt || new Date().toISOString(),
    });
    for (const v of cafe.visitas || []) await escribirVisita(cafe.id, v);
  };

  const updateCafe = async (cafeId: string, cafe: Cafe) => {
    await updateDoc(doc(cafesCol, cafeId), {
      nombre: cafe.nombre,
      direccion: cafe.direccion,
      lat: cafe.coordenadas.lat,
      lng: cafe.coordenadas.lng,
    });
  };

  const deleteCafe = async (cafeId: string) => {
    const [visitasSnap, fotosSnap] = await Promise.all([
      getDocs(query(visitasCol, where('cafeId', '==', cafeId))),
      getDocs(query(fotosCol, where('cafeId', '==', cafeId))),
    ]);
    const batch = writeBatch(db);
    visitasSnap.docs.forEach(d => batch.delete(d.ref));
    fotosSnap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(doc(cafesCol, cafeId));
    await batch.commit();
  };

  const addVisita = async (cafeId: string, visita: Visita) => {
    await escribirVisita(cafeId, visita);
  };

  const updateVisita = async (cafeId: string, visitaId: string, visita: Visita) => {
    const ids = await escribirVisita(cafeId, { ...visita, id: visitaId });
    await limpiarHuerfanas(visitaId, ids);
  };

  const deleteVisita = async (_cafeId: string, visitaId: string) => {
    const anterior = visitasRef.current.find(v => v.id === visitaId);
    await deleteDoc(doc(visitasCol, visitaId));
    if (anterior?.fotos?.length) await borrarFotos(anterior.fotos);
  };

  const addPendiente = async (p: Pendiente) => {
    await setDoc(doc(pendientesCol, p.id), {
      nombre: p.nombre,
      direccion: p.direccion || '',
      nota: p.nota || '',
      createdAt: p.createdAt || new Date().toISOString(),
    });
  };

  const updatePendiente = async (id: string, p: Pendiente) => {
    await updateDoc(doc(pendientesCol, id), {
      nombre: p.nombre,
      direccion: p.direccion || '',
      nota: p.nota || '',
    });
  };

  const deletePendiente = async (id: string) => {
    await deleteDoc(doc(pendientesCol, id));
  };

  const convertirPendiente = (id: string): Pendiente | null => {
    return pendientes.find(p => p.id === id) || null;
  };

  const reordenarCafes = async (idsEnOrden: string[]) => {
    const batch = writeBatch(db);
    idsEnOrden.forEach((id, idx) => batch.update(doc(cafesCol, id), { orden: idx }));
    await batch.commit();
  };

  return (
    <CafeContext.Provider value={{
      cafes, pendientes, loading,
      addCafe, updateCafe, deleteCafe,
      addVisita, updateVisita, deleteVisita,
      addPendiente, updatePendiente, deletePendiente,
      convertirPendiente, reordenarCafes,
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
