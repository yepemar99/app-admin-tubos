import React from 'react';
import { Box } from '@mui/material';
import Timeline from '../charts/Timeline';
import useUltimasSalidas from '../../hooks/useUltimasSalidas';

const UltimasSalidasTimeline = () => {
  const { salidas, loading, error } = useUltimasSalidas();

  // Transformar los datos de salidas al formato esperado por Timeline
  const timelineItems = salidas.map((salida) => {
    const fecha = new Date(salida.fecha);
    const fechaFormato = fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const tiempoRelativo = (
      (new Date() - fecha) /
      (1000 * 60 * 60 * 24)
    ).toFixed(0);
    const tiempoTranscurrido =
      tiempoRelativo < 1
        ? 'Hace poco'
        : `Hace ${tiempoRelativo} día${tiempoRelativo > 1 ? 's' : ''}`;

    return {
      id: salida.id,
      title: `${salida.cantidad} tubos de ${salida.medida}`,
      subtitle: `${salida.nombreOperario} - ${salida.destino || 'Sin destino'}`,
      date: fechaFormato,
      timeAgo: tiempoTranscurrido,
      icon: 'package',
      bgColor: '#7C3AED',
    };
  });

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Timeline
          items={[
            {
              id: 1,
              title: 'Cargando...',
              subtitle: '',
              date: '',
              timeAgo: '',
            },
          ]}
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, color: 'red' }}>
        <Timeline
          items={[
            {
              id: 1,
              title: `Error: ${error}`,
              subtitle: '',
              date: '',
              timeAgo: '',
            },
          ]}
        />
      </Box>
    );
  }

  return <Timeline items={timelineItems} />;
};

export default UltimasSalidasTimeline;
