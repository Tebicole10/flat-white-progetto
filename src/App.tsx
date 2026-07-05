import { useState, useRef, useEffect } from 'react';
import type { Cafe, Visita, Pendiente } from './types';
import { CafeProvider } from './context/CafeContext';
import { Intro } from './components/Intro';
import { Login } from './components/Login';
import { FormularioCafe } from './components/FormularioCafe';
import { Galeria } from './components/Galeria';
import { Mapa } from './components/Mapa';
import { Rankings } from './components/Rankings';
import { Bracket } from './components/Bracket';
import { ExportPDF } from './components/ExportPDF';
import { Sobre } from './components/Sobre';
import { Pendientes } from './components/Pendientes';
import { useCafeContext } from './context/CafeContext';
import { Plus, Volume2, VolumeX } from 'lucide-react';
import styles from './App.module.css';

type Pantalla = 'intro' | 'login' | 'app';
type Vista = 'sobre' | 'galeria' | 'rankings' | 'mapa' | 'bracket' | 'pendientes' | 'descargar';

interface FormState {
  show: boolean;
  cafeAEditar?: Cafe;
  cafeARevisitar?: Cafe;
  visitaAEditar?: { cafe: Cafe; visita: Visita };
  pendienteOrigen?: Pendiente;
}

function AppContent() {
  const [pantalla, setPantalla] = useState<Pantalla>('intro');
  const [vista, setVista] = useState<Vista>('sobre');
  const [form, setForm] = useState<FormState>({ show: false });
  const [muted, setMuted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { loading, deletePendiente } = useCafeContext();

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.35;
  }, []);

  const handlePlay = () => {
    audioRef.current?.play().catch(() => {});
    setTransitioning(true);
    setTimeout(() => { setPantalla('login'); setTransitioning(false); }, 600);
  };

  const handleLogin = () => {
    setTransitioning(true);
    setTimeout(() => { setPantalla('app'); setTransitioning(false); }, 600);
  };

  const toggleMute = () => {
    if (audioRef.current) { audioRef.current.muted = !muted; setMuted(!muted); }
  };

  const closeForm = () => setForm({ show: false });

  // Cuando se guarda un café que vino de un pendiente, borramos el pendiente
  const handleFormClose = async (pendienteId?: string) => {
    if (pendienteId) {
      await deletePendiente(pendienteId);
    }
    closeForm();
  };

  const NAV_ITEMS: { id: Vista; label: string }[] = [
    { id: 'sobre', label: 'Sobre el Proyecto' },
    { id: 'galeria', label: 'Guía Digital' },
    { id: 'rankings', label: 'Rankings' },
    { id: 'mapa', label: 'Mapa' },
    { id: 'bracket', label: 'Bracket' },
    { id: 'pendientes', label: 'Pendientes' },
    { id: 'descargar', label: 'Descargar' },
  ];

  return (
    <div className={styles.root}>
      <audio ref={audioRef} src="/background.mp3" loop />

      {pantalla === 'intro' && (
        <div className={`${styles.screen} ${transitioning ? styles.slideDown : ''}`}>
          <Intro onPlay={handlePlay} />
        </div>
      )}

      {pantalla === 'login' && (
        <div className={`${styles.screen} ${transitioning ? styles.slideDown : ''}`}>
          <Login onSuccess={handleLogin} />
        </div>
      )}

      {pantalla === 'app' && (
        <div className={`${styles.appWrap} ${transitioning ? styles.fadeIn : ''}`}
          style={{ backgroundImage: 'url(/app-bg.png)' }}>
          <div className={styles.appOverlay} />

          <header className={styles.header}>
            <h1 className={styles.title}>Progetto Flat White</h1>
            <div className={styles.headerRight}>
              <button className={styles.muteBtn} onClick={toggleMute}>
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button className={styles.addBtn} onClick={() => setForm({ show: true })}>
                <Plus size={16} /> Agregar café
              </button>
            </div>
          </header>

          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerIcon}>☕</span>
            <div className={styles.dividerLine} />
          </div>

          <nav className={styles.nav}>
            {NAV_ITEMS.map(({ id, label }) => (
              <button key={id}
                className={`${styles.navBtn} ${vista === id ? styles.navActive : ''}`}
                onClick={() => setVista(id)}>
                {label}
              </button>
            ))}
          </nav>

          <main className={styles.main}>
            {loading && (
              <div className={styles.loadingWrap}>
                <div className={styles.loadingDot} />
                <div className={styles.loadingDot} />
                <div className={styles.loadingDot} />
              </div>
            )}
            {!loading && (
              <>
                {vista === 'sobre' && <Sobre />}
                {vista === 'galeria' && (
                  <Galeria
                    onRevisitar={c => setForm({ show: true, cafeARevisitar: c })}
                    onEditarCafe={c => setForm({ show: true, cafeAEditar: c })}
                    onEditarVisita={(c, v) => setForm({ show: true, visitaAEditar: { cafe: c, visita: v } })}
                  />
                )}
                {vista === 'rankings' && <Rankings />}
                {vista === 'mapa' && <Mapa />}
                {vista === 'bracket' && <Bracket />}
                {vista === 'pendientes' && (
                  <Pendientes
                    onVisitar={p => {
                      setForm({ show: true, pendienteOrigen: p });
                      setVista('galeria');
                    }}
                  />
                )}
                {vista === 'descargar' && <ExportPDF />}
              </>
            )}
          </main>
        </div>
      )}

      {form.show && (
        <FormularioCafe
          cafeAEditar={form.cafeAEditar}
          cafeARevisitar={form.cafeARevisitar}
          visitaAEditar={form.visitaAEditar}
          pendienteOrigen={form.pendienteOrigen}
          onClose={() => handleFormClose(form.pendienteOrigen?.id)}
        />
      )}
    </div>
  );
}

export default function App() {
  return <CafeProvider><AppContent /></CafeProvider>;
}
