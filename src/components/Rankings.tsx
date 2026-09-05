import { useState } from 'react';
import { useCafeContext } from '../context/CafeContext';
import { calcularPromedioCafe, calcularPromedioCategoria, calcularPrecioPromedio, calcularRankingInvitados } from '../utils';
import type { Cafe } from '../types';
import { Icon } from './Icon';
import styles from './Rankings.module.css';

type CategoriaKey = 'total' | 'cafe' | 'comestibles' | 'vajilla' | 'ambientacion' | 'servicio' | 'precio' | 'invitados';

const OPCIONES: { key: CategoriaKey; label: string; emoji: string }[] = [
  { key: 'total', label: 'Total', emoji: '👑' },
  { key: 'cafe', label: 'Café', emoji: '☕' },
  { key: 'comestibles', label: 'Delizie', emoji: '🥐' },
  { key: 'vajilla', label: 'Vajilla', emoji: '🍽️' },
  { key: 'ambientacion', label: 'Ambiente', emoji: '🎨' },
  { key: 'servicio', label: 'Servicio', emoji: '👥' },
  { key: 'precio', label: 'Índice FW', emoji: '💰' },
  { key: 'invitados', label: 'Compañeros', emoji: '🫂' },
];

const HINTS: Record<CategoriaKey, string> = {
  total: 'PONDERADO · CAFÉ 30% · DELIZIE 20% · AMBIENTACIÓN 25% · SERVICIO 15% · VAJILLA 10%',
  cafe: 'PROMEDIO DE ESA CATEGORÍA EN TODAS LAS VISITAS',
  comestibles: 'PROMEDIO DE ESA CATEGORÍA EN TODAS LAS VISITAS',
  vajilla: 'PROMEDIO DE ESA CATEGORÍA EN TODAS LAS VISITAS',
  ambientacion: 'PROMEDIO DE ESA CATEGORÍA EN TODAS LAS VISITAS',
  servicio: 'PROMEDIO DE ESA CATEGORÍA EN TODAS LAS VISITAS',
  precio: 'PROMEDIO DE PRECIO · DEL MÁS BARATO AL MÁS CARO',
  invitados: 'CUÁNTAS VISITAS HIZO CADA UNO',
};

const medalBg = (idx: number) => idx === 0 ? 'var(--burro)' : idx === 1 ? 'var(--rosso)' : idx === 2 ? 'var(--rosa)' : 'rgba(249,226,148,.12)';
const medalFg = (idx: number) => idx < 3 ? 'var(--verde)' : 'var(--burro)';

export const Rankings: React.FC = () => {
  const { cafes } = useCafeContext();
  const [categoria, setCategoria] = useState<CategoriaKey>('total');

  const esPrecio = categoria === 'precio';
  const esInvitados = categoria === 'invitados';

  const getRating = (cafe: Cafe): number | null => {
    if (categoria === 'total') return calcularPromedioCafe(cafe);
    if (categoria === 'precio') return calcularPrecioPromedio(cafe);
    if (categoria === 'invitados') return null;
    return calcularPromedioCategoria(cafe, categoria);
  };

  const ranking = esInvitados ? [] : [...cafes]
    .filter(c => c.visitas.length > 0 && getRating(c) !== null)
    .sort((a, b) => {
      const ra = getRating(a) ?? Infinity;
      const rb = getRating(b) ?? Infinity;
      return esPrecio ? ra - rb : rb - ra;
    });

  const rankingInvitados = esInvitados ? calcularRankingInvitados(cafes) : [];

  return (
    <div className={styles.rankings}>
      <h1 className={styles.title}>Rankings</h1>

      <div className={styles.carrusel}>
        {OPCIONES.map(op => {
          const activa = categoria === op.key;
          return (
            <button key={op.key} className={styles.catBtn} style={{ opacity: activa ? 1 : .6 }} onClick={() => setCategoria(op.key)}>
              <span className={styles.catDisc} style={{ borderColor: activa ? 'var(--rosso)' : 'transparent' }}>
                <span className={styles.catEmoji}>{op.emoji}</span>
              </span>
              <span className={styles.catLabel} style={{ color: activa ? 'var(--burro)' : 'rgba(249,226,148,.7)' }}>{op.label}</span>
            </button>
          );
        })}
      </div>

      <p className={styles.hint}>{HINTS[categoria]}</p>

      {esInvitados ? (
        rankingInvitados.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyDisc}><Icon name="group" size={36} color="var(--rosso)" /></div>
            <div className={styles.emptyTitle}>Nadie cargó invitados</div>
            <div className={styles.emptyText}>Sumá invitados a una visita y aparecen acá.</div>
          </div>
        ) : (
          <div className={styles.list}>
            {rankingInvitados.map((inv, idx) => (
              <div key={inv.nombre} className={styles.row}>
                <div className={styles.pos} style={{ background: medalBg(idx), color: medalFg(idx) }}>{idx + 1}</div>
                <div className={styles.rowInfo}>
                  <div className={styles.rowNombre}>{inv.nombre}</div>
                  <div className={styles.rowSub}>{inv.visitas} {inv.visitas === 1 ? 'VISITA' : 'VISITAS'}</div>
                </div>
                <div className={styles.rowVal}>{inv.visitas}</div>
              </div>
            ))}
          </div>
        )
      ) : ranking.length === 0 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyDisc}><Icon name="local_cafe" size={36} color="var(--rosso)" /></div>
          <div className={styles.emptyTitle}>Todavía no hay datos</div>
          <div className={styles.emptyText}>Cargá visitas con esta categoría puntuada.</div>
        </div>
      ) : (
        <div className={styles.list}>
          {ranking.map((cafe, idx) => {
            const val = getRating(cafe);
            return (
              <div key={cafe.id} className={styles.row}>
                <div className={styles.pos} style={{ background: medalBg(idx), color: medalFg(idx) }}>{idx + 1}</div>
                <div className={styles.rowInfo}>
                  <div className={styles.rowNombre}>{cafe.nombre}</div>
                  <div className={styles.rowSub}>{cafe.direccion.split(',').pop()?.trim().toUpperCase()}</div>
                </div>
                <div className={styles.rowVal}>{esPrecio ? `$${val?.toLocaleString('es-AR')}` : val?.toFixed(1)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
