export const formatFecha = (fechaRaw) => {
  if (!fechaRaw || fechaRaw === '-') return '-';
  const d = new Date(fechaRaw);

  if (isNaN(d.getTime())) return '-';
  const pad = (n) => n.toString().padStart(2, '0');
  const datePart = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const timePart = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  return `${datePart} ${timePart}`;
};

export function fixEncoding(str) {
  return Buffer.from(str, 'latin1').toString('utf8');
}

export function arreglarUTF8(texto) {
  if (!texto) return texto;
  return Buffer.from(texto, 'binary').toString('utf8');
}

export function convertirAUTF16(str) {
  if (!str) return str;
  return Buffer.from(str, 'utf8').toString('utf16le');
}

export function toSqlServerUnicode(str) {
  if (!str) return null;
  return Buffer.from(str, 'utf16le'); // codifica en UTF-16LE
}

export function arreglarTextoEspanol(texto) {
  if (!texto) return texto;

  const mapa = {
    // Vocales minúsculas
    atilde: 'á',
    etilde: 'é',
    itilde: 'í',
    otilde: 'ó',
    utilde: 'ú',
    nn: 'ñ',

    // Vocales mayúsculas
    ATILDE: 'Á',
    ETILDE: 'É',
    ITILDE: 'Í',
    OTILDE: 'Ó',
    UTILDE: 'Ú',
    NN: 'Ñ',
  };

  let salida = texto;

  for (const [mal, bien] of Object.entries(mapa)) {
    while (salida.includes(mal)) {
      console.log(
        `Detectado carácter especial: "${mal}" -> se reemplazará por "${bien}"`,
      );
      salida = salida.replace(mal, bien);
    }
  }

  return salida;
}

export function normalizeNumber(value, fallback = null) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

export function normalizeDate(value) {
  if (!value) return null;

  const dateValue = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dateValue.getTime())) return null;

  return dateValue;
}

export const normalizeString = (value, fallback = null) => {
  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : fallback;
  }
  return fallback;
};

export const formatFechaSQL = (fecha) => {
  if (!fecha) return null;

  // Si ya es un objeto Date, úsalo directamente, si no, créalo
  const date = fecha instanceof Date ? fecha : new Date(fecha);

  // Validar si la fecha es válida
  if (Number.isNaN(date.getTime())) return null;

  const pad = (value) => String(value).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
