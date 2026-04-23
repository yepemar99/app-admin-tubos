import { useEffect, useState } from "react";

export function useDatabaseStatus(pollInterval = 5000) {
  const [status, setStatus] = useState({ target: "unknown", connected: false });
  const [loading, setLoading] = useState(true);

  // Función para actualizar el estado desde preload
  const fetchStatus = async () => {
    try {
      const currentStatus = await window.apiDB.getStatus();
      setStatus(currentStatus);
    } catch (err) {
      console.error("Error obteniendo estado DB:", err);
      setStatus({ target: "unknown", connected: false });
    }
  };

  // Intentar conectar si no está conectado
  const connectDB = async () => {
    try {
      const res = await window.apiDB.connect();
      setStatus(res.status);
    } catch (err) {
      console.error("Error conectando a la DB:", err);
    }
  };

  useEffect(() => {
    let intervalId;

    // Obtener estado inicial
    fetchStatus().then(() => setLoading(false));

    // Reconexión automática si no está conectado
    intervalId = setInterval(async () => {
      if (!status.connected) {
        await connectDB();
      } else {
        await fetchStatus();
      }
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [status.connected, pollInterval]);

  return { status, loading };
}
