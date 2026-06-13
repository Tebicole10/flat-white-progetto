import { useState } from 'react';
import styles from './Login.module.css';

interface LoginProps {
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Contraseña: "uno solo" sin mayúscula
    if (password.toLowerCase().trim() === 'uno solo') {
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 2000);
      setPassword('');
    }
  };

  return (
    <div className={styles.login}>
      <img src="/app-bg.png" alt="" className={styles.bg} />
      <div className={styles.overlay} />
      <div className={`${styles.card} ${shake ? styles.shake : ''}`}>
        <p className={styles.question}>¿Cuántos Militos hay?</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            placeholder=""
            autoFocus
          />
          {error && <p className={styles.error}>Intentá de nuevo...</p>}
        </form>
      </div>
    </div>
  );
};
