import React, { useState, useRef } from 'react';
import type { Cafe, Visita, Ratings, Pendiente } from '../types';
import { generateId } from '../utils';
import { useCafeContext } from '../context/CafeContext';
import styles from './FormularioCafe.module.css';

interface Props {
  cafeAEditar?: Cafe;
  cafeARevisitar?: Cafe;
  visitaAEditar?: { cafe: Cafe; visita: Visita };
  pendienteOrigen?: Pendiente;
  onClose: () => void;
}

const CATEGORIAS = [
  { key: 'cafe' as const, label: 'Café' },
  { key: 'comestibles' as const, label: 'Delizie' },
  { key: 'vajilla' as const, label: 'Vajilla' },
  { key: 'ambientacion' as const, label: 'Ambientación' },
  { key: 'servicio' as const, label: 'Servicio' },
];

const FOTO_SUGERENCIAS = 'Sacá: el cartel del lugar, el café con la comida, el ambiente, y los que fueron.';

const defaultRatings: Ratings = { cafe: 5, comestibles: 5, vajilla: 5, ambientacion: 5, servicio: 5 };

const fechaCorta = (iso: string): string => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y.slice(2)}`;
};

const parseGoogleMapsUrl = (url: string): { lat: number; lng: number } | null => {
  const dataMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (dataMatch) return { lat: parseFloat(dataMatch[1]), lng: parseFloat(dataMatch[2]) };
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  return null;
};

export const FormularioCafe: React.FC<Props> = ({ cafeAEditar, cafeARevisitar, visitaAEditar, pendienteOrigen, onClose }) => {
  const { addCafe, updateCafe, addVisita, updateVisita } = useCafeContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split('T')[0];

  const modoEditar = !!cafeAEditar;
  const modoRevisitar = !!cafeARevisitar && !cafeAEditar;
  const modoEditarVisita = !!visitaAEditar;

  const cafeBase = cafeAEditar || cafeARevisitar || visitaAEditar?.cafe;
  const visitaBase = visitaAEditar?.visita;

  const [nombre, setNombre] = useState(cafeBase?.nombre || pendienteOrigen?.nombre || '');
  const [direccion, setDireccion] = useState(cafeBase?.direccion || pendienteOrigen?.direccion || '');
  const [lat, setLat] = useState(cafeBase?.coordenadas.lat.toString() || '');
  const [lng, setLng] = useState(cafeBase?.coordenadas.lng.toString() || '');
  const [pegarError, setPegarError] = useState(false);

  const [fecha, setFecha] = useState(visitaBase?.fecha || today);
  const [ratings, setRatings] = useState<Ratings>(visitaBase?.ratings || defaultRatings);
  const [sinComida, setSinComida] = useState(visitaBase ? visitaBase.ratings.comestibles === null : false);
  const [notas, setNotas] = useState(visitaBase?.notas || '');
  const [comestibles, setComestibles] = useState(visitaBase?.comestibles || '');
  const [precio, setPrecio] = useState(visitaBase?.precio?.toString() || '');
  const [fotos, setFotos] = useState<string[]>(visitaBase?.fotos || []);
  const [invitados, setInvitados] = useState<string[]>(visitaBase?.invitados || []);
  const [invitadoInput, setInvitadoInput] = useState('');

  const handleFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setFotos(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const pegarLink = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const coords = parseGoogleMapsUrl(text);
      if (coords) {
        setLat(coords.lat.toString());
        setLng(coords.lng.toString());
        setPegarError(false);
      } else {
        setPegarError(true);
      }
    } catch {
      setPegarError(true);
    }
  };

  const agregarInvitado = () => {
    if (invitadoInput.trim()) {
      setInvitados([...invitados, invitadoInput.trim()]);
      setInvitadoInput('');
    }
  };

  const toggleSinComida = () => setSinComida(!sinComida);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !direccion) { alert('Completá nombre y dirección'); return; }

    if (modoEditar && cafeAEditar) {
      updateCafe(cafeAEditar.id, { ...cafeAEditar, nombre, direccion, coordenadas: { lat: Number(lat), lng: Number(lng) } });
      onClose();
      return;
    }

    const ratingsFinal: Ratings = { ...ratings, comestibles: sinComida ? null : ratings.comestibles };

    if (modoEditarVisita && visitaAEditar) {
      const updatedVisita: Visita = {
        ...visitaAEditar.visita, fecha, ratings: ratingsFinal, notas,
        comestibles: sinComida ? '' : comestibles, precio: Number(precio) || 0, fotos, invitados,
      };
      updateVisita(visitaAEditar.cafe.id, visitaAEditar.visita.id, updatedVisita);
      onClose();
      return;
    }

    const visita: Visita = {
      id: generateId(), fecha, ratings: ratingsFinal, notas,
      comestibles: sinComida ? '' : comestibles, precio: Number(precio) || 0, fotos, invitados,
    };

    if (modoRevisitar && cafeARevisitar) {
      addVisita(cafeARevisitar.id, visita);
    } else {
      if (!lat || !lng) { alert('Completá las coordenadas'); return; }
      addCafe({ id: generateId(), nombre, direccion, coordenadas: { lat: Number(lat), lng: Number(lng) }, visitas: [visita], createdAt: new Date().toISOString() });
    }
    onClose();
  };

  const titulo = modoEditar ? 'Editar café' :
    modoEditarVisita ? 'Editar visita' :
    modoRevisitar ? 'Revisitar' : 'Agregar café';

  const subtitulo = modoEditar ? 'SÓLO DATOS DEL LUGAR' :
    modoEditarVisita ? 'SÓLO ESTA VISITA' :
    modoRevisitar ? 'MISMO LUGAR · VISITA NUEVA' : 'CAFÉ NUEVO · PRIMERA VISITA';

  const cta = modoEditar ? 'Guardar cambios' :
    modoEditarVisita ? 'Guardar cambios' :
    modoRevisitar ? 'Guardar revisita' : 'Agregar café';

  const showPlace = !modoEditarVisita;
  const showScores = !modoEditar;
  const showDetails = !modoEditar;
  const showPhotos = !modoEditar;
  const showGuests = !modoEditar;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.sheetHeader}>
          <div>
            <h2 className={styles.sheetTitle}>{titulo}</h2>
            <p className={styles.sheetSubtitle}>{subtitulo}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} id="form-cafe">
          <div className={styles.body}>

            {showPlace && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>INFORMACIÓN DEL LUGAR</h3>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>NOMBRE</label>
                  <input className={styles.input} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="ej: Coffee Lab" required />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>DIRECCIÓN</label>
                  <input className={styles.input} value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="ej: Defensa 100, San Telmo" required />
                </div>

                {!modoRevisitar && (
                  <div className={styles.ubicacionPanel}>
                    <span className={styles.fieldLabel}>UBICACIÓN</span>
                    <button type="button" className={styles.pegarBtn} onClick={pegarLink}>Pegar link de Google Maps</button>
                    <div className={styles.coordsRow}>
                      <input className={styles.inputSmall} type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} placeholder="lat" />
                      <input className={styles.inputSmall} type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} placeholder="long" />
                    </div>
                    <p className={styles.hint}>
                      {pegarError
                        ? 'No pudimos leer coordenadas de eso. Escribilas a mano abajo.'
                        : 'Del link sacamos las coordenadas solas. También podés escribirlas a mano.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {showScores && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>PUNTUACIONES · SOBRE 10</h3>
                {CATEGORIAS.map(({ key, label }) => (
                  <div key={key} className={styles.scoreRow} style={{ opacity: key === 'comestibles' && sinComida ? .4 : 1 }}>
                    <div className={styles.scoreHead}>
                      <span className={styles.scoreLabel}>{label}</span>
                      <span className={styles.scoreVal}>{key === 'comestibles' && sinComida ? '—' : ratings[key]}</span>
                    </div>
                    <div className={styles.dots}>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <button key={n} type="button" disabled={key === 'comestibles' && sinComida}
                          className={`${styles.dot} ${(ratings[key] ?? 0) >= n ? (key === 'cafe' ? styles.dotOnRosso : styles.dotOn) : ''}`}
                          onClick={() => setRatings({ ...ratings, [key]: n })}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button type="button" className={styles.noFoodToggle} style={sinComida ? { background: 'var(--rosso)' } : undefined} onClick={toggleSinComida}>
                  <span className={styles.noFoodDot} style={sinComida ? { background: 'var(--burro)' } : undefined} />
                  <span className={styles.noFoodLabel}>No comimos nada en esta visita</span>
                  <span className={styles.noFoodAction}>{sinComida ? 'DESHACER' : 'MARCAR'}</span>
                </button>
              </div>
            )}

            {showDetails && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>DETALLES</h3>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>FECHA</label>
                    <div className={styles.dateWrap}>
                      <div className={styles.dateDisplay}>{fechaCorta(fecha)}</div>
                      <input
                        className={styles.dateInput}
                        type="date"
                        value={fecha}
                        onChange={e => setFecha(e.target.value)}
                        max={today}
                        aria-label="Fecha de visita"
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>ÍNDICE FLAT WHITE</label>
                    <div className={styles.priceInput}>
                      <span>$</span>
                      <input value={precio} onChange={e => setPrecio(e.target.value)} type="number" placeholder="1200" />
                    </div>
                  </div>
                </div>
                {!sinComida && (
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>COMESTIBLES</label>
                    <input className={styles.input} value={comestibles} onChange={e => setComestibles(e.target.value)} placeholder="Qué comieron (opcional)" />
                  </div>
                )}
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>NOTAS</label>
                  <textarea className={styles.textarea} value={notas} onChange={e => setNotas(e.target.value)} rows={3} placeholder="Lo que no entra en un número" />
                </div>
              </div>
            )}

            {showPhotos && (
              <div className={styles.section}>
                <div className={styles.sectionHeadRow}>
                  <h3 className={styles.sectionTitle}>FOTOS</h3>
                  <span className={styles.photoHint}>LAS 4 PRIMERAS VAN AL PDF</span>
                </div>
                <div className={styles.photoGrid}>
                  {fotos.map((f, i) => (
                    <div key={i} className={styles.photoSlot}>
                      <img src={f} alt="" />
                      <span className={styles.photoNum} style={i < 4 ? { background: 'var(--burro)', color: 'var(--verde)' } : undefined}>{i + 1}</span>
                      <button type="button" className={styles.photoDel} onClick={() => setFotos(fotos.filter((_, j) => j !== i))}>✕</button>
                    </div>
                  ))}
                  <button type="button" className={styles.photoAdd} onClick={() => fileInputRef.current?.click()}>+</button>
                </div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFotos} style={{ display: 'none' }} />
                <p className={styles.hint}>{FOTO_SUGERENCIAS}</p>
              </div>
            )}

            {showGuests && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>INVITADOS</h3>
                <div className={styles.guestRow}>
                  <input className={styles.input} value={invitadoInput}
                    onChange={e => setInvitadoInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarInvitado(); } }}
                    placeholder="Nombre" />
                  <button type="button" className={styles.guestAddBtn} onClick={agregarInvitado}>Agregar</button>
                </div>
                {invitados.length > 0 && (
                  <div className={styles.chips}>
                    {invitados.map((inv, i) => (
                      <span key={i} className={styles.chip}>
                        {inv}
                        <button type="button" onClick={() => setInvitados(invitados.filter((_, j) => j !== i))}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.submitBtn}>{cta}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
