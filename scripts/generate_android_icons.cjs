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

function renderContrilIcon(size, isRound = false) {
  const width = size;
  const height = size;
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(rowLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = size * 0.46; // Outer icon corner or circle
  const ringRadius = size * 0.28;
  const ringThickness = Math.max(1.5, size * 0.04);
  const diamondHalf = size * 0.17;
  const diamondThickness = Math.max(1.5, size * 0.04);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      const dx = x - cx;
      const dy = y - cy;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);

      // Squircle or Circle mask for background
      let isInsideBg = false;
      if (isRound) {
        isInsideBg = distFromCenter <= outerRadius;
      } else {
        // Rounded squircle: distance formula with p=3.5 for luxury squircle
        const normX = Math.abs(dx) / (outerRadius * 0.96);
        const normY = Math.abs(dy) / (outerRadius * 0.96);
        const squircleDist = Math.pow(Math.pow(normX, 3.2) + Math.pow(normY, 3.2), 1 / 3.2);
        isInsideBg = squircleDist <= 1.0;
      }

      if (!isInsideBg) {
        // Transparent
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
        continue;
      }

      // 1. Background color: Luxury deep obsidian navy (#070E1E -> #0B1A3A)
      const gradFactor = (x + y) / (width + height);
      let r = Math.round(7 + gradFactor * 6);
      let g = Math.round(14 + gradFactor * 10);
      let b = Math.round(30 + gradFactor * 24);
      let a = 255;

      // 2. Subtle radial glow behind diamond
      if (distFromCenter < ringRadius * 1.2) {
        const glowFactor = (1 - distFromCenter / (ringRadius * 1.2)) * 0.25;
        r = Math.min(255, Math.round(r + 37 * glowFactor));
        g = Math.min(255, Math.round(g + 99 * glowFactor));
        b = Math.min(255, Math.round(b + 235 * glowFactor));
      }

      // 3. Contril Ring: Circle with radius ringRadius and stroke ringThickness
      const ringDist = Math.abs(distFromCenter - ringRadius);
      if (ringDist <= ringThickness) {
        const ringAlpha = 1 - (ringDist / ringThickness);
        // Electric sky-cyan to Contril blue
        const ringR = Math.round(56 + gradFactor * 40);
        const ringG = Math.round(189 - gradFactor * 60);
        const ringB = Math.round(248);
        r = Math.round(r * (1 - ringAlpha) + ringR * ringAlpha);
        g = Math.round(g * (1 - ringAlpha) + ringG * ringAlpha);
        b = Math.round(b * (1 - ringAlpha) + ringB * ringAlpha);
      }

      // 4. Contril Diamond: |dx| + |dy| <= diamondHalf
      const manhattanDist = Math.abs(dx) + Math.abs(dy);
      const diamondEdgeDist = Math.abs(manhattanDist - diamondHalf);

      if (manhattanDist < diamondHalf) {
        // Diamond fill: Deep Contril blue (#1D4ED8 to #2563EB)
        const fillAlpha = 0.95;
        const fillR = Math.round(29 + gradFactor * 8);
        const fillG = Math.round(78 + gradFactor * 21);
        const fillB = Math.round(216 + gradFactor * 19);
        r = Math.round(r * (1 - fillAlpha) + fillR * fillAlpha);
        g = Math.round(g * (1 - fillAlpha) + fillG * fillAlpha);
        b = Math.round(b * (1 - fillAlpha) + fillB * fillAlpha);
      }

      if (diamondEdgeDist <= diamondThickness) {
        // Diamond stroke: Vivid cyan & bright blue (#38BDF8 / #60A5FA)
        const strokeAlpha = 1 - (diamondEdgeDist / diamondThickness);
        const strokeR = Math.round(96 + (1 - gradFactor) * 50);
        const strokeG = Math.round(165 + (1 - gradFactor) * 40);
        const strokeB = 250;
        r = Math.round(r * (1 - strokeAlpha) + strokeR * strokeAlpha);
        g = Math.round(g * (1 - strokeAlpha) + strokeG * strokeAlpha);
        b = Math.round(b * (1 - strokeAlpha) + strokeB * strokeAlpha);
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // PNG Header
  const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

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

  const iconPng = renderContrilIcon(d.size, false);
  fs.writeFileSync(path.join(targetDir, 'ic_launcher.png'), iconPng);

  const roundIconPng = renderContrilIcon(d.size, true);
  fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.png'), roundIconPng);

  console.log(`Generated ${d.folder} (${d.size}x${d.size}) standard & round launcher icons`);
}

console.log('All legacy & modern launcher mipmaps generated successfully!');
