const API_URL = import.meta.env.VITE_API_URL;

export const saveBooking = async (bookingData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    mode: "no-cors", // Importante para Google Scripts
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData)
  });
  return response;
};

export const getBookings = async () => {
  try {
    // El getTime() fuerza a que SIEMPRE descargue los datos frescos
    const urlFresco = `${API_URL}?action=getBookings&t=${new Date().getTime()}`;
    const response = await fetch(urlFresco);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener disponibilidad:", error);
    return [];
  }
};

// NUEVA FUNCIÓN: Obtiene los horarios de la pestaña "Configuración"
export const getConfig = async () => {
  try {
    const response = await fetch(`${API_URL}?action=getConfig`);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    return [];
  }
};

export const getPrecios = async () => {
  try {
    const url = `${API_URL}?action=getPrecios&t=${new Date().getTime()}`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener precios:", error);
    return [];
  }
};