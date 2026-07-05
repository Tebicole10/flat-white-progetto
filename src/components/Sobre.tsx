import styles from './Sobre.module.css';

export const Sobre: React.FC = () => {

  const handleDescargar = () => {
    const link = document.createElement('a');
    link.href = '/troll.png';
    link.download = 'manifiesto-flat-white-progetto.png';
    link.click();
  };

  return (
    <div className={styles.sobre}>
      <div className={styles.contenido}>
        <h2 className={styles.titulo}>Sobre el Proyecto</h2>

        <div className={styles.texto}>
          <p>Flat White Progetto no nace como una declaración de principios, pero termina, inevitablemente, convirtiéndose en una.</p>

          <p>Su gestación no está dada por otra cosa que por el aproximamiento del 28 de junio. Frente a la escasez de ideas, cae la desesperación. Con la desesperación viene la derrota. Con la derrota se abandona el ego. Con el abandono del ego llega la iluminación.</p>

          <p>En verdad, Nati me dio la idea de hacer una experiencia y de ahí se me ocurrió esto.</p>

          <p>¿Qué es una cafetería? ¿Qué es sino la culminación de la espiritualidad del ser humano? El hombre va al café de su cuadra a leer un libro, a disfrutar un rato de su soledad, a gozar de los beneplácitos de una infusión, a intercambiar con seres amados sobre asuntos de variados tópicos. En definitiva, todo lo que sucede en la cafetería es bueno para el espíritu humano.</p>

          <p>Ni hablemos de lo bueno que está tomarse un café con un chipá en Tona después de haber entregado un laburo del terror y no dormir hace 72 horas.</p>

          <p>Si pienso en la amistad o en la hermandad, pienso en uno de los valores más altos, en las cosas más valiosas y espiritualmente transcendentes que puede tener una persona en su vida. Al igual que las cafeterías.</p>

          <p>Frente a esto, la elección se vuelve obvia. La llegada de Progetto Flat White se vuelve inexorable: una biblioteca donde almacenar las visitas a las más notables cafeterías que ofrece la mágica ciudad porteña, donde la amistad y la hermandad se encuentran.</p>

          <p>Esto, finalmente, es una guía de cafeterías llevada a cabo por las dos personas que conozco que más conocimiento poseen en el mundo: mi hermano Lauti y yo. Pero a su vez son los rieles que, espero, den continuidad a seguir compartiendo la vida con dos flat whites de por medio, ya sea en Buenos Aires, en Chicago o en Roma.</p>
        </div>

        <div className={styles.fotoWrap}>
          <img src="/sobre-foto.png" alt="Foco & Oficinista" className={styles.foto} />
          <p className={styles.fotoCaption}>Foco &amp; Oficinista</p>
        </div>

        <div className={styles.descargaWrap}>
          <button className={styles.descargaBtn} onClick={handleDescargar}>
            Descargar manifiesto
          </button>
        </div>
      </div>
    </div>
  );
};
