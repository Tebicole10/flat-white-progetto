import { useState } from 'react';
import { useCafeContext } from '../context/CafeContext';
import { calcularPromedioCafe, calcularPromedioCategoria, calcularPrecioPromedio, calcularRankingInvitados } from '../utils';
import type { Cafe } from '../types';
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

const MEDALLAS = ['🥇', '🥈', '🥉'];
const COLORES_MEDALLA = ['#D4AF37', '#A8A9AD', '#CD7F32'];

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
    .filter(c => {
      if (c.visitas.length === 0) return false;
      const r = getRating(c);
      return r !== null;
    })
    .sort((a, b) => {
      const ra = getRating(a) ?? Infinity;
      const rb = getRating(b) ?? Infinity;
      return esPrecio ? ra - rb : rb - ra;
    });

  const rankingInvitados = esInvitados ? calcularRankingInvitados(cafes) : [];

  return (
    <div className={styles.rankings}>
      <div className={styles.header}>
        <h2 className={styles.title}>Rankings</h2>
        <div className={styles.selector}>
          {OPCIONES.map(op => (
            <button key={op.key}
              className={`${styles.opBtn} ${categoria === op.key ? styles.active : ''}`}
              onClick={() => setCategoria(op.key)}>
              <span>{op.emoji}</span>
              <span>{op.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* RANKING DE INVITADOS */}
      {esInvitados && (
        rankingInvitados.length === 0 ? (
          <div className={styles.empty}><p>Todavía no agregaste invitados a ninguna visita.</p></div>
        ) : (
          <div className={styles.list}>
            {rankingInvitados.map((inv, idx) => {
              const esMedalla = idx < 3;
              return (
                <div key={inv.nombre}
                  className={`${styles.item} ${esMedalla ? styles.medalla : ''}`}
                  style={esMedalla ? { '--medalla-color': COLORES_MEDALLA[idx] } as React.CSSProperties : {}}>
                  <div className={styles.posicion}>
                    {esMedalla ? <span className={styles.medallaEmoji}>{MEDALLAS[idx]}</span> : <span className={styles.numero}>{idx + 1}</span>}
                  </div>
                  <div className={styles.fotoPlaceholder} style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245,230,211,0.05)', fontSize: 16 }}>
                    🫂
                  </div>
                  <div className={styles.info}>
                    <span className={styles.nombre}>{inv.nombre}</span>
                  </div>
                  <div className={styles.ratingBox} style={esMedalla ? { color: COLORES_MEDALLA[idx] } : {}}>
                    <span className={styles.ratingNum}>{inv.visitas}</span>
                    <span className={styles.ratingMax}>{inv.visitas === 1 ? 'visita' : 'visitas'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* RANKINGS DE CAFÉS */}
      {!esInvitados && (
        ranking.length === 0 ? (
          <div className={styles.empty}>
            <p>{esPrecio ? 'Ningún café tiene precio cargado aún.' : 'No hay cafés para rankear aún. ¡Empezá a explorar! ☕'}</p>
          </div>
        ) : (
          <div className={styles.list}>
            {ranking.map((cafe, idx) => {
              const rating = getRating(cafe);
              const esMedalla = idx < 3;
              return (
                <div key={cafe.id}
                  className={`${styles.item} ${esMedalla ? styles.medalla : ''}`}
                  style={esMedalla ? { '--medalla-color': COLORES_MEDALLA[idx] } as React.CSSProperties : {}}>
                  <div className={styles.posicion}>
                    {esMedalla ? <span className={styles.medallaEmoji}>{MEDALLAS[idx]}</span> : <span className={styles.numero}>{idx + 1}</span>}
                  </div>
                  <div className={styles.foto}>
                    {cafe.visitas[0]?.fotos[0]
                      ? <img src={cafe.visitas[0].fotos[0]} alt={cafe.nombre} />
                      : <div className={styles.fotoPlaceholder}>☕</div>}
                  </div>
                  <div className={styles.info}>
                    <span className={styles.nombre}>{cafe.nombre}</span>
                    <span className={styles.direccion}>{cafe.direccion}</span>
                    {cafe.visitas.length > 1 && (
                      <span className={styles.visitas}>{cafe.visitas.length} visitas</span>
                    )}
                  </div>
                  <div className={styles.ratingBox} style={esMedalla ? { color: COLORES_MEDALLA[idx] } : {}}>
                    {esPrecio ? (
                      <>
                        <span className={styles.ratingNum}>${(rating ?? 0).toLocaleString('es-AR')}</span>
                        {esMedalla && idx === 0 && <span className={styles.mejorLabel}>mejor precio</span>}
                      </>
                    ) : (
                      <>
                        <span className={styles.ratingNum}>{(rating ?? 0).toFixed(1)}</span>
                        <span className={styles.ratingMax}>/10</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};
