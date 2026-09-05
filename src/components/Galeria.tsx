import { useEffect, useState } from 'react';
import type { Cafe, Visita } from '../types';
import { calcularPromedioCafe, calcularRatingVisita, formatFecha } from '../utils';
import { useCafeContext } from '../context/CafeContext';
import { Icon } from './Icon';
import styles from './Galeria.module.css';

interface GaleriaProps {
  onRevisitar: (cafe: Cafe) => void;
  onEditarCafe: (cafe: Cafe) => void;
  onEditarVisita: (cafe: Cafe, visita: Visita) => void;
  cafeAAbrir?: string | null;
  onAbierto?: () => void;
}

type Orden = 'fecha' | 'alfa';

const CATS = [
  { key: 'cafe' as const, label: 'CAFÉ' },
  { key: 'comestibles' as const, label: 'DELIZIE' },
  { key: 'vajilla' as const, label: 'VAJILLA' },
  { key: 'ambientacion' as const, label: 'AMBIENTACIÓN' },
  { key: 'servicio' as const, label: 'SERVICIO' },
];

export const Galeria: React.FC<GaleriaProps> = ({ onRevisitar, onEditarCafe, onEditarVisita, cafeAAbrir, onAbierto }) => {
  const { cafes, deleteCafe } = useCafeContext();
  const [destacadoOpen, setDestacadoOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visitaSeleccionada, setVisitaSeleccionada] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [orden, setOrden] = useState<Orden>('fecha');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  useEffect(() => {
    if (cafeAAbrir) {
      setExpandedId(cafeAAbrir);
      onAbierto?.();
    }
  }, [cafeAAbrir, onAbierto]);

  const cafesConVisitas = cafes.filter(c => c.visitas.length > 0);
  const visitCount = cafesConVisitas.reduce((acc, c) => acc + c.visitas.length, 0);

  const cafeDestacado = cafesConVisitas.length > 0
    ? [...cafesConVisitas].sort((a, b) => calcularPromedioCafe(b) - calcularPromedioCafe(a))[0]
    : null;

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

  const toggleCard = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
    setConfirmDel(null);
  };

  const handleDelete = (id: string) => {
    if (confirmDel === id) {
      deleteCafe(id);
      setConfirmDel(null);
    } else {
      setConfirmDel(id);
    }
  };

  const renderDetalle = (cafe: Cafe) => {
    const visitaActiva = getVisitaActiva(cafe);
    if (!visitaActiva) return null;
    const visitasOrdenadas = [...cafe.visitas].sort((a, b) => b.fecha.localeCompare(a.fecha));
    const borrando = confirmDel === cafe.id;

    return (
      <div className={styles.detalle}>
        {cafe.visitas.length > 1 && (
          <div className={styles.bloque}>
            <span className={styles.miniLabel}>VISITAS</span>
            <div className={styles.visitTabs}>
              {visitasOrdenadas.map((v, idx) => {
                const activa = visitaActiva.id === v.id;
                return (
                  <button key={v.id}
                    className={`${styles.visitTab} ${activa ? styles.visitTabActive : ''}`}
                    onClick={e => { e.stopPropagation(); setVisitaSeleccionada({ ...visitaSeleccionada, [cafe.id]: v.id }); }}>
                    {formatFecha(v.fecha).split(' de ').slice(0, 2).join(' ')}
                    {idx === 0 && <span className={styles.ultimaTag}> · ÚLTIMA</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {visitaActiva.fotos.length > 0 && (
          <div className={styles.fotosCarrusel}>
            {visitaActiva.fotos.map((f, i) => (
              <img key={i} src={f} alt="" className={styles.fotoMini}
                onClick={e => { e.stopPropagation(); setLightbox(f); }} />
            ))}
          </div>
        )}

        <div className={styles.ratings}>
          {CATS.map(({ key, label }) => {
            const val = visitaActiva.ratings[key];
            const esCafe = key === 'cafe';
            if (val === null) {
              return (
                <div key={key} className={styles.ratingRow}>
                  <div className={styles.ratingHead}>
                    <span className={styles.ratingLabel}>{label}</span>
                    <span className={styles.ratingVal}>NO COMIMOS</span>
                  </div>
                  <div className={styles.ratingTrack}><div className={styles.ratingFill} style={{ width: 0 }} /></div>
                </div>
              );
            }
            return (
              <div key={key} className={styles.ratingRow}>
                <div className={styles.ratingHead}>
                  <span className={styles.ratingLabel}>{label}</span>
                  <span className={styles.ratingVal} style={{ color: esCafe ? 'var(--rosso)' : 'var(--burro)' }}>{val}</span>
                </div>
                <div className={styles.ratingTrack}>
                  <div className={styles.ratingFill} style={{ width: `${val * 10}%`, background: esCafe ? 'var(--rosso)' : 'var(--burro)' }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.total}>
          <span>TOTAL DE LA VISITA</span>
          <span className={styles.totalVal}>{calcularRatingVisita(visitaActiva.ratings).toFixed(1)}</span>
        </div>

        <div className={styles.dataTable}>
          <div className={styles.dataRow}><span className={styles.dataKey}>FECHA</span><span className={styles.dataVal}>{formatFecha(visitaActiva.fecha)}</span></div>
          <div className={styles.dataRow}><span className={styles.dataKey}>ÍNDICE FLAT WHITE</span><span className={styles.dataVal}>{visitaActiva.precio > 0 ? `$${visitaActiva.precio.toLocaleString('es-AR')}` : 'Sin cargar'}</span></div>
          <div className={styles.dataRow}><span className={styles.dataKey}>COMESTIBLES</span><span className={styles.dataVal}>{visitaActiva.comestibles || 'No comimos nada'}</span></div>
          {visitaActiva.notas && (
            <div className={styles.dataRow}><span className={styles.dataKey}>NOTAS</span><span className={styles.dataVal}>{visitaActiva.notas}</span></div>
          )}
        </div>

        {visitaActiva.invitados.length > 0 && (
          <div className={styles.bloque}>
            <span className={styles.miniLabel}>INVITADOS</span>
            <div className={styles.chips}>
              {visitaActiva.invitados.map((inv, i) => <span key={i} className={styles.chip}>{inv}</span>)}
            </div>
          </div>
        )}

        <div className={styles.acciones}>
          <button className={styles.outlineBtn} onClick={e => { e.stopPropagation(); onEditarCafe(cafe); }}>Editar café</button>
          <button className={styles.outlineBtn} onClick={e => { e.stopPropagation(); onEditarVisita(cafe, visitaActiva); }}>Editar visita</button>
          <button className={styles.burroBtn} onClick={e => { e.stopPropagation(); onRevisitar(cafe); }}>Revisitar</button>
          <button
            className={borrando ? styles.delBtnConfirm : styles.delBtn}
            onClick={e => { e.stopPropagation(); handleDelete(cafe.id); }}
          >
            {borrando ? '¿Seguro?' : 'Borrar'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.galeria}>
      <div className={styles.header}>
        <h1 className={styles.title}>Guía</h1>
        <div className={styles.count}>{cafes.length} CAFÉS<br />{visitCount} VISITAS</div>
      </div>

      {cafeDestacado && (
        <div className={styles.px}>
          <div className={styles.hero} onClick={() => setDestacadoOpen(!destacadoOpen)}
            style={obtenerFotoPortada(cafeDestacado) ? { backgroundImage: `url(${obtenerFotoPortada(cafeDestacado)})` } : undefined}>
            <div className={styles.heroGradient} />
            <div className={styles.heroTop}>
              <span>DESTACADO</span>
              <span>{formatFecha([...cafeDestacado.visitas].sort((a, b) => b.fecha.localeCompare(a.fecha))[0].fecha)}</span>
            </div>
            <div className={styles.heroBadge}><Icon name="emoji_events" size={23} color="var(--burro)" /></div>
            <div className={styles.heroBottom}>
              <div className={styles.heroInfo}>
                <div className={styles.heroNombre}>{cafeDestacado.nombre}</div>
                <div className={styles.heroDireccion}>{cafeDestacado.direccion}</div>
              </div>
              <div className={styles.heroScore}>{calcularPromedioCafe(cafeDestacado).toFixed(1)}</div>
            </div>
          </div>
          {destacadoOpen && <div className={styles.cardBody}>{renderDetalle(cafeDestacado)}</div>}
        </div>
      )}

      <div className={styles.px} style={{ display: 'flex', gap: 8 }}>
        <input type="text" placeholder="Buscar por nombre" value={search}
          onChange={e => setSearch(e.target.value)} className={styles.search} />
        <button className={`${styles.sortBtn} ${orden === 'fecha' ? styles.sortActive : ''}`} onClick={() => setOrden('fecha')}>FECHA</button>
        <button className={`${styles.sortBtn} ${orden === 'alfa' ? styles.sortActive : ''}`} onClick={() => setOrden('alfa')}>A–Z</button>
      </div>

      {filtered.length === 0 && !cafeDestacado ? (
        <div className={styles.empty}>
          <div className={styles.emptyDisc}><Icon name="local_cafe" size={40} color="var(--rosso)" /></div>
          <div className={styles.emptyTitle}>Todavía no hay<br />ningún café</div>
          <div className={styles.emptyText}>Tocá el + y cargá el primero. Foto, puntajes y notas.</div>
        </div>
      ) : (
        <div className={styles.px} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(cafe => {
            const promedio = calcularPromedioCafe(cafe);
            const isOpen = expandedId === cafe.id;
            const fotoPortada = obtenerFotoPortada(cafe);
            return (
              <div key={cafe.id} className={styles.card}>
                <div className={styles.cardHeader} onClick={() => toggleCard(cafe.id)}
                  style={fotoPortada ? { backgroundImage: `url(${fotoPortada})`, height: isOpen ? 170 : 214 } : { height: isOpen ? 170 : 214 }}>
                  <div className={styles.cardGradient} />
                  <div className={styles.cardTop}>
                    <span>{formatFecha([...cafe.visitas].sort((a, b) => b.fecha.localeCompare(a.fecha))[0]?.fecha || cafe.createdAt)}</span>
                    {cafe.visitas.length >= 2 && <span>{cafe.visitas.length} VISITAS</span>}
                  </div>
                  <div className={styles.cardBottom}>
                    <div className={styles.cardInfo}>
                      <div className={styles.cardNombre}>{cafe.nombre}</div>
                      <div className={styles.cardDireccion}>{cafe.direccion}</div>
                    </div>
                    <div className={styles.cardScore} style={isOpen ? { background: 'var(--rosso)', color: 'var(--burro)' } : undefined}>{promedio.toFixed(1)}</div>
                  </div>
                </div>
                {isOpen && <div className={styles.cardBody}>{renderDetalle(cafe)}</div>}
              </div>
            );
          })}
        </div>
      )}

      {lightbox && (
        <div className={styles.lightboxOverlay} onClick={() => setLightbox(null)}>
          <span className={styles.lightboxClose}>CERRAR ✕</span>
          <img src={lightbox} alt="" className={styles.lightboxImg} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};
