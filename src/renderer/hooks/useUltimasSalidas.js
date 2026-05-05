import { useState, useEffect } from 'react';

const useUltimasSalidas = () => {
  const [salidas, setSalidas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalidas = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await window.api.stats.getUltimasSalidas();
        if (result.success) {
          setSalidas(result.data || []);
        } else {
          setError(result.error || 'Error desconocido');
          setSalidas([]);
        }
      } catch (err) {
        setError(err.message);
        setSalidas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSalidas();
  }, []);

  return { salidas, loading, error };
};

export default useUltimasSalidas;
