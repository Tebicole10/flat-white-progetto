import React, { useEffect, useRef, useState } from 'react';
import type { Cafe } from '../types';
import { useCafeContext } from '../context/CafeContext';
import { calcularPromedioCafe } from '../utils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './Mapa.module.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;

interface MapaProps {
  onVerDetalle?: (cafeId: string) => void;
}

export const Mapa: React.FC<MapaProps> = ({ onVerDetalle }) => {
  const { cafes } = useCafeContext();
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const cafesConVisitas = cafes.filter(c => c.visitas.length > 0);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, { zoomControl: false }).setView([-34.6037, -58.3816], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapRef.current);
      // Leaflet no propaga el click de un marker al mapa, así que esto sólo
      // dispara al tocar el fondo vacío del mapa, nunca al tocar un pin.
      mapRef.current.on('click', () => setSelectedId(null));
    }

    markersRef.current.forEach(m => m.remove());
    markersRef.current.clear();

    cafesConVisitas.forEach(cafe => {
      const rating = calcularPromedioCafe(cafe);
      const activo = selectedId === cafe.id;
      const size = activo ? 44 : 36;
      const bg = activo ? 'var(--burro)' : 'var(--rosso)';
      const fg = activo ? 'var(--verde)' : 'var(--burro)';
      const border = activo ? '2px solid var(--burro)' : '2px solid transparent';
      const primerNombre = cafe.nombre.split(' ')[0].toUpperCase();

      const markerHtml = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:5px;">
          <div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;font:400 15px 'Anton',sans-serif;color:${fg};box-shadow:0 6px 16px rgba(0,0,0,.4);border:${border}">${rating.toFixed(1)}</div>
          <div style="font:600 8.5px/1 'Mukta',sans-serif;letter-spacing:.14em;color:rgba(249,226,148,.8);background:rgba(20,28,14,.55);padding:2px 6px;border-radius:4px;white-space:nowrap">${primerNombre}</div>
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: '',
        iconSize: [100, size + 20],
        iconAnchor: [50, size + 20],
      });

      const marker = L.marker([cafe.coordenadas.lat, cafe.coordenadas.lng], {
        icon,
        zIndexOffset: activo ? 1000 : 0,
      }).addTo(mapRef.current!);

      marker.on('click', () => setSelectedId(cafe.id));
      markersRef.current.set(cafe.id, marker);
    });

    if (cafesConVisitas.length > 0 && selectedId === null) {
      const bounds = L.latLngBounds(cafesConVisitas.map(c => [c.coordenadas.lat, c.coordenadas.lng]));
      mapRef.current?.fitBounds(bounds, { padding: [50, 70] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafes, selectedId]);

  const pinCard: Cafe | undefined = selectedId ? cafesConVisitas.find(c => c.id === selectedId) : undefined;
  const fotoPin = pinCard ? [...pinCard.visitas].sort((a, b) => b.fecha.localeCompare(a.fecha)).flatMap(v => v.fotos)[0] : undefined;

  return (
    <div className={styles.mapaWrap}>
      <div className={styles.label}>
        <span>BUENOS AIRES · CABA</span>
        <span>{cafesConVisitas.length} {cafesConVisitas.length === 1 ? 'PIN' : 'PINES'}</span>
      </div>
      <div ref={containerRef} className={styles.mapa} />
      {cafesConVisitas.length === 0 && (
        <div className={styles.empty}><p>No hay cafés en el mapa aún ☕</p></div>
      )}
      {pinCard && (
        <div className={styles.pinCard} onClick={e => e.stopPropagation()}>
          {fotoPin && <img src={fotoPin} alt="" className={styles.pinFoto} />}
          <div className={styles.pinInfo}>
            <div className={styles.pinNombre}>{pinCard.nombre}</div>
            <div className={styles.pinDireccion}>{pinCard.direccion}</div>
            <button className={styles.pinLink} onClick={() => onVerDetalle?.(pinCard.id)}>Ver detalle completo →</button>
          </div>
          <div className={styles.pinScore}>{calcularPromedioCafe(pinCard).toFixed(1)}</div>
        </div>
      )}
    </div>
  );
};
