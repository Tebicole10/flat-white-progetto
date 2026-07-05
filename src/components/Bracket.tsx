import { useState, useEffect } from 'react';
import { useCafeContext } from '../context/CafeContext';
import { obtenerUltimos8, calcularPromedioCafe } from '../utils';
import type { Cafe } from '../types';
import styles from './Bracket.module.css';

type Duelo = { a: Cafe; b: Cafe };
type Ronda = Duelo[];

type FaseNombre = 'Cuartos de Final' | 'Semifinal' | 'Final';

const FASE_NOMBRES: FaseNombre[] = ['Cuartos de Final', 'Semifinal', 'Final'];

export const Bracket: React.FC = () => {
  const { cafes } = useCafeContext();
  const ultimos8 = obtenerUltimos8(cafes);

  const [rondas, setRondas] = useState<Ronda[]>([]);
  const [ganadoresPorRonda, setGanadoresPorRonda] = useState<(Cafe | null)[][]>([]);
  const [rondaActual, setRondaActual] = useState(0);
  const [dueloActual, setDueloActual] = useState(0);
  const [ganadores, setGanadores] = useState<Cafe[]>([]);
  const [campeon, setCampeon] = useState<Cafe | null>(null);
  const [confeti, setConfeti] = useState(false);

  const inicializar = () => {
    const shuffled = [...ultimos8].sort(() => Math.random() - 0.5);
    const ronda1: Ronda = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      ronda1.push({ a: shuffled[i], b: shuffled[i + 1] });
    }
    setRondas([ronda1]);
    // Inicializar slots vacíos para cada ronda: QF(4), SF(2), F(1)
    setGanadoresPorRonda([
      Array(4).fill(null),
      Array(2).fill(null),
      Array(1).fill(null),
    ]);
    setRondaActual(0);
    setDueloActual(0);
    setGanadores([]);
    setCampeon(null);
    setConfeti(false);
  };

  useEffect(() => {
    if (ultimos8.length >= 8) inicializar();
  }, [cafes]);

  const handleVoto = (ganador: Cafe) => {
    // Actualizar el árbol visual
    const newGPR = ganadoresPorRonda.map(r => [...r]);
    newGPR[rondaActual][dueloActual] = ganador;
    setGanadoresPorRonda(newGPR);

    const nuevosGanadores = [...ganadores, ganador];
    const duelos = rondas[rondaActual];
    const esFinalDuelo = dueloActual >= duelos.length - 1;

    if (esFinalDuelo) {
      if (nuevosGanadores.length === 1) {
        setCampeon(nuevosGanadores[0]);
        setConfeti(true);
        return;
      }
      const siguienteRonda: Ronda = [];
      for (let i = 0; i < nuevosGanadores.length; i += 2) {
        if (nuevosGanadores[i + 1]) {
          siguienteRonda.push({ a: nuevosGanadores[i], b: nuevosGanadores[i + 1] });
        }
      }
      if (siguienteRonda.length === 1 && siguienteRonda[0].a.id === siguienteRonda[0].b.id) {
        setCampeon(siguienteRonda[0].a);
        setConfeti(true);
        return;
      }
      setRondas([...rondas, siguienteRonda]);
      setRondaActual(rondaActual + 1);
      setDueloActual(0);
      setGanadores([]);
    } else {
      setDueloActual(dueloActual + 1);
      setGanadores(nuevosGanadores);
    }
  };

  // Pantalla: insuficiente cafés
  if (ultimos8.length < 8) {
    return (
      <div className={styles.bracket}>
        <div className={styles.insuficiente}>
          <div className={styles.trofeo}>🏆</div>
          <h3>El Bracket necesita más cafés</h3>
          <p>Llevan <strong>{ultimos8.length}</strong> de <strong>8</strong> cafés necesarios</p>
          <div className={styles.progreso}>
            <div className={styles.progresoBar} style={{ width: `${(ultimos8.length / 8) * 100}%` }} />
          </div>
          <p className={styles.hint}>¡Seguí explorando Buenos Aires! ☕</p>
        </div>
      </div>
    );
  }

  // Pantalla: campeón
  if (campeon) {
    return (
      <div className={styles.bracket}>
        <div className={`${styles.campeon} ${confeti ? styles.confeti : ''}`}>
          <div className={styles.trofeoGrande}>🏆</div>
          <p className={styles.campeonLabel}>El mejor café reciente es</p>
          <h2 className={styles.campeonNombre}>{campeon.nombre}</h2>
          {campeon.visitas[0]?.fotos[0] && (
            <img src={campeon.visitas[0].fotos[0]} alt={campeon.nombre} className={styles.campeonFoto} />
          )}
          <p className={styles.campeonRating}>★ {calcularPromedioCafe(campeon).toFixed(1)}/10</p>
          <button className={styles.reiniciarBtn} onClick={inicializar}>Jugar de nuevo</button>
        </div>
      </div>
    );
  }

  const duelo = rondas[rondaActual]?.[dueloActual];
  if (!duelo) return null;

  const faseNombre = FASE_NOMBRES[rondaActual] || 'Final';

  return (
    <div className={styles.bracket}>
      {/* Árbol de progreso */}
      <div className={styles.arbol}>
        {FASE_NOMBRES.slice(0, rondas.length > 0 ? 3 : 1).map((fase, faseIdx) => {
          const slots = faseIdx === 0 ? 4 : faseIdx === 1 ? 2 : 1;
          const completada = faseIdx < rondaActual;
          const activa = faseIdx === rondaActual;
          return (
            <div key={fase} className={`${styles.arbolColumna} ${activa ? styles.arbolActiva : ''} ${completada ? styles.arbolCompleta : ''}`}>
              <span className={styles.arbolFase}>{fase}</span>
              <div className={styles.arbolSlots}>
                {Array(slots).fill(null).map((_, slotIdx) => {
                  const ganador = ganadoresPorRonda[faseIdx]?.[slotIdx];
                  return (
                    <div key={slotIdx} className={`${styles.arbolSlot} ${ganador ? styles.arbolSlotOk : ''}`}>
                      {ganador ? (
                        <span className={styles.arbolNombre}>{ganador.nombre}</span>
                      ) : (
                        <span className={styles.arbolVacio}>?</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Duelo actual */}
      <div className={styles.dueloHeader}>
        <span className={styles.faseLabel}>{faseNombre}</span>
        <span className={styles.dueloLabel}>Duelo {dueloActual + 1} de {rondas[rondaActual].length}</span>
      </div>

      <p className={styles.instruccion}>¿Cuál preferís?</p>

      <div className={styles.duelo}>
        {[duelo.a, duelo.b].map((cafe, idx) => (
          <button key={cafe.id + idx} className={styles.cafetCard} onClick={() => handleVoto(cafe)}>
            <div className={styles.cardFoto}>
              {cafe.visitas[0]?.fotos[0]
                ? <img src={cafe.visitas[0].fotos[0]} alt={cafe.nombre} />
                : <div className={styles.cardFotoPlaceholder}>☕</div>}
            </div>
            <div className={styles.cardInfo}>
              <span className={styles.cardNombre}>{cafe.nombre}</span>
              <span className={styles.cardRating}>★ {calcularPromedioCafe(cafe).toFixed(1)}/10</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
