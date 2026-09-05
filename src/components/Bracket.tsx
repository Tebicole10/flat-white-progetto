import { useState, useEffect, useMemo } from 'react';
import { useCafeContext } from '../context/CafeContext';
import { obtenerUltimos8, calcularPromedioCafe } from '../utils';
import type { Cafe } from '../types';
import { Icon } from './Icon';
import styles from './Bracket.module.css';

type Duelo = { a: Cafe; b: Cafe };
type Ronda = Duelo[];

const FASE_NOMBRES = ['CUARTOS', 'SEMIFINAL', 'FINAL'];
const FASE_STAGE = ['CUARTOS DE FINAL', 'SEMIFINAL', 'FINALE'];

interface BracketProps {
  onCerrar: () => void;
}

const barrio = (direccion: string) => direccion.split(',').pop()?.trim().toUpperCase() || '';

const CONFETTI_COLORS = ['var(--burro)', 'var(--rosa)', 'var(--verde)'];

export const Bracket: React.FC<BracketProps> = ({ onCerrar }) => {
  const { cafes } = useCafeContext();
  const ultimos8 = obtenerUltimos8(cafes);

  const [rondas, setRondas] = useState<Ronda[]>([]);
  const [ganadoresPorRonda, setGanadoresPorRonda] = useState<(Cafe | null)[][]>([]);
  const [rondaActual, setRondaActual] = useState(0);
  const [dueloActual, setDueloActual] = useState(0);
  const [ganadores, setGanadores] = useState<Cafe[]>([]);
  const [campeon, setCampeon] = useState<Cafe | null>(null);

  const inicializar = () => {
    const shuffled = [...ultimos8].sort(() => Math.random() - 0.5);
    const ronda1: Ronda = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      ronda1.push({ a: shuffled[i], b: shuffled[i + 1] });
    }
    setRondas([ronda1]);
    setGanadoresPorRonda([Array(4).fill(null), Array(2).fill(null), Array(1).fill(null)]);
    setRondaActual(0);
    setDueloActual(0);
    setGanadores([]);
    setCampeon(null);
  };

  useEffect(() => {
    if (ultimos8.length >= 8) inicializar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafes]);

  const confetti = useMemo(() => Array.from({ length: 26 }, (_, i) => ({
    x: `${Math.round(Math.random() * 100)}%`,
    s: `${6 + Math.round(Math.random() * 3)}px`,
    r: i % 2 === 0 ? '50%' : '2px',
    bg: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    d: `${(i * 0.09).toFixed(2)}s`,
  })), [campeon]);

  const handleVoto = (ganador: Cafe) => {
    const newGPR = ganadoresPorRonda.map(r => [...r]);
    newGPR[rondaActual][dueloActual] = ganador;
    setGanadoresPorRonda(newGPR);

    const nuevosGanadores = [...ganadores, ganador];
    const duelos = rondas[rondaActual];
    const esFinalDuelo = dueloActual >= duelos.length - 1;

    if (esFinalDuelo) {
      if (nuevosGanadores.length === 1) {
        setCampeon(nuevosGanadores[0]);
        return;
      }
      const siguienteRonda: Ronda = [];
      for (let i = 0; i < nuevosGanadores.length; i += 2) {
        if (nuevosGanadores[i + 1]) siguienteRonda.push({ a: nuevosGanadores[i], b: nuevosGanadores[i + 1] });
      }
      if (siguienteRonda.length === 1 && siguienteRonda[0].a.id === siguienteRonda[0].b.id) {
        setCampeon(siguienteRonda[0].a);
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

  return (
    <div className={styles.bracket}>
      <div className={styles.header}>
        <h1 className={styles.title}>Bracket</h1>
        <button className={styles.cerrar} onClick={onCerrar}>CERRAR ✕</button>
      </div>

      {ultimos8.length < 8 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyDisc}><Icon name="account_tree" size={36} color="var(--rosso)" /></div>
          <div className={styles.emptyTitle}>Faltan cafés</div>
          <div className={styles.emptyText}>Llevan {ultimos8.length} de 8 cafés necesarios para armar el cuadro.</div>
        </div>
      ) : campeon ? (
        <div className={styles.champion}>
          {confetti.map((k, i) => (
            <div key={i} className={styles.confPiece} style={{ left: k.x, width: k.s, height: k.s, borderRadius: k.r, background: k.bg, animationDelay: k.d }} />
          ))}
          <span className={styles.championLabel}>CAMPEÓN</span>
          <div className={styles.championNombre}>{campeon.nombre}</div>
          <div className={styles.championDireccion}>{campeon.direccion}</div>
          <button className={styles.reiniciarBtn} onClick={inicializar}>Sortear de nuevo</button>
        </div>
      ) : (
        <>
          <div className={styles.stage}>{FASE_STAGE[rondaActual]} · DUELO {dueloActual + 1} DE {rondas[rondaActual]?.length || 1}</div>
          {rondas[rondaActual]?.[dueloActual] && (
            <div className={styles.duelo}>
              {[rondas[rondaActual][dueloActual].a, rondas[rondaActual][dueloActual].b].map((cafe, idx) => (
                <button key={cafe.id + idx} className={styles.duelCard}
                  style={cafe.visitas[0]?.fotos[0] ? { backgroundImage: `url(${cafe.visitas[0].fotos[0]})` } : undefined}
                  onClick={() => handleVoto(cafe)}>
                  <div className={styles.duelGradient} />
                  <div className={styles.duelSeed}>PROMEDIO {calcularPromedioCafe(cafe).toFixed(1)} · {barrio(cafe.direccion)}</div>
                  <div className={styles.duelBottom}>
                    <span className={styles.duelNombre}>{cafe.nombre}</span>
                    <span className={styles.duelElegir}>Elegir</span>
                  </div>
                </button>
              ))}
              <div className={styles.vs}>VS</div>
            </div>
          )}
        </>
      )}

      <div className={styles.cuadroLabel}>CUADRO</div>
      <div className={styles.cuadro}>
        {FASE_NOMBRES.map((fase, faseIdx) => {
          const slots = faseIdx === 0 ? 4 : faseIdx === 1 ? 2 : 1;
          return (
            <div key={fase} className={styles.cuadroCol}>
              <span className={styles.cuadroColLabel}>{fase}</span>
              {Array(slots).fill(null).map((_, slotIdx) => {
                const ganador = ganadoresPorRonda[faseIdx]?.[slotIdx];
                return (
                  <div key={slotIdx} className={ganador ? styles.slotOk : styles.slot}>
                    {ganador ? ganador.nombre : '—'}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
