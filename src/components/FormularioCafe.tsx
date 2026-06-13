import React, { useState, useRef } from 'react';
import type { Cafe, Visita, Ratings } from '../types';
import { generateId } from '../utils';
import { useCafeContext } from '../context/CafeContext';
import { X, Plus, Trash2 } from 'lucide-react';
import styles from './FormularioCafe.module.css';

interface Props {
  cafeAEditar?: Cafe;           // editar info del café
  cafeARevisitar?: Cafe;        // agregar nueva visita
  visitaAEditar?: { cafe: Cafe; visita: Visita }; // editar visita existente
  onClose: () => void;
}

const CATEGORIAS = [
  { key: 'cafe' as const, label: '☕ Café' },
  { key: 'comestibles' as const, label: '🥐 Delizie' },
  { key: 'vajilla' as const, label: '🍽️ Vajilla' },
  { key: 'ambientacion' as const, label: '🎨 Ambientación' },
  { key: 'servicio' as const, label: '👥 Servicio' },
];

const defaultRatings: Ratings = { cafe: 5, comestibles: 5, vajilla: 5, ambientacion: 5, servicio: 5 };

export const FormularioCafe: React.FC<Props> = ({ cafeAEditar, cafeARevisitar, visitaAEditar, onClose }) => {
  const { addCafe, updateCafe, addVisita, updateVisita } = useCafeContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split('T')[0];

  // Determinar modo
  const modoEditar = !!cafeAEditar;
  const modoRevisitar = !!cafeARevisitar && !cafeAEditar;
  const modoEditarVisita = !!visitaAEditar;

  const cafeBase = cafeAEditar || cafeARevisitar || visitaAEditar?.cafe;
  const visitaBase = visitaAEditar?.visita;

  // Estado del café
  const [nombre, setNombre] = useState(cafeBase?.nombre || '');
  const [direccion, setDireccion] = useState(cafeBase?.direccion || '');
  const [lat, setLat] = useState(cafeBase?.coordenadas.lat.toString() || '');
  const [lng, setLng] = useState(cafeBase?.coordenadas.lng.toString() || '');

  // Estado de la visita
  const [fecha, setFecha] = useState(visitaBase?.fecha || today);
  const [ratings, setRatings] = useState<Ratings>(visitaBase?.ratings || defaultRatings);
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

  const agregarInvitado = () => {
    if (invitadoInput.trim()) {
      setInvitados([...invitados, invitadoInput.trim()]);
      setInvitadoInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !direccion) { alert('Completá nombre y dirección'); return; }

    if (modoEditar && cafeAEditar) {
      // Solo actualizar datos del café, sin tocar visitas
      updateCafe(cafeAEditar.id, {
        ...cafeAEditar,
        nombre,
        direccion,
        coordenadas: { lat: Number(lat), lng: Number(lng) },
      });
      onClose();
      return;
    }

    if (modoEditarVisita && visitaAEditar) {
      // Actualizar visita existente
      const updatedVisita: Visita = {
        ...visitaAEditar.visita,
        fecha,
        ratings,
        notas,
        comestibles,
        precio: Number(precio) || 0,
        fotos,
        invitados,
      };
      updateVisita(visitaAEditar.cafe.id, visitaAEditar.visita.id, updatedVisita);
      onClose();
      return;
    }

    // Nueva visita (nuevo café o revisita)
    const visita: Visita = {
      id: generateId(),
      fecha,
      ratings,
      notas,
      comestibles,
      precio: Number(precio) || 0,
      fotos,
      invitados,
    };

    if (modoRevisitar && cafeARevisitar) {
      addVisita(cafeARevisitar.id, visita);
    } else {
      if (!lat || !lng) { alert('Completá las coordenadas'); return; }
      addCafe({
        id: generateId(),
        nombre,
        direccion,
        coordenadas: { lat: Number(lat), lng: Number(lng) },
        visitas: [visita],
        createdAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  const titulo = modoEditar ? `Editar: ${nombre}` :
    modoEditarVisita ? `Editar visita: ${visitaAEditar!.cafe.nombre}` :
    modoRevisitar ? `Revisitar: ${cafeBase?.nombre}` : 'Agregar café';

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{titulo}</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={22} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Info del café — solo si no es editar visita */}
          {!modoEditarVisita && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Información</h3>
              <div className={styles.field}>
                <label>Nombre</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="ej: Coffee Lab" required />
              </div>
              <div className={styles.field}>
                <label>Dirección</label>
                <input value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="ej: Defensa 100, San Telmo" required />
              </div>
              {/* Coords solo si es nuevo café */}
              {!modoRevisitar && (
                <>
                  <div className={styles.coordsRow}>
                    <div className={styles.field}>
                      <label>Latitud</label>
                      <input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} placeholder="-34.6037" />
                    </div>
                    <div className={styles.field}>
                      <label>Longitud</label>
                      <input type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} placeholder="-58.3816" />
                    </div>
                  </div>
                  <p className={styles.hint}>
                    Tip: buscá en <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a>, click derecho y copiá las coordenadas.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Si es solo editar café, terminamos acá */}
          {!modoEditar && (
            <>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Puntuaciones <span className={styles.scale}>(sobre 10)</span></h3>
                {CATEGORIAS.map(({ key, label }) => (
                  <div key={key} className={styles.ratingRow}>
                    <span className={styles.ratingLabel}>{label}</span>
                    <div className={styles.numPicker}>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <button
                          key={n}
                          type="button"
                          className={`${styles.numBtn} ${ratings[key] === n ? styles.numBtnOn : ''} ${ratings[key] >= n ? styles.numBtnFill : ''}`}
                          onClick={() => setRatings({ ...ratings, [key]: n })}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <span className={styles.numVal}>{ratings[key]}</span>
                  </div>
                ))}
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Detalles</h3>
                <div className={styles.field}>
                  <label>Fecha de visita</label>
                  <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} max={today} />
                </div>
                <div className={styles.field}>
                  <label>¿Qué comimos? <span className={styles.opcional}>(opcional)</span></label>
                  <input value={comestibles} onChange={e => setComestibles(e.target.value)} placeholder="Medialunas, croissant..." />
                </div>
                <div className={styles.field}>
                  <label>Índice Flat White <span className={styles.opcional}>(precio del café)</span></label>
                  <div className={styles.priceRow}>
                    <span>$</span>
                    <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="1200" />
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Notas <span className={styles.opcional}>(opcional)</span></label>
                  <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3} placeholder="Impresiones, recomendaciones..." />
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Fotos</h3>
                <button type="button" className={styles.uploadBtn} onClick={() => fileInputRef.current?.click()}>
                  + Agregar fotos
                </button>
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFotos} style={{ display: 'none' }} />
                {fotos.length > 0 && (
                  <div className={styles.fotosGrid}>
                    {fotos.map((f, i) => (
                      <div key={i} className={styles.fotoItem}>
                        <img src={f} alt="" />
                        {i === 0 && <span className={styles.portadaBadge}>Portada</span>}
                        <button type="button" className={styles.deleteFoto} onClick={() => setFotos(fotos.filter((_, j) => j !== i))}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Invitados <span className={styles.opcional}>(opcional)</span></h3>
                <div className={styles.invRow}>
                  <input
                    value={invitadoInput}
                    onChange={e => setInvitadoInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarInvitado(); } }}
                    placeholder="Nombre"
                  />
                  <button type="button" className={styles.addBtn} onClick={agregarInvitado}><Plus size={16} /></button>
                </div>
                {invitados.length > 0 && (
                  <div className={styles.tags}>
                    {invitados.map((inv, i) => (
                      <span key={i} className={styles.tag}>
                        {inv}
                        <button type="button" onClick={() => setInvitados(invitados.filter((_, j) => j !== i))}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className={styles.formFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.submitBtn}>
              {modoEditar ? 'Guardar cambios' :
               modoEditarVisita ? 'Guardar visita' :
               modoRevisitar ? 'Guardar revisita' : 'Agregar café'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
