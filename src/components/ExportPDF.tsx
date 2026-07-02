import { useState } from 'react';
import { useCafeContext } from '../context/CafeContext';
import { calcularPromedioCafe, calcularPromedioCategoria, calcularPrecioPromedio, formatFecha } from '../utils';
import { Download, Loader } from 'lucide-react';
import jsPDF from 'jspdf';
import styles from './ExportPDF.module.css';

const BG     = [19, 10, 4]    as const;
const ACCENT = [196, 98, 26]  as const;
const GOLD   = [212, 175, 55] as const;
const CREAM  = [245, 230, 211] as const;
const FAINT  = [120, 90, 65]  as const;
const BORDER = [40, 22, 10]   as const;
const DARK2  = [28, 14, 5]    as const;

const fetchImageAsDataURL = (src: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext('2d')!.drawImage(img, 0, 0);
      resolve(c.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => reject(new Error(`No se pudo cargar: ${src}`));
    img.src = src + '?v=' + Date.now();
  });

const drawImageContain = async (
  pdf: jsPDF, src: string,
  x: number, y: number, w: number, h: number
): Promise<void> => {
  const img = new Image();
  await new Promise<void>((res, rej) => {
    img.onload = () => res(); img.onerror = () => rej(); img.src = src;
  });
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  c.getContext('2d')!.drawImage(img, 0, 0);
  const b64 = c.toDataURL('image/jpeg', 0.82);
  const sR = img.naturalWidth / img.naturalHeight;
  const tR = w / h;
  let dw = w, dh = h, dx = x, dy = y;
  if (sR > tR) { dh = w / sR; dy = y + (h - dh) / 2; }
  else         { dw = h * sR; dx = x + (w - dw) / 2; }
  pdf.addImage(b64, 'JPEG', dx, dy, dw, dh);
};

// Dibuja la zona de fotos (igual para ambos lados)
const drawFotos = async (
  pdf: jsPDF, fotos: string[],
  RX: number, RY: number, RW: number, RH: number
) => {
  const GAP = 3;
  const imgs = fotos.slice(0, 4);

  pdf.setFillColor(...DARK2);
  pdf.roundedRect(RX, RY, RW, RH, 2, 2, 'F');

  if (imgs.length === 0) {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9);
    pdf.setTextColor(...BORDER);
    pdf.text('sin fotos', RX + RW / 2, RY + RH / 2, { align: 'center' });
  } else if (imgs.length === 1) {
    try { await drawImageContain(pdf, imgs[0], RX + 4, RY + 4, RW - 8, RH - 8); } catch { /* skip */ }
  } else if (imgs.length === 2) {
    const SZ = (RW - GAP * 3) / 2;
    const yOff = RY + (RH - SZ) / 2;
    for (let f = 0; f < 2; f++) {
      const fx = RX + GAP + f * (SZ + GAP);
      pdf.setFillColor(35, 18, 7); pdf.roundedRect(fx, yOff, SZ, SZ, 1.5, 1.5, 'F');
      try { await drawImageContain(pdf, imgs[f], fx, yOff, SZ, SZ); } catch { /* skip */ }
    }
  } else if (imgs.length === 3) {
    const topH = RH * 0.56; const botH = RH - topH - GAP - 6;
    const botW = (RW - GAP * 3) / 2;
    pdf.setFillColor(35, 18, 7); pdf.roundedRect(RX + GAP, RY + GAP, RW - GAP * 2, topH, 1.5, 1.5, 'F');
    try { await drawImageContain(pdf, imgs[0], RX + GAP, RY + GAP, RW - GAP * 2, topH); } catch { /* skip */ }
    for (let f = 1; f <= 2; f++) {
      const fx = RX + GAP + (f - 1) * (botW + GAP);
      const fy = RY + GAP + topH + GAP;
      pdf.setFillColor(35, 18, 7); pdf.roundedRect(fx, fy, botW, botH, 1.5, 1.5, 'F');
      try { await drawImageContain(pdf, imgs[f], fx, fy, botW, botH); } catch { /* skip */ }
    }
  } else {
    const cW = (RW - GAP * 3) / 2; const cH = (RH - GAP * 3) / 2;
    for (let f = 0; f < 4 && f < imgs.length; f++) {
      const col = f % 2; const row = Math.floor(f / 2);
      const fx = RX + GAP + col * (cW + GAP); const fy = RY + GAP + row * (cH + GAP);
      pdf.setFillColor(35, 18, 7); pdf.roundedRect(fx, fy, cW, cH, 1.5, 1.5, 'F');
      try { await drawImageContain(pdf, imgs[f], fx, fy, cW, cH); } catch { /* skip */ }
    }
  }
};

export const ExportPDF: React.FC = () => {
  const { cafes } = useCafeContext();
  const [loading, setLoading] = useState(false);
  const [progreso, setProgreso] = useState('');

  const generatePDF = async () => {
    if (cafes.length === 0) { alert('No hay cafés para exportar'); return; }
    setLoading(true);

    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const W = 297, H = 210;

      // ── PORTADA ─────────────────────────────────────────
      setProgreso('Armando portada...');
      try {
        const b64 = await fetchImageAsDataURL('/pdf-portada.jpg');
        pdf.addImage(b64, 'JPEG', 0, 0, W, H);
      } catch {
        pdf.setFillColor(...BG); pdf.rect(0, 0, W, H, 'F');
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(40);
        pdf.setTextColor(...CREAM);
        pdf.text('Progetto Flat White', W / 2, H / 2, { align: 'center' });
      }

      // ── ÍNDICE ───────────────────────────────────────────
      setProgreso('Generando indice...');
      pdf.addPage();
      pdf.setFillColor(...BG); pdf.rect(0, 0, W, H, 'F');
      pdf.setFillColor(...ACCENT); pdf.rect(0, 0, 2.5, H, 'F');

      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(34);
      pdf.setTextColor(...CREAM); pdf.text('INDICE', 14, 26);

      const fechaStr = new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9);
      pdf.setTextColor(...FAINT); pdf.text(fechaStr, W - 14, 26, { align: 'right' });

      pdf.setDrawColor(...ACCENT); pdf.setLineWidth(0.35);
      pdf.line(14, 30, W - 14, 30);

      const cafesAlfa = [...cafes]
        .filter(c => c.visitas.length > 0)
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

      const COL1 = 14, COL2 = W / 2 + 6, colW = W / 2 - 20;
      const ROW_H = 14, START_Y = 42;

      cafesAlfa.forEach((cafe, idx) => {
        const col = idx % 2 === 0 ? COL1 : COL2;
        const row = Math.floor(idx / 2);
        const y = START_Y + row * ROW_H;
        if (y > H - 16) return;

        const num = String(idx + 1).padStart(2, '0');
        const rating = calcularPromedioCafe(cafe).toFixed(1);
        const nVisitas = cafe.visitas.length;
        const nombreCorto = cafe.nombre.length > 26 ? cafe.nombre.slice(0, 24) + '...' : cafe.nombre;

        if (row % 2 === 0) {
          pdf.setFillColor(25, 13, 5);
          pdf.rect(col - 2, y - 6, colW + 4, ROW_H, 'F');
        }

        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9);
        pdf.setTextColor(...ACCENT); pdf.text(num, col, y);

        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10);
        pdf.setTextColor(...CREAM); pdf.text(nombreCorto, col + 9, y);

        const textEndX = col + 9 + pdf.getTextWidth(nombreCorto) + 2;
        const ratingStartX = col + colW - 22;
        if (textEndX < ratingStartX - 2) {
          pdf.setDrawColor(...BORDER); pdf.setLineWidth(0.15);
          pdf.setLineDashPattern([0.4, 1.6], 0);
          pdf.line(textEndX, y - 1.5, ratingStartX - 2, y - 1.5);
          pdf.setLineDashPattern([], 0);
        }

        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10);
        pdf.setTextColor(...GOLD); pdf.text(`${rating}/10`, ratingStartX, y);

        if (nVisitas > 1) {
          pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5);
          pdf.setTextColor(...FAINT); pdf.text(`${nVisitas}v`, ratingStartX + 17, y);
        }
      });

      pdf.setDrawColor(...BORDER); pdf.setLineWidth(0.2);
      pdf.line(14, H - 14, W - 14, H - 14);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8);
      pdf.setTextColor(...FAINT);
      pdf.text(`${cafesAlfa.length} cafeterias - Progetto Flat White`, 14, H - 8);

      // ── PÁGINAS POR CAFÉ ─────────────────────────────────
      for (let i = 0; i < cafesAlfa.length; i++) {
        const cafe = cafesAlfa[i];
        setProgreso(`Cafe ${i + 1} de ${cafesAlfa.length}: ${cafe.nombre}`);
        pdf.addPage();

        // Layout alterno: impar = info izq / foto der | par = foto izq / info der
        const esImpar = i % 2 === 0; // 0-indexed

        pdf.setFillColor(...BG); pdf.rect(0, 0, W, H, 'F');

        const promedio = calcularPromedioCafe(cafe);
        const nVisitas = cafe.visitas.length;
        const precio = calcularPrecioPromedio(cafe);
        const ultimaVisita = [...cafe.visitas].sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
        const todasFotos = cafe.visitas.flatMap(v => v.fotos);

        // Número grande de fondo (elemento editorial)
        const numStr = String(i + 1).padStart(2, '0');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(180);
        pdf.setTextColor(30, 15, 6); // muy tenue, casi invisible
        pdf.text(numStr, W / 2, H + 10, { align: 'center' });

        // Franja lateral — cambia de lado según el layout
        pdf.setFillColor(...ACCENT);
        if (esImpar) {
          pdf.rect(0, 0, 2.5, H, 'F');
        } else {
          pdf.rect(W - 2.5, 0, 2.5, H, 'F');
        }

        // Definir columnas según layout
        const INFO_X  = esImpar ? 10  : 152;
        const INFO_W  = 130;
        const FOTO_X  = esImpar ? 148 : 6;
        const FOTO_W  = W - 148 - 8;
        const FOTO_H  = H - 14;

        // ── FOTOS ────────────────────────────────────────
        await drawFotos(pdf, todasFotos, FOTO_X, 7, FOTO_W, FOTO_H);

        // ── INFO ─────────────────────────────────────────
        // Número pequeño del café
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9);
        pdf.setTextColor(...ACCENT);
        pdf.text(numStr, INFO_X, 14);

        // NOMBRE GRANDE — elemento editorial central
        pdf.setFont('helvetica', 'bold');
        const nombreLines = pdf.splitTextToSize(cafe.nombre.toUpperCase(), INFO_W - 4);

        // Tamaño dinámico según largo del nombre
        const fontSize = cafe.nombre.length > 18 ? 22 : cafe.nombre.length > 12 ? 28 : 34;
        pdf.setFontSize(fontSize);
        pdf.setTextColor(...CREAM);
        pdf.text(nombreLines.slice(0, 3), INFO_X, 26);

        let curY = 26 + Math.min(nombreLines.length, 3) * (fontSize * 0.38);

        // Dirección
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5);
        pdf.setTextColor(...FAINT);
        pdf.text(cafe.direccion, INFO_X, curY + 4);
        curY += 10;

        // Línea
        pdf.setDrawColor(...BORDER); pdf.setLineWidth(0.25);
        pdf.line(INFO_X, curY, INFO_X + INFO_W, curY);
        curY += 7;

        // Rating general grande
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(36);
        pdf.setTextColor(...GOLD);
        pdf.text(promedio.toFixed(1), INFO_X, curY + 7);
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10);
        pdf.setTextColor(...FAINT);
        pdf.text('/10', INFO_X + 24, curY + 7);
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5);
        pdf.setTextColor(...FAINT);
        const visitaLabel = nVisitas === 1 ? 'promedio de 1 visita' : `promedio de ${nVisitas} visitas`;
        pdf.text(visitaLabel, INFO_X, curY + 13);
        curY += 20;

        // Barras de categorías
        const CATS = [
          { key: 'cafe' as const,         label: 'Cafe' },
          { key: 'comestibles' as const,   label: 'Delizie' },
          { key: 'ambientacion' as const,  label: 'Ambiente' },
          { key: 'servicio' as const,      label: 'Servicio' },
          { key: 'vajilla' as const,       label: 'Vajilla' },
        ];
        const BAR_W = INFO_W - 4;

        CATS.forEach(({ key, label }) => {
          const val = calcularPromedioCategoria(cafe, key);

          pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8);
          pdf.setTextColor(...FAINT); pdf.text(label, INFO_X, curY);

          if (val === null) {
            pdf.setFont('helvetica', 'italic'); pdf.setFontSize(7);
            pdf.setTextColor(...FAINT);
            pdf.text('sin datos', INFO_X + BAR_W - 2, curY, { align: 'right' });
            curY += 10;
            return;
          }

          const fill = (val / 10) * BAR_W;
          pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8);
          pdf.setTextColor(...CREAM); pdf.text(`${val.toFixed(1)}`, INFO_X + BAR_W - 2, curY, { align: 'right' });

          pdf.setFillColor(35, 18, 8);
          pdf.roundedRect(INFO_X, curY + 1.5, BAR_W, 2.5, 0.8, 0.8, 'F');
          pdf.setFillColor(...ACCENT);
          if (fill > 0.5) pdf.roundedRect(INFO_X, curY + 1.5, fill, 2.5, 0.8, 0.8, 'F');
          curY += 10;
        });

        // Línea
        pdf.setDrawColor(...BORDER); pdf.setLineWidth(0.2);
        pdf.line(INFO_X, curY + 2, INFO_X + INFO_W, curY + 2);
        curY += 8;

        // Detalles
        const det = (label: string, valor: string) => {
          if (curY > H - 14) return;
          pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5);
          pdf.setTextColor(...FAINT); pdf.text(label, INFO_X, curY);
          pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7.5);
          pdf.setTextColor(...CREAM);
          const maxW = INFO_W - pdf.getTextWidth(label) - 3;
          const v = pdf.getTextWidth(valor) > maxW
            ? valor.slice(0, Math.floor(valor.length * maxW / pdf.getTextWidth(valor))) + '...'
            : valor;
          pdf.text(v, INFO_X + pdf.getTextWidth(label) + 2, curY);
          curY += 7;
        };

        if (ultimaVisita?.fecha) det('Ultima visita  ', formatFecha(ultimaVisita.fecha));
        if (precio !== null) det('Indice FW  ', `$${precio.toLocaleString('es-AR')}`);

        if (ultimaVisita?.notas && curY < H - 18) {
          pdf.setFont('helvetica', 'italic'); pdf.setFontSize(7.5);
          pdf.setTextColor(...FAINT);
          const notasLines = pdf.splitTextToSize(`"${ultimaVisita.notas}"`, INFO_W);
          pdf.text(notasLines.slice(0, 3), INFO_X, curY);
          curY += notasLines.slice(0, 3).length * 4.5;
        }

        const invitados = [...new Set(cafe.visitas.flatMap(v => v.invitados))];
        if (invitados.length > 0 && curY < H - 10) {
          pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5);
          pdf.setTextColor(...FAINT);
          pdf.text(`Con: ${invitados.join(', ')}`, INFO_X, curY);
        }

        // Número de página abajo
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5);
        pdf.setTextColor(...FAINT);
        const pageNum = String(i + 3);
        if (esImpar) {
          pdf.text(pageNum, INFO_X, H - 6);
        } else {
          pdf.text(pageNum, INFO_X + INFO_W - pdf.getTextWidth(pageNum), H - 6);
        }
      }

      // ── CONTRAPORTADA ─────────────────────────────────────
      setProgreso('Terminando...');
      pdf.addPage();
      try {
        const b64 = await fetchImageAsDataURL('/pdf-contraportada.jpg');
        pdf.addImage(b64, 'JPEG', 0, 0, W, H);
      } catch {
        pdf.setFillColor(...BG); pdf.rect(0, 0, W, H, 'F');
      }

      const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
      pdf.save(`Progetto-Flat-White-${fecha}.pdf`);

    } catch (err) {
      console.error('PDF Error:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
      setProgreso('');
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.title}>Descargar Guía</h2>
          <p className={styles.subtitle}>
            {cafes.length} {cafes.length === 1 ? 'cafetería' : 'cafeterías'} · PDF horizontal
          </p>
        </div>

        <button
          className={styles.downloadBtn}
          onClick={generatePDF}
          disabled={loading || cafes.length === 0}
        >
          {loading
            ? <><Loader size={18} className={styles.spinner} /> {progreso || 'Generando...'}</>
            : <><Download size={18} /> Descargar PDF</>
          }
        </button>

        {cafes.length === 0 && (
          <p className={styles.empty}>Agregá cafés para poder descargar la guía.</p>
        )}
      </div>
    </div>
  );
};
