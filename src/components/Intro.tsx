import { useRef } from 'react';
import styles from './Intro.module.css';

interface IntroProps {
  onPlay: () => void;
}

export const Intro: React.FC<IntroProps> = ({ onPlay }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.35;
      audioRef.current.play().catch(() => {});
    }
    onPlay();
  };

  return (
    <div className={styles.intro}>
      <audio ref={audioRef} src="/background.mp3" loop preload="auto" />
      <img src="/intro-bg.png" alt="Progetto Flat White" className={styles.bg} />
      <div className={styles.overlay} />
      <button className={styles.playBtn} onClick={handlePlay} aria-label="Entrar">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="31" stroke="rgba(245,230,211,0.5)" strokeWidth="1"/>
          <polygon points="26,20 46,32 26,44" fill="#f5e6d3"/>
        </svg>
      </button>
    </div>
  );
};
