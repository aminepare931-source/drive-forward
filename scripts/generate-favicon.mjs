// Generate a favicon.ico (volant de conduite bleu) for DriveHub.
// ICO wrapping a PNG image, standard for modern browsers.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const SIZE = 32;

// Minimal PNG encoder: RGBA raw → IDAT (zlib deflate) → chunks.
function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (crc ^ buf[i]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  // raw scanlines with filter byte 0
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Draw the steering-wheel logo procedurally onto an RGBA buffer.
const px = Buffer.alloc(SIZE * SIZE * 4); // transparent black

function setPx(x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
  const i = (y * SIZE + x) * 4;
  px[i] = r;
  px[i + 1] = g;
  px[i + 2] = b;
  px[i + 3] = a;
}

// Rounded-rect/disk background (soft edge)
const bgR = 10; // corner radius
const blue = [37, 99, 235]; // #2563eb
const blueDark = [29, 78, 216]; // #1e40af (inner)
function distToRoundedRect(x, y) {
  // center inside 0..SIZE square with radius bgR
  const cx = Math.min(Math.max(x, bgR), SIZE - bgR);
  const cy = Math.min(Math.max(y, bgR), SIZE - bgR);
  return Math.hypot(x - cx, y - cy);
}
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const d = distToRoundedRect(x + 0.5, y + 0.5);
    // background only covers corner cutout
    const cornerCut = d > bgR - 1;
    // simple vertical gradient
    const t = y / SIZE;
    const col = [
      Math.round(blue[0] + (blueDark[0] - blue[0]) * t),
      Math.round(blue[1] + (blueDark[1] - blue[1]) * t),
      Math.round(blue[2] + (blueDark[2] - blue[2]) * t),
    ];
    if (!cornerCut) setPx(x, y, col[0], col[1], col[2], 255);
  }
}

// Steering wheel: outer ring (stroke), inner hub, 3 spokes, road dashes.
const cx = SIZE / 2, cy = SIZE / 2;
const R = 11, stroke = 2.2;
function drawDisk(cx0, cy0, radius, r, g, b, a) {
  const r2 = radius * radius;
  for (let y = Math.max(0, Math.floor(cy0 - radius)); y <= Math.min(SIZE - 1, Math.ceil(cy0 + radius)); y++) {
    for (let x = Math.max(0, Math.floor(cx0 - radius)); x <= Math.min(SIZE - 1, Math.ceil(cx0 + radius)); x++) {
      const dx = x + 0.5 - cx0, dy = y + 0.5 - cy0;
      if (dx * dx + dy * dy <= r2) setPx(x, y, r, g, b, 255);
    }
  }
}

// Outer ring (annulus)
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (Math.abs(d - R) <= stroke / 2) {
      const ang = Math.atan2(dy, dx);
      const seg = ((ang + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2);
      // cut a gap at the bottom for road
      const bottomGap = seg > 0.36 && seg < 0.64;
      if (!bottomGap) setPx(x, y, 255, 255, 255, 255);
    }
  }
}

// Spokes: top, left, right
drawDisk(cx, cy - R * 0.75, 1.6, 255, 255, 255);
drawDisk(cx - R * 0.65, cy + R * 0.35, 1.6, 255, 255, 255);
drawDisk(cx + R * 0.65, cy + R * 0.35, 1.6, 255, 255, 255);

// Hub
drawDisk(cx, cy, 2.8, 255, 255, 255);

// Road dashes at bottom
for (let dx = -6; dx <= 6; dx += 4) {
  for (let exc = -1; exc <= 1; exc++) {
    drawDisk(cx + dx, SIZE - 3 + exc, 1.0, 255, 255, 255);
  }
}

const png = encodePng(SIZE, SIZE, px);

// ICO wrapper
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // count
const entry = Buffer.alloc(16);
entry[0] = 0; // width 256 (0 = 256)
entry[1] = 0; // height
entry[2] = 0; // colors
entry[3] = 0; // reserved
entry.writeUInt16LE(1, 4); // planes
entry.writeUInt16LE(32, 6); // bit count
entry.writeUInt32LE(png.length, 8); // bytes in res
entry.writeUInt32LE(22, 12); // offset

const ico = Buffer.concat([header, entry, png]);
writeFileSync(new URL("../public/favicon.ico", import.meta.url), ico);
console.log("favicon.ico generated:", ico.length, "bytes");