import { useState } from 'react';
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
import { Icon } from './components/Icon';
import { useCafeContext } from './context/CafeContext';
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

const TABS: { id: Vista; label: string; icon: string }[] = [
  { id: 'galeria', label: 'GUÍA', icon: 'menu_book' },
  { id: 'rankings', label: 'RANKINGS', icon: 'emoji_events' },
  { id: 'mapa', label: 'MAPA', icon: 'map' },
  { id: 'pendientes', label: 'PENDIENTES', icon: 'bookmark' },
];

const MENU_ITEMS: { id: Vista; t: string; meta: string; icon: string }[] = [
  { id: 'sobre', t: 'Sobre el proyecto', meta: 'MANIFIESTO', icon: 'auto_stories' },
  { id: 'bracket', t: 'Bracket', meta: 'TORNEO', icon: 'account_tree' },
  { id: 'descargar', t: 'Descargar guía', meta: 'PDF', icon: 'download' },
];

function AppContent() {
  const [pantalla, setPantalla] = useState<Pantalla>('intro');
  const [vista, setVista] = useState<Vista>('galeria');
  const [form, setForm] = useState<FormState>({ show: false });
  const [transitioning, setTransitioning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cafeAAbrir, setCafeAAbrir] = useState<string | null>(null);
  const { loading, deletePendiente } = useCafeContext();

  const handlePlay = () => {
    setTransitioning(true);
    setTimeout(() => { setPantalla('login'); setTransitioning(false); }, 600);
  };

  const handleLogin = () => {
    setTransitioning(true);
    setTimeout(() => { setPantalla('app'); setTransitioning(false); }, 600);
  };

  const closeForm = () => setForm({ show: false });

  const handleFormClose = async (pendienteId?: string) => {
    if (pendienteId) {
      await deletePendiente(pendienteId);
    }
    closeForm();
  };

  const irAGuia = () => { setVista('galeria'); setMenuOpen(false); };

  const irAMenuItem = (id: Vista) => { setVista(id); setMenuOpen(false); };

  const verDetalleEnGuia = (cafeId: string) => {
    setCafeAAbrir(cafeId);
    setVista('galeria');
  };

  return (
    <div className={styles.root}>
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
        <div className={`${styles.appWrap} ${transitioning ? styles.fadeIn : ''}`}>
          <header className={styles.header}>
            <div className={styles.headerRow}>
              <div className={styles.mark}>
                <img src="/logo-mark.png" alt="" className={styles.markImg} />
              </div>
              <div className={styles.wordmark}>FW<span>Progetto</span></div>
              <button className={styles.menuBtn} onClick={() => setMenuOpen(true)} aria-label="Menú">
                <span className={styles.menuLine} />
                <span className={styles.menuLine} />
                <span className={styles.menuLine} />
              </button>
            </div>
          </header>

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
                {vista === 'galeria' && (
                  <Galeria
                    cafeAAbrir={cafeAAbrir}
                    onAbierto={() => setCafeAAbrir(null)}
                    onRevisitar={c => setForm({ show: true, cafeARevisitar: c })}
                    onEditarCafe={c => setForm({ show: true, cafeAEditar: c })}
                    onEditarVisita={(c, v) => setForm({ show: true, visitaAEditar: { cafe: c, visita: v } })}
                  />
                )}
                {vista === 'rankings' && <Rankings />}
                {vista === 'mapa' && <Mapa onVerDetalle={verDetalleEnGuia} />}
                {vista === 'pendientes' && (
                  <Pendientes
                    onVisitar={p => {
                      setForm({ show: true, pendienteOrigen: p });
                      setVista('galeria');
                    }}
                  />
                )}
                {vista === 'sobre' && <Sobre onCerrar={irAGuia} />}
                {vista === 'bracket' && <Bracket onCerrar={irAGuia} />}
                {vista === 'descargar' && <ExportPDF onCerrar={irAGuia} />}
              </>
            )}
          </main>

          <nav className={styles.tabbar}>
            <div className={styles.tabbarGrid}>
              {TABS.map(t => {
                const active = vista === t.id;
                return (
                  <button key={t.id}
                    className={styles.tab}
                    onClick={() => setVista(t.id)}>
                    <span className={`${styles.tabDisc} ${active ? styles.tabDiscActive : ''}`}>
                      <Icon name={t.icon} size={20} color={active ? 'var(--burro)' : 'rgba(249,226,148,.72)'} />
                    </span>
                    <span className={styles.tabLabel} style={{ color: active ? 'var(--burro)' : 'rgba(249,226,148,.72)' }}>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {vista === 'galeria' && (
            <button className={styles.fab} onClick={() => setForm({ show: true })} aria-label="Agregar café">
              <span className={styles.fabCross} />
            </button>
          )}

          {menuOpen && (
            <>
              <div className={styles.backdrop} onClick={() => setMenuOpen(false)} />
              <div className={styles.sheet}>
                <div className={styles.sheetHandle} />
                {MENU_ITEMS.map(m => (
                  <button key={m.id} className={styles.menuItem} onClick={() => irAMenuItem(m.id)}>
                    <span className={styles.menuItemDisc}>
                      <Icon name={m.icon} size={21} color="var(--rosso)" />
                    </span>
                    <span className={styles.menuItemTitle}>{m.t}</span>
                    <span className={styles.menuItemMeta}>{m.meta}</span>
                  </button>
                ))}
              </div>
            </>
          )}
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
