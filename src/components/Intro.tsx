import styles from './Intro.module.css';

interface IntroProps {
  onPlay: () => void;
}

export const Intro: React.FC<IntroProps> = ({ onPlay }) => {
  return (
    <div className={styles.intro}>
      <img src="/intro-bg.jpg" alt="" className={styles.bg} />
      <div className={styles.gradient} />
      <div className={styles.halo} />
      <div className={styles.content}>
        <div className={styles.hero}>
          <div className={styles.mark}>
            <img src="/logo-mark.png" alt="" className={styles.markImg} />
          </div>
          <h1 className={styles.title}>
            Progetto<br /><span>Flat White</span>
          </h1>
          <p className={styles.bajada}>Navigando su un fiume di caffè</p>
        </div>
        <div className={styles.cta}>
          <button className={styles.playBtn} onClick={onPlay} aria-label="Entrar">
            <span className={styles.triangle} />
          </button>
          <span className={styles.ctaLabel}>TOCÁ PARA<br />ENTRAR</span>
        </div>
      </div>
    </div>
  );
};
