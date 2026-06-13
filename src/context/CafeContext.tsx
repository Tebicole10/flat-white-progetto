import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Cafe, Visita } from '../types';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils';

interface CafeContextType {
  cafes: Cafe[];
  addCafe: (cafe: Cafe) => void;
  updateCafe: (cafeId: string, cafe: Cafe) => void;
  deleteCafe: (cafeId: string) => void;
  addVisita: (cafeId: string, visita: Visita) => void;
  updateVisita: (cafeId: string, visitaId: string, visita: Visita) => void;
  deleteVisita: (cafeId: string, visitaId: string) => void;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export const CafeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCafes(loadFromLocalStorage());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveToLocalStorage(cafes);
  }, [cafes, loaded]);

  const addCafe = (cafe: Cafe) => setCafes(prev => [...prev, cafe]);

  const updateCafe = (cafeId: string, updated: Cafe) =>
    setCafes(prev => prev.map(c => c.id === cafeId ? updated : c));

  const deleteCafe = (cafeId: string) =>
    setCafes(prev => prev.filter(c => c.id !== cafeId));

  const addVisita = (cafeId: string, visita: Visita) =>
    setCafes(prev => prev.map(c =>
      c.id === cafeId ? { ...c, visitas: [...c.visitas, visita] } : c
    ));

  const updateVisita = (cafeId: string, visitaId: string, updated: Visita) =>
    setCafes(prev => prev.map(c =>
      c.id === cafeId
        ? { ...c, visitas: c.visitas.map(v => v.id === visitaId ? updated : v) }
        : c
    ));

  const deleteVisita = (cafeId: string, visitaId: string) =>
    setCafes(prev => prev.map(c =>
      c.id === cafeId
        ? { ...c, visitas: c.visitas.filter(v => v.id !== visitaId) }
        : c
    ));

  return (
    <CafeContext.Provider value={{ cafes, addCafe, updateCafe, deleteCafe, addVisita, updateVisita, deleteVisita }}>
      {children}
    </CafeContext.Provider>
  );
};

export const useCafeContext = () => {
  const context = useContext(CafeContext);
  if (!context) throw new Error('useCafeContext debe usarse dentro de CafeProvider');
  return context;
};
