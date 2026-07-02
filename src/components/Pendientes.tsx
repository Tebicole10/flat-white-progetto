import { useState } from 'react';
import type { Pendiente } from '../types';
import { useCafeContext } from '../context/CafeContext';
import { generateId } from '../utils';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import styles from './Pendientes.module.css';

interface PendientesProps {
  onVisitar: (pendiente: Pendiente) => void;
}

export const Pendientes: React.FC<PendientesProps> = ({ onVisitar }) => {
  const { pendientes, addPendiente, updatePendiente, deletePendiente } = useCafeContext();
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Pendiente | null>(null);

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
      await updatePendiente(editando.id, {
        ...editando,
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        nota: nota.trim(),
      });
    } else {
      await addPendiente({
        id: generateId(),
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        nota: nota.trim(),
        createdAt: new Date().toISOString(),
      });
    }
    cerrarForm();
  };

  const handleEliminar = async (id: string) => {
    if (confirm('¿Borrar este pendiente?')) {
      await deletePendiente(id);
    }
  };

  return (
    <div className={styles.pendientes}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.desc}>
            Tu lista de cafés que querés conocer. Cuando vayas a uno, tocá{' '}
            <strong>Ya lo visité</strong> y lo cargás a la guía.
          </p>
        </div>
        <button className={styles.addBtn} onClick={abrirFormNuevo}>
          <Plus size={16} /> Agregar café pendiente
        </button>
      </div>

      {pendientes.length === 0 ? (
        <div className={styles.empty}>
          <p>No hay pendientes aún. ¡Agregá el primer café que querés visitar!</p>
        </div>
      ) : (
        <div className={styles.lista}>
          {pendientes.map(p => (
            <div key={p.id} className={styles.card}>
              <div className={styles.cardBody}>
                <h3 className={styles.cardNombre}>{p.nombre}</h3>
                {p.direccion && <p className={styles.cardDireccion}>{p.direccion}</p>}
                {p.nota && <p className={styles.cardNota}>{p.nota}</p>}
              </div>
              <div className={styles.cardAcciones}>
                <button className={styles.visitarBtn} onClick={() => onVisitar(p)}>
                  <Check size={14} /> Ya lo visité
                </button>
                <button className={styles.editBtn} onClick={() => abrirFormEditar(p)}>
                  <Pencil size={14} />
                </button>
                <button className={styles.deleteBtn} onClick={() => handleEliminar(p.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal formulario */}
      {showForm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editando ? 'Editar pendiente' : 'Nuevo pendiente'}</h2>
              <button className={styles.closeBtn} onClick={cerrarForm}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label>NOMBRE DEL CAFÉ</label>
                <input
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="ej: La Esquina del Tango"
                  required
                  autoFocus
                />
              </div>
              <div className={styles.field}>
                <label>DIRECCIÓN</label>
                <input
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                  placeholder="ej: Av. Corrientes 1234"
                />
              </div>
              <div className={styles.field}>
                <label>NOTA <span className={styles.opcional}>(opcional)</span></label>
                <textarea
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                  placeholder="Por qué querés ir, quién te lo recomendó..."
                  rows={3}
                />
              </div>
              <button type="submit" className={styles.submitBtn}>
                <Check size={16} /> {editando ? 'Guardar cambios' : 'Agregar a la lista'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
