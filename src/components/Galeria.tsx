import { useEffect, useRef, useState } from 'react';
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

type Orden = 'fecha' | 'alfa' | 'manual';

const CATS = [
  { key: 'cafe' as const, label: 'CAFÉ' },
  { key: 'comestibles' as const, label: 'DELIZIE' },
  { key: 'vajilla' as const, label: 'VAJILLA' },
  { key: 'ambientacion' as const, label: 'AMBIENTACIÓN' },
  { key: 'servicio' as const, label: 'SERVICIO' },
];

const ROW_H = 88;
const ROW_GAP = 10;
const STEP = ROW_H + ROW_GAP;

const ordenarPorDefault = (cafes: Cafe[]) =>
  [...cafes].sort((a, b) => {
    const oa = a.orden ?? Number.MAX_SAFE_INTEGER;
    const ob = b.orden ?? Number.MAX_SAFE_INTEGER;
    if (oa !== ob) return oa - ob;
    return (a.createdAt || '').localeCompare(b.createdAt || '');
  });

export const Galeria: React.FC<GaleriaProps> = ({ onRevisitar, onEditarCafe, onEditarVisita, cafeAAbrir, onAbierto }) => {
  const { cafes, deleteCafe, reordenarCafes } = useCafeContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visitaSeleccionada, setVisitaSeleccionada] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [orden, setOrden] = useState<Orden>('fecha');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  // Estado del arrastre para reordenar a mano
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState(0);
  const [dragTo, setDragTo] = useState(0);
  const [dragDy, setDragDy] = useState(0);
  const dragState = useRef({ startY: 0, from: 0, len: 0, order: [] as string[] });

  useEffect(() => {
    if (cafeAAbrir) {
      setExpandedId(cafeAAbrir);
      onAbierto?.();
    }
  }, [cafeAAbrir, onAbierto]);

  const visitCount = cafes.reduce((acc, c) => acc + c.visitas.length, 0);
  const searching = search.trim().length > 0;
  const isManual = orden === 'manual';

  const baseList = ordenarPorDefault(cafes).filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()));
  const filtered = orden === 'alfa'
    ? [...baseList].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    : orden === 'fecha'
      ? [...baseList].sort((a, b) => {
          const fa = a.visitas.length ? [...a.visitas].sort((x, y) => y.fecha.localeCompare(x.fecha))[0].fecha : '';
          const fb = b.visitas.length ? [...b.visitas].sort((x, y) => y.fecha.localeCompare(x.fecha))[0].fecha : '';
          return fb.localeCompare(fa);
        })
      : baseList;

  const canReorder = isManual && !searching && filtered.length > 1;

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

  const cambiarOrden = (o: Orden) => {
    setOrden(o);
    if (o === 'manual') setExpandedId(null);
  };

  const handleDelete = (id: string) => {
    if (confirmDel === id) {
      deleteCafe(id);
      setConfirmDel(null);
    } else {
      setConfirmDel(id);
    }
  };

  // ── Reordenar a mano: arrastre con puntero ──
  const grab = (id: string, idx: number, e: React.PointerEvent) => {
    if (!canReorder) return;
    dragState.current = { startY: e.clientY, from: idx, len: filtered.length, order: filtered.map(c => c.id) };
    setDragId(id);
    setDragFrom(idx);
    setDragTo(idx);
    setDragDy(0);

    const onMove = (ev: PointerEvent) => {
      const dy = ev.clientY - dragState.current.startY;
      const to = Math.max(0, Math.min(dragState.current.len - 1, dragState.current.from + Math.round(dy / STEP)));
      setDragDy(dy);
      setDragTo(to);
    };
    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      const { from, order } = dragState.current;
      setDragTo(currentTo => {
        if (currentTo !== from) {
          const next = [...order];
          next.splice(currentTo, 0, next.splice(from, 1)[0]);
          reordenarCafes(next);
        }
        setDragId(null);
        setDragDy(0);
        return 0;
      });
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  const mover = (id: string, dir: -1 | 1) => {
    const idx = filtered.findIndex(c => c.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= filtered.length) return;
    const next = filtered.map(c => c.id);
    next.splice(j, 0, next.splice(idx, 1)[0]);
    reordenarCafes(next);
  };

  let manualNotice = '';
  if (isManual && searching) manualNotice = 'Borrá la búsqueda para poder reordenar.';
  else if (isManual && filtered.length === 1) manualNotice = 'Con un solo café no hay nada que reordenar.';
  else if (isManual && filtered.length === 0) manualNotice = 'No hay cafés cargados todavía.';
  else if (isManual) manualNotice = 'Arrastrá desde el grip, o usá las flechas. El orden se guarda solo.';

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
          <div className={styles.fotosGrid}>
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

      <div className={styles.px} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input type="text" placeholder="Buscar por nombre" value={search}
          onChange={e => setSearch(e.target.value)} className={styles.search} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`${styles.sortBtn} ${orden === 'fecha' ? styles.sortActive : ''}`} onClick={() => cambiarOrden('fecha')}>FECHA</button>
          <button className={`${styles.sortBtn} ${orden === 'alfa' ? styles.sortActive : ''}`} onClick={() => cambiarOrden('alfa')}>A–Z</button>
          <button className={`${styles.sortBtn} ${orden === 'manual' ? styles.sortActive : ''}`} onClick={() => cambiarOrden('manual')}>
            <Icon name="drag_indicator" size={15} color={orden === 'manual' ? 'var(--verde)' : 'rgba(249,226,148,.7)'} /> MANUAL
          </button>
        </div>
      </div>

      {manualNotice && (
        <div className={styles.px}>
          <div className={styles.notice}>
            <Icon name="info" size={19} color="var(--rosa)" />
            <span>{manualNotice}</span>
          </div>
        </div>
      )}

      {isManual ? (
        <div className={styles.px} style={{ display: 'flex', flexDirection: 'column', gap: ROW_GAP }}>
          {filtered.map((cafe, i) => {
            const dragging = dragId === cafe.id;
            let shift = 0;
            if (dragId && !dragging) {
              if (dragFrom < dragTo && i > dragFrom && i <= dragTo) shift = -STEP;
              if (dragFrom > dragTo && i >= dragTo && i < dragFrom) shift = STEP;
            }
            return (
              <div key={cafe.id} className={styles.manualRow}
                style={{
                  transform: dragging ? `translateY(${dragDy}px) scale(1.02)` : `translateY(${shift}px)`,
                  transition: dragging ? 'none' : 'transform .16s ease',
                  zIndex: dragging ? 5 : 1,
                  boxShadow: dragging ? '0 18px 40px rgba(0,0,0,.5)' : 'none',
                  opacity: dragging ? .97 : 1,
                  borderColor: dragging ? 'var(--burro)' : 'transparent',
                }}>
                <div className={styles.grip} style={{ cursor: canReorder ? 'grab' : 'default' }}
                  onPointerDown={e => grab(cafe.id, i, e)}>
                  <Icon name="drag_indicator" size={21} color={canReorder ? 'var(--burro)' : 'rgba(249,226,148,.3)'} />
                </div>
                {obtenerFotoPortada(cafe)
                  ? <img src={obtenerFotoPortada(cafe)!} alt="" className={styles.manualFoto} />
                  : <div className={styles.manualFoto} />}
                <div className={styles.manualInfo}>
                  <div className={styles.manualNombre}>{cafe.nombre}</div>
                  <div className={styles.manualDireccion}>{cafe.direccion}</div>
                </div>
                <div className={styles.manualScore}>{calcularPromedioCafe(cafe).toFixed(1)}</div>
                <div className={styles.manualArrows}>
                  <button disabled={!canReorder || i === 0} onClick={() => mover(cafe.id, -1)}>
                    <Icon name="keyboard_arrow_up" size={16} color="var(--burro)" />
                  </button>
                  <button disabled={!canReorder || i === filtered.length - 1} onClick={() => mover(cafe.id, 1)}>
                    <Icon name="keyboard_arrow_down" size={16} color="var(--burro)" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : filtered.length === 0 ? (
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
                  style={{
                    aspectRatio: isOpen ? '1 / 1' : '4 / 5',
                    backgroundImage: fotoPortada ? `url(${fotoPortada})` : undefined,
                  }}>
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
