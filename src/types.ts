export interface Ratings {
  cafe: number;
  comestibles: number | null;
  vajilla: number;
  ambientacion: number;
  servicio: number;
}

export interface Visita {
  id: string;
  fecha: string;
  ratings: Ratings;
  notas: string;
  comestibles: string;
  precio: number;
  fotos: string[];
  invitados: string[];
}

export interface Cafe {
  id: string;
  nombre: string;
  direccion: string;
  coordenadas: { lat: number; lng: number };
  visitas: Visita[];
  createdAt: string;
}

export interface Pendiente {
  id: string;
  nombre: string;
  direccion: string;
  nota: string;
  createdAt: string;
}
