import React, { useState } from 'react';
import type { Visita } from '../types';
import { obtenerUltimaVisita, calcularRatingVisita, formatFecha } from '../utils';
import { useCafeContext } from '../context/CafeContext';
import { Download, Loader } from 'lucide-react';
import jsPDF from 'jspdf';
import styles from './ExportPDF.module.css';

export const ExportPDF: React.FC = () => {
  const { cafes } = useCafeContext();
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const generatePDF = async () => {
    if (cafes.length === 0) {
      alert('No hay cafés para exportar');
      return;
    }

    setLoading(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;

      let yPosition = margin;

      // Portada
      pdf.setFillColor(139, 111, 71);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // Título
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(48);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Flat White', margin, 80, { maxWidth: contentWidth, align: 'center' });

      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Progetto', margin, 120, { maxWidth: contentWidth, align: 'center' });

      // Subtítulo
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Un viaggio per il caffè di Buenos Aires con il mio bro', margin, 160, {
        maxWidth: contentWidth,
        align: 'center',
      });

      // Fecha
      pdf.setFontSize(12);
      const today = new Date().toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      pdf.text(`${today}`, margin, 240, { maxWidth: contentWidth, align: 'center' });

      // Página 2: Índice
      pdf.addPage();
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Índice de Cafés', margin, 30);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      let indexY = 50;

      cafes.forEach((cafe, idx) => {
        const ultimaVisita = obtenerUltimaVisita(cafe);
        const rating = ultimaVisita ? calcularRatingVisita(ultimaVisita.ratings) : 0;
        const text = `${idx + 1}. ${cafe.nombre} — ${rating.toFixed(1)}/5`;
        pdf.text(text, margin + 5, indexY);
        indexY += 10;

        if (indexY > pageHeight - 20) {
          pdf.addPage();
          indexY = 30;
        }
      });

      // Página por cada café
      cafes.forEach((cafe) => {
        const visitasToShow = showHistory ? cafe.visitas : [obtenerUltimaVisita(cafe)].filter((v): v is Visita => v !== null);

        visitasToShow.forEach((visita: Visita, visitaIdx: number) => {
          if (!visita) return;

          pdf.addPage();
          yPosition = margin;

          // Título del café
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.text(cafe.nombre, margin, yPosition);
          yPosition += 12;

          // Dirección
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(100, 100, 100);
          pdf.text(cafe.direccion, margin, yPosition);
          yPosition += 8;

          // Si hay múltiples visitas, mostrar fecha
          if (cafe.visitas.length > 1) {
            pdf.setTextColor(139, 111, 71);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Visita ${visitaIdx + 1} - ${formatFecha(visita.fecha)}`, margin, yPosition);
            yPosition += 8;
          }

          pdf.setTextColor(0, 0, 0);
          yPosition += 4;

          // Foto principal (si existe)
          if (visita.fotos.length > 0) {
            try {
              const imgData = visita.fotos[0];
              const imgWidth = contentWidth;
              const imgHeight = 80;
              pdf.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
              yPosition += imgHeight + 12;
            } catch (e) {
              console.error('Error adding image:', e);
            }
          }

          // Ratings
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(139, 111, 71);
          pdf.text('Puntuaciones:', margin, yPosition);
          yPosition += 8;

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);

          const ratingLabels = [
            { label: 'Café', value: visita.ratings.cafe },
            { label: 'Delizie', value: visita.ratings.comestibles },
            { label: 'Vajilla', value: visita.ratings.vajilla },
            { label: 'Ambientación', value: visita.ratings.ambientacion },
            { label: 'Servicio', value: visita.ratings.servicio },
          ];

          ratingLabels.forEach(({ label, value }) => {
            pdf.text(`${label}: ${'★'.repeat(value)}${'☆'.repeat(5 - value)} (${value}/5)`, margin + 5, yPosition);
            yPosition += 6;
          });

          // Rating general
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(139, 111, 71);
          const ratingGeneral = calcularRatingVisita(visita.ratings);
          pdf.text(
            `Rating General: ${'★'.repeat(Math.floor(ratingGeneral))}${ratingGeneral % 1 >= 0.5 ? '½' : ''} (${ratingGeneral.toFixed(1)}/5)`,
            margin + 5,
            yPosition
          );
          yPosition += 10;

          // Detalles
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(139, 111, 71);
          pdf.text('Detalles:', margin, yPosition);
          yPosition += 8;

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);

          const details = [];
          details.push(`Fecha: ${formatFecha(visita.fecha)}`);
          if (visita.comestibles) details.push(`Comestibles: ${visita.comestibles}`);
          if (visita.precio > 0) details.push(`Índice Flat White: $${visita.precio}`);
          if (visita.invitados.length > 0) details.push(`Invitados: ${visita.invitados.join(', ')}`);

          details.forEach((detail) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(detail, margin + 5, yPosition);
            yPosition += 6;
          });

          // Notas
          if (visita.notas) {
            yPosition += 4;
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(139, 111, 71);
            pdf.text('Notas:', margin, yPosition);
            yPosition += 6;

            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(0, 0, 0);
            const notasLines = pdf.splitTextToSize(visita.notas, contentWidth - 10);
            notasLines.forEach((line: string) => {
              if (yPosition > pageHeight - 20) {
                pdf.addPage();
                yPosition = margin;
              }
              pdf.text(line, margin + 5, yPosition);
              yPosition += 5;
            });
          }
        });
      });

      // Guardar PDF
      pdf.save('Flat-White-Progetto.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.exportSection}>
      <div className={styles.exportCard}>
        <div className={styles.exportHeader}>
          <h3>Descargar Guía</h3>
          <p>Genera un PDF hermoso con todos tus cafés</p>
        </div>

        <div className={styles.options}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showHistory}
              onChange={(e) => setShowHistory(e.target.checked)}
              disabled={cafes.every((c) => c.visitas.length <= 1)}
            />
            <span>Mostrar histórico completo de visitas</span>
          </label>
        </div>

        <button onClick={generatePDF} disabled={loading || cafes.length === 0} className={styles.exportBtn}>
          {loading ? (
            <>
              <Loader size={18} className={styles.spinner} /> Generando...
            </>
          ) : (
            <>
              <Download size={18} /> Descargar PDF
            </>
          )}
        </button>

        {cafes.length === 0 && <p className={styles.emptyText}>Agregá algunos cafés para descargar</p>}
      </div>
    </div>
  );
};
