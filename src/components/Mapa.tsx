import React, { useEffect, useRef } from 'react';
import { useCafeContext } from '../context/CafeContext';
import { calcularPromedioCafe } from '../utils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './Mapa.module.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;

export const Mapa: React.FC = () => {
  const { cafes } = useCafeContext();
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([-34.6037, -58.3816], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapRef.current);
    }

    markersRef.current.forEach(m => m.remove());
    markersRef.current.clear();

    // Calcular ranking para top 3
    const rankingOrden = [...cafes]
      .filter(c => c.visitas.length > 0)
      .sort((a, b) => calcularPromedioCafe(b) - calcularPromedioCafe(a));

    const medallas: Record<string, { color: string; emoji: string }> = {};
    const colores = [
      { color: '#D4AF37', emoji: '🥇' },
      { color: '#A8A9AD', emoji: '🥈' },
      { color: '#CD7F32', emoji: '🥉' },
    ];
    rankingOrden.slice(0, 3).forEach((cafe, idx) => {
      medallas[cafe.id] = colores[idx];
    });

    cafes.forEach(cafe => {
      if (cafe.visitas.length === 0) return;
      const rating = calcularPromedioCafe(cafe);
      const medalla = medallas[cafe.id];
      const color = medalla ? medalla.color : '#c4621a';
      const emojiMedalla = medalla ? medalla.emoji : '';

      const markerHtml = `
        <div class="fwp-marker" style="--mc: ${color}">
          <span class="fwp-rating">${emojiMedalla} ★ ${rating.toFixed(1)}</span>
          <span class="fwp-nombre">${cafe.nombre}</span>
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: '',
        iconSize: [100, 52],
        iconAnchor: [50, 52],
        popupAnchor: [0, -56],
      });

      const marker = L.marker([cafe.coordenadas.lat, cafe.coordenadas.lng], { icon })
        .addTo(mapRef.current!);

      marker.bindPopup(`
        <div style="font-family: DM Sans, sans-serif; font-size: 13px; color: #1a0e07; min-width: 140px;">
          <strong style="font-family: 'Yanone Kaffeesatz', sans-serif; font-size: 16px;">${emojiMedalla} ${cafe.nombre}</strong><br/>
          <span style="color: #888; font-size: 11px;">${cafe.direccion}</span><br/>
          <span style="color: ${color}; font-weight: 700; margin-top: 4px; display: block; font-size: 14px;">★ ${rating.toFixed(1)}/10</span>
        </div>
      `);

      markersRef.current.set(cafe.id, marker);
    });

    if (cafes.some(c => c.visitas.length > 0)) {
      const validos = cafes.filter(c => c.visitas.length > 0);
      const bounds = L.latLngBounds(validos.map(c => [c.coordenadas.lat, c.coordenadas.lng]));
      mapRef.current?.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [cafes]);

  return (
    <div className={styles.mapaWrap}>
      <style>{`
        .fwp-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }
        .fwp-rating {
          background: var(--mc, #c4621a);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 9px;
          border-radius: 20px;
          white-space: nowrap;
          box-shadow: 0 2px 10px rgba(0,0,0,0.35);
          border: 1.5px solid rgba(255,255,255,0.3);
        }
        .fwp-nombre {
          background: rgba(15, 7, 3, 0.85);
          color: #f5e6d3;
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 500;
          padding: 2px 7px;
          border-radius: 4px;
          white-space: nowrap;
          max-width: 110px;
          overflow: hidden;
          text-overflow: ellipsis;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
      `}</style>
      <div ref={containerRef} className={styles.mapa} />
      {cafes.length === 0 && (
        <div className={styles.empty}><p>No hay cafés en el mapa aún ☕</p></div>
      )}
    </div>
  );
};
