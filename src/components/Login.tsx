import { useState } from 'react';
import { Icon } from './Icon';
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
      <div className={`${styles.card} ${shake ? styles.shake : ''}`}>
        <Icon name="lock" size={22} className={styles.lock} />
        <p className={styles.question}>¿Cuántos Militos hay?</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            placeholder="· · · · · · · ·"
            autoFocus
          />
          {error && <p className={styles.error}>Intentá de nuevo…</p>}
          <button type="submit" className={styles.submitBtn}>Entrar</button>
        </form>
      </div>
    </div>
  );
};
