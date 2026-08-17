const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation
function makeCrcTable() {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
}

const crcTable = makeCrcTable();

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4);
  data.copy(buf, 8);
  const crcData = Buffer.concat([Buffer.from(type), data]);
  buf.writeUInt32BE(crc32(crcData), 8 + len);
  return buf;
}

function renderContrilLightIcon(size) {
  const width = size;
  const height = size;
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(rowLength * height);

  const cx = width / 2;
  const cy = height / 2;
  
  // Safe zone proportions for adaptive icon  
  const circleRadius = size * 0.30;       // Outer ring radius
  const ringThickness = Math.max(1.2, size * 0.032);
  const diamondHalf = size * 0.185;        // Diamond half-diagonal
  const diamondStrokeThickness = Math.max(1.0, size * 0.028);

  // Contril Blue: #2563EB = rgb(37, 99, 235)
  const blueR = 37, blueG = 99, blueB = 235;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);

      // 1. Light background: #F7FAFF with subtle radial gradient to #FFFFFF center
      const bgFactor = Math.min(1, distFromCenter / (size * 0.5));
      let r = Math.round(255 - bgFactor * 8);   // 255 -> 247
      let g = Math.round(255 - bgFactor * 5);   // 255 -> 250  
      let b = 255;
      let a = 255;

      // 2. Outer ring: circle stroke at circleRadius
      const ringDist = Math.abs(distFromCenter - circleRadius);
      if (ringDist <= ringThickness) {
        const alpha = Math.max(0, 1 - (ringDist / ringThickness));
        // Anti-alias: blend blue onto background
        r = Math.round(r * (1 - alpha) + blueR * alpha);
        g = Math.round(g * (1 - alpha) + blueG * alpha);
        b = Math.round(b * (1 - alpha) + blueB * alpha);
      }

      // 3. Diamond: |dx| + |dy| <= diamondHalf
      const manhattanDist = Math.abs(dx) + Math.abs(dy);
      
      // Diamond fill
      if (manhattanDist < diamondHalf - diamondStrokeThickness * 0.5) {
        r = blueR;
        g = blueG;
        b = blueB;
      }
      
      // Diamond edge anti-aliasing
      const diamondEdgeDist = Math.abs(manhattanDist - diamondHalf);
      if (diamondEdgeDist <= diamondStrokeThickness) {
        const edgeAlpha = Math.max(0, 1 - (diamondEdgeDist / diamondStrokeThickness));
        if (manhattanDist >= diamondHalf - diamondStrokeThickness * 0.5) {
          r = Math.round(r * (1 - edgeAlpha) + blueR * edgeAlpha);
          g = Math.round(g * (1 - edgeAlpha) + blueG * edgeAlpha);
          b = Math.round(b * (1 - edgeAlpha) + blueB * edgeAlpha);
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // Build PNG
  const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const ihdrChunk = createChunk('IHDR', ihdr);
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk]);
}

const resDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

const densities = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 }
];

for (const d of densities) {
  const targetDir = path.join(resDir, d.folder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const iconPng = renderContrilLightIcon(d.size);
  fs.writeFileSync(path.join(targetDir, 'ic_launcher.png'), iconPng);
  fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.png'), iconPng);

  console.log(`Generated LIGHT ${d.folder} (${d.size}x${d.size}) launcher icons`);
}

console.log('All LIGHT launcher mipmaps generated.');
