export interface Ratings {
  cafe: number;        // 1-10
  comestibles: number; // 1-10
  vajilla: number;     // 1-10
  ambientacion: number;// 1-10
  servicio: number;    // 1-10
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
