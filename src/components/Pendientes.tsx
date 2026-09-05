import { useState } from 'react';
import type { Pendiente } from '../types';
import { useCafeContext } from '../context/CafeContext';
import { generateId } from '../utils';
import { Icon } from './Icon';
import styles from './Pendientes.module.css';

interface PendientesProps {
  onVisitar: (pendiente: Pendiente) => void;
}

export const Pendientes: React.FC<PendientesProps> = ({ onVisitar }) => {
  const { pendientes, addPendiente, updatePendiente, deletePendiente } = useCafeContext();
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Pendiente | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [nota, setNota] = useState('');

  const abrirFormNuevo = () => {
    setEditando(null);
    setNombre('');
    setDireccion('');
    setNota('');
    setShowForm(true);
  };

  const abrirFormEditar = (p: Pendiente) => {
    setEditando(p);
    setNombre(p.nombre);
    setDireccion(p.direccion);
    setNota(p.nota);
    setShowForm(true);
  };

  const cerrarForm = () => {
    setShowForm(false);
    setEditando(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    if (editando) {
      await updatePendiente(editando.id, { ...editando, nombre: nombre.trim(), direccion: direccion.trim(), nota: nota.trim() });
    } else {
      await addPendiente({ id: generateId(), nombre: nombre.trim(), direccion: direccion.trim(), nota: nota.trim(), createdAt: new Date().toISOString() });
    }
    cerrarForm();
  };

  const handleEliminar = async (id: string) => {
    if (confirmDel === id) {
      await deletePendiente(id);
      setConfirmDel(null);
    } else {
      setConfirmDel(id);
    }
  };

  return (
    <div className={styles.pendientes}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pendientes</h1>
        <div className={styles.count}>{pendientes.length}<br />POR VISITAR</div>
      </div>

      <button className={styles.addBtn} onClick={abrirFormNuevo}>+ Agregar pendiente</button>

      {pendientes.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyDisc}><Icon name="bookmark_add" size={36} color="var(--rosso)" /></div>
          <div className={styles.emptyTitle}>La lista está vacía</div>
          <div className={styles.emptyText}>Agregá el primer lugar que quieran visitar.</div>
        </div>
      ) : (
        <div className={styles.lista}>
          {pendientes.map(p => {
            const borrando = confirmDel === p.id;
            return (
              <div key={p.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardDisc}><Icon name="bookmark" size={21} color="var(--rosso)" /></div>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardNombre}>{p.nombre}</div>
                    {p.direccion && <div className={styles.cardDireccion}>{p.direccion}</div>}
                  </div>
                </div>
                {p.nota && <p className={styles.cardNota}>{p.nota}</p>}
                <div className={styles.acciones}>
                  <button className={styles.visitarBtn} onClick={() => onVisitar(p)}>Ya lo visité</button>
                  <button className={styles.editBtn} onClick={() => abrirFormEditar(p)} aria-label="Editar">
                    <span className={styles.pencil} />
                  </button>
                  <button className={borrando ? styles.delBtnConfirm : styles.delBtn} onClick={() => handleEliminar(p.id)}>
                    {borrando ? 'SÍ' : '✕'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <>
          <div className={styles.backdrop} onClick={cerrarForm} />
          <div className={styles.sheet}>
            <div className={styles.sheetHandle} />
            <h2 className={styles.sheetTitle}>{editando ? 'Editar pendiente' : 'Nuevo pendiente'}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>NOMBRE DEL CAFÉ</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="ej: La Esquina del Tango" required autoFocus className={styles.input} />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>DIRECCIÓN</label>
                <input value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="ej: Av. Corrientes 1234" className={styles.input} />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>NOTA <span className={styles.opcional}>(OPCIONAL)</span></label>
                <textarea value={nota} onChange={e => setNota(e.target.value)} placeholder="Por qué querés ir, quién te lo recomendó..." rows={3} className={styles.textarea} />
              </div>
              <div className={styles.formFooter}>
                <button type="button" className={styles.cancelBtn} onClick={cerrarForm}>Cancelar</button>
                <button type="submit" className={styles.submitBtn}>{editando ? 'Guardar cambios' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
