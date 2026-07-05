import { useState } from 'react';
import type { Cafe, Visita } from '../types';
import { calcularPromedioCafe, calcularRatingVisita, formatFecha } from '../utils';
import { useCafeContext } from '../context/CafeContext';
import { ChevronDown, Trash2, RefreshCw, Pencil, X } from 'lucide-react';
import styles from './Galeria.module.css';

interface GaleriaProps {
  onRevisitar: (cafe: Cafe) => void;
  onEditarCafe: (cafe: Cafe) => void;
  onEditarVisita: (cafe: Cafe, visita: Visita) => void;
}

type Orden = 'fecha' | 'alfa';

const CATS = [
  { key: 'cafe' as const, label: '☕ Café' },
  { key: 'comestibles' as const, label: '🥐 Delizie' },
  { key: 'vajilla' as const, label: '🍽️ Vajilla' },
  { key: 'ambientacion' as const, label: '🎨 Ambiente' },
  { key: 'servicio' as const, label: '👥 Servicio' },
];

export const Galeria: React.FC<GaleriaProps> = ({ onRevisitar, onEditarCafe, onEditarVisita }) => {
  const { cafes, deleteCafe } = useCafeContext();
  const [destacadoOpen, setDestacadoOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visitaSeleccionada, setVisitaSeleccionada] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [orden, setOrden] = useState<Orden>('fecha');
  const [lightbox, setLightbox] = useState<string | null>(null);

  const cafesConVisitas = cafes.filter(c => c.visitas.length > 0);

  const cafeDestacado = cafesConVisitas.length > 0
    ? [...cafesConVisitas].sort((a, b) => calcularPromedioCafe(b) - calcularPromedioCafe(a))[0]
    : null;

  // El destacado no se repite en la lista de abajo
  const filtered = cafes
    .filter(c => c.id !== cafeDestacado?.id)
    .filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (orden === 'alfa') return a.nombre.localeCompare(b.nombre);
      const fa = a.visitas.length ? [...a.visitas].sort((x, y) => y.fecha.localeCompare(x.fecha))[0].fecha : '';
      const fb = b.visitas.length ? [...b.visitas].sort((x, y) => y.fecha.localeCompare(x.fecha))[0].fecha : '';
      return fb.localeCompare(fa);
    });

  const getVisitaActiva = (cafe: Cafe) => {
    const selectedId = visitaSeleccionada[cafe.id];
    return cafe.visitas.find(v => v.id === selectedId)
      || [...cafe.visitas].sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  };

  const obtenerFotoPortada = (cafe: Cafe): string | null => {
    for (const v of [...cafe.visitas].sort((a, b) => b.fecha.localeCompare(a.fecha))) {
      if (v.fotos.length > 0) return v.fotos[0];
    }
    return null;
  };

  const renderDetalle = (cafe: Cafe) => {
    const visitaActiva = getVisitaActiva(cafe);
    if (!visitaActiva) return null;
    const visitasOrdenadas = [...cafe.visitas].sort((a, b) => b.fecha.localeCompare(a.fecha));

    return (
      <div className={styles.detalle}>
        {cafe.visitas.length > 1 && (
          <div className={styles.visitaSelector}>
            {visitasOrdenadas.map((v, idx) => (
              <button key={v.id}
                className={`${styles.visitaBtn} ${visitaActiva.id === v.id ? styles.visitaBtnActive : ''}`}
                onClick={e => { e.stopPropagation(); setVisitaSeleccionada({ ...visitaSeleccionada, [cafe.id]: v.id }); }}>
                {formatFecha(v.fecha)}
                {idx === 0 && <span className={styles.visitaBtnBadge}>última</span>}
              </button>
            ))}
          </div>
        )}

        {visitaActiva.fotos.length > 0 && (
          <div className={styles.fotos}>
            {visitaActiva.fotos.map((f, i) => (
              <img
                key={i}
                src={f}
                alt=""
                className={styles.foto}
                onClick={e => { e.stopPropagation(); setLightbox(f); }}
              />
            ))}
          </div>
        )}

        <div className={styles.ratingsGrid}>
          {CATS.map(({ key, label }) => {
            const val = visitaActiva.ratings[key];
            if (val === null) {
              return (
                <div key={key} className={styles.ratingRowEmpty}>
                  <span className={styles.ratingLabel}>{label}</span>
                  <span className={styles.ratingEmptyTag}>No comimos nada esta visita</span>
                </div>
              );
            }
            return (
              <div key={key} className={styles.ratingRow}>
                <span className={styles.ratingLabel}>{label}</span>
                <div className={styles.ratingBar}>
                  <div className={styles.ratingBarFill} style={{ width: `${val * 10}%` }} />
                </div>
                <span className={styles.ratingVal}>{val}/10</span>
              </div>
            );
          })}
          <div className={styles.ratingTotal}>
            <span>Rating visita</span>
            <span className={styles.ratingTotalVal}>{calcularRatingVisita(visitaActiva.ratings).toFixed(1)}/10</span>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Fecha</span>
            <span className={styles.infoVal}>{formatFecha(visitaActiva.fecha)}</span>
          </div>
          {visitaActiva.precio > 0 && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Índice Flat White</span>
              <span className={styles.infoVal}>${visitaActiva.precio.toLocaleString('es-AR')}</span>
            </div>
          )}
          {visitaActiva.comestibles && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Comimos</span>
              <span className={styles.infoVal}>{visitaActiva.comestibles}</span>
            </div>
          )}
          {visitaActiva.invitados.length > 0 && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Invitados</span>
              <span className={styles.infoVal}>{visitaActiva.invitados.join(', ')}</span>
            </div>
          )}
          {visitaActiva.notas && (
            <div className={`${styles.infoItem} ${styles.infoFull}`}>
              <span className={styles.infoLabel}>Notas</span>
              <span className={styles.infoVal}>{visitaActiva.notas}</span>
            </div>
          )}
        </div>

        <div className={styles.acciones}>
          <button className={styles.editarCafeBtn} onClick={e => { e.stopPropagation(); onEditarCafe(cafe); }}>
            <Pencil size={13} /> Editar café
          </button>
          <button className={styles.editarVisitaBtn} onClick={e => { e.stopPropagation(); onEditarVisita(cafe, visitaActiva); }}>
            <Pencil size={13} /> Editar visita
          </button>
          <button className={styles.revisitBtn} onClick={e => { e.stopPropagation(); onRevisitar(cafe); }}>
            <RefreshCw size={13} /> Revisitar
          </button>
          <button className={styles.deleteBtn} onClick={e => { e.stopPropagation(); if (confirm('¿Borrar este café?')) deleteCafe(cafe.id); }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.galeria}>

      {/* CAFÉ DESTACADO — estado de apertura independiente */}
      {cafeDestacado && (
        <div className={styles.destacadoWrap}>
          <div
            className={styles.destacado}
            onClick={() => setDestacadoOpen(!destacadoOpen)}
            style={obtenerFotoPortada(cafeDestacado)
              ? { backgroundImage: `url(${obtenerFotoPortada(cafeDestacado)})` }
              : undefined}
          >
            <div className={styles.destacadoOverlay} />
            <div className={styles.destacadoContent}>
              <span className={styles.destacadoLabel}>✦ Mejor puntuado</span>
              <h2 className={styles.destacadoNombre}>{cafeDestacado.nombre}</h2>
              <div className={styles.destacadoMeta}>
                <span className={styles.destacadoRating}>{calcularPromedioCafe(cafeDestacado).toFixed(1)}/10</span>
                <span className={styles.destacadoDireccion}>{cafeDestacado.direccion}</span>
              </div>
            </div>
            <ChevronDown size={20} className={`${styles.destacadoChevron} ${destacadoOpen ? styles.chevronOpen : ''}`} />
          </div>
          {destacadoOpen && renderDetalle(cafeDestacado)}
        </div>
      )}

      {/* TOPBAR */}
      <div className={styles.topbar}>
        <input type="text" placeholder="Buscar..." value={search}
          onChange={e => setSearch(e.target.value)} className={styles.search} />
        <div className={styles.ordenBtns}>
          <button className={`${styles.ordenBtn} ${orden === 'fecha' ? styles.active : ''}`} onClick={() => setOrden('fecha')}>Fecha</button>
          <button className={`${styles.ordenBtn} ${orden === 'alfa' ? styles.active : ''}`} onClick={() => setOrden('alfa')}>A–Z</button>
        </div>
      </div>

      {filtered.length === 0 && !cafeDestacado ? (
        <div className={styles.empty}><p>No hay cafeterías aún. ¡Agregá la primera! ☕</p></div>
      ) : (
        <div className={styles.lista}>
          {filtered.map(cafe => {
            const promedio = calcularPromedioCafe(cafe);
            const isOpen = expandedId === cafe.id;
            const fotoPortada = obtenerFotoPortada(cafe);

            return (
              <div key={cafe.id} className={`${styles.card} ${isOpen ? styles.cardOpen : ''}`}>
                <div
                  className={styles.cardHeader}
                  onClick={() => setExpandedId(isOpen ? null : cafe.id)}
                  style={fotoPortada ? { backgroundImage: `url(${fotoPortada})` } : undefined}
                >
                  {fotoPortada && <div className={styles.cardHeaderOverlay} />}
                  <div className={styles.cardHeaderContent}>
                    <div className={styles.cardMeta}>
                      <h3 className={styles.cardNombre}>{cafe.nombre}</h3>
                      <p className={styles.cardDireccion}>{cafe.direccion}</p>
                      {cafe.visitas.length >= 2 && (
                        <span className={styles.badge}>{cafe.visitas.length} visitas</span>
                      )}
                    </div>
                    <div className={styles.cardRight}>
                      <span className={styles.promedioNum}>{promedio.toFixed(1)}</span>
                      <span className={styles.promedioMax}>/10</span>
                      <ChevronDown size={18} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
                    </div>
                  </div>
                </div>

                {isOpen && renderDetalle(cafe)}
              </div>
            );
          })}
        </div>
      )}

      {/* LIGHTBOX */}
      {lightbox && (
        <div className={styles.lightboxOverlay} onClick={() => setLightbox(null)}>
          <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>
            <X size={24} />
          </button>
          <img src={lightbox} alt="" className={styles.lightboxImg} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};
