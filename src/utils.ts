import type { Cafe, Visita, Ratings } from './types';

export const PESOS = {
  cafe: 0.30,
  comestibles: 0.20,
  vajilla: 0.10,
  ambientacion: 0.25,
  servicio: 0.15,
};

export const CATEGORIAS = [
  { key: 'cafe' as const, label: '☕ Café', emoji: '☕' },
  { key: 'comestibles' as const, label: '🥐 Delizie', emoji: '🥐' },
  { key: 'vajilla' as const, label: '🍽️ Vajilla', emoji: '🍽️' },
  { key: 'ambientacion' as const, label: '🎨 Ambientación', emoji: '🎨' },
  { key: 'servicio' as const, label: '👥 Servicio', emoji: '👥' },
];

// Rating ponderado de una visita (sobre 10)
export const calcularRatingVisita = (ratings: Ratings): number => {
  const total =
    ratings.cafe * PESOS.cafe +
    ratings.comestibles * PESOS.comestibles +
    ratings.vajilla * PESOS.vajilla +
    ratings.ambientacion * PESOS.ambientacion +
    ratings.servicio * PESOS.servicio;
  return Math.round(total * 10) / 10;
};

// Promedio de TODAS las visitas de un café (sobre 10)
export const calcularPromedioCafe = (cafe: Cafe): number => {
  if (cafe.visitas.length === 0) return 0;
  const suma = cafe.visitas.reduce((acc, v) => acc + calcularRatingVisita(v.ratings), 0);
  return Math.round((suma / cafe.visitas.length) * 10) / 10;
};

export const calcularPromedioCategoria = (cafe: Cafe, categoria: keyof Ratings): number => {
  if (cafe.visitas.length === 0) return 0;
  const suma = cafe.visitas.reduce((acc, v) => acc + v.ratings[categoria], 0);
  return Math.round((suma / cafe.visitas.length) * 10) / 10;
};

// Promedio de precio de todas las visitas con precio
export const calcularPrecioPromedio = (cafe: Cafe): number | null => {
  const conPrecio = cafe.visitas.filter(v => v.precio > 0);
  if (conPrecio.length === 0) return null;
  return Math.round(conPrecio.reduce((acc, v) => acc + v.precio, 0) / conPrecio.length);
};

export const obtenerUltimaVisita = (cafe: Cafe): Visita | null => {
  if (cafe.visitas.length === 0) return null;
  return [...cafe.visitas].sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
};

export const loadFromLocalStorage = (): Cafe[] => {
  try {
    const data = localStorage.getItem('flatWhiteProgetto');
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

export const saveToLocalStorage = (cafes: Cafe[]): void => {
  localStorage.setItem('flatWhiteProgetto', JSON.stringify(cafes));
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatFecha = (fecha: string): string => {
  const [year, month, day] = fecha.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const obtenerUltimos8 = (cafes: Cafe[]): Cafe[] => {
  return [...cafes]
    .filter(c => c.visitas.length > 0)
    .sort((a, b) => {
      const fa = obtenerUltimaVisita(a)?.fecha || '';
      const fb = obtenerUltimaVisita(b)?.fecha || '';
      return fb.localeCompare(fa);
    })
    .slice(0, 8);
};
