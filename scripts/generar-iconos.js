// Genera los íconos PWA de RoundUp sin dependencias externas.
// Diseño: fondo rojo córner (#C4233B) con el aro blanco del "round".
// Uso: node scripts/generar-iconos.js
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size, pixelFn) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  let o = 0;
  for (let y = 0; y < size; y++) {
    raw[o++] = 0; // filtro none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixelFn(x, y);
      raw[o++] = r;
      raw[o++] = g;
      raw[o++] = b;
      raw[o++] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Rojo córner y blanco lona (de los tokens de diseño)
const FONDO = [196, 35, 59];
const ARO = [250, 250, 250];

function icono(size, maskable) {
  const cx = size / 2;
  const cy = size / 2;
  // maskable: zona segura = 80% central → aro más chico
  const radioAro = size * (maskable ? 0.24 : 0.3);
  const grosorMedio = size * (maskable ? 0.075 : 0.09);
  const suavizado = Math.max(1.25, size / 256);

  return png(size, (x, y) => {
    const dist = Math.hypot(x - cx + 0.5, y - cy + 0.5);
    const distAro = Math.abs(dist - radioAro);
    // anti-aliasing por distancia al borde del aro
    let t = (grosorMedio - distAro) / suavizado;
    t = Math.max(0, Math.min(1, t));
    const r = Math.round(FONDO[0] + (ARO[0] - FONDO[0]) * t);
    const g = Math.round(FONDO[1] + (ARO[1] - FONDO[1]) * t);
    const b = Math.round(FONDO[2] + (ARO[2] - FONDO[2]) * t);
    return [r, g, b, 255];
  });
}

const publicDir = path.join(__dirname, "..", "public");
const salidas = [
  ["icon-192.png", icono(192, false)],
  ["icon-512.png", icono(512, false)],
  ["icon-maskable-192.png", icono(192, true)],
  ["icon-maskable-512.png", icono(512, true)],
];
for (const [nombre, buf] of salidas) {
  fs.writeFileSync(path.join(publicDir, nombre), buf);
  console.log(`✓ ${nombre} (${buf.length} bytes)`);
}
