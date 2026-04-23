import { useEffect, useState } from "react";

const useGetImage = (image = "") => {
  const [imagePath, setimagePath] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (image) {
      const cargarFoto = async () => {
        setLoading(true);
        const data = await window.api.actions.readImage(image);
        setimagePath(data?.image || "");
      };
      cargarFoto();
    } else {
      setimagePath("");
    }
    setLoading(false);
  }, []);
  return { imagePath: imagePath, loading: loading };
};

export default useGetImage;
