// Client-only: samples particle positions from the ICHOR logo mark (drawn)
// and the kangaroo brand frame (pixel luminance), normalized into matching
// world-space point clouds so they can be morphed 1:1 by a shader.

export type Point = { x: number; y: number; z: number };

const TARGET_SIZE = 1.7; // world units, longest dimension of each normalized cloud

function normalizeAndResample(
  raw: { x: number; y: number; brightness: number }[],
  count: number
): Point[] {
  if (raw.length === 0) {
    return Array.from({ length: count }, () => ({ x: 0, y: 0, z: 0 }));
  }

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of raw) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const scale = TARGET_SIZE / Math.max(w, h);

  // Shuffle so index i doesn't correlate with scan order (nicer chaos mid-morph).
  const shuffled = raw.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const out: Point[] = [];
  for (let i = 0; i < count; i++) {
    const base = shuffled[i % shuffled.length];
    const pad = shuffled.length < count ? 0.015 : 0;
    const jitterX = pad ? (Math.random() - 0.5) * pad : 0;
    const jitterY = pad ? (Math.random() - 0.5) * pad : 0;
    const brightness = base.brightness / 255;
    out.push({
      x: (base.x - cx) * scale + jitterX,
      y: -(base.y - cy) * scale + jitterY, // flip: canvas y-down -> world y-up
      z: (brightness - 0.5) * 0.5,
    });
  }
  return out;
}

/** Draws the ICHOR "C" mark and samples its filled ring into a point cloud. */
export function sampleLogoCloud(count: number): Point[] {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = size * 0.26;
  ctx.lineCap = "round";

  const r = size * 0.34;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = (35 * Math.PI) / 180;
  const endAngle = (325 * Math.PI) / 180;

  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle, false);
  ctx.stroke();

  const { data } = ctx.getImageData(0, 0, size, size);
  const candidates: { x: number; y: number; brightness: number }[] = [];
  const stride = 2;
  for (let y = 0; y < size; y += stride) {
    for (let x = 0; x < size; x += stride) {
      const i = (y * size + x) * 4;
      if (data[i] > 128) {
        candidates.push({ x, y, brightness: 220 });
      }
    }
  }

  return normalizeAndResample(candidates, count);
}

/** Loads the kangaroo frame and samples bright (foreground) pixels into a point cloud. */
export async function sampleKangarooCloud(count: number): Promise<Point[]> {
  const img = new Image();
  img.src = "/images/kangaroo-source.jpg";
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const { data, width, height } = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );
  const candidates: { x: number; y: number; brightness: number }[] = [];
  const stride = 3;
  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const i = (y * width + x) * 4;
      const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      if (lum > 58) {
        candidates.push({ x, y, brightness: Math.min(255, lum) });
      }
    }
  }

  return normalizeAndResample(candidates, count);
}

export function pointsToFloat32(points: Point[]): Float32Array {
  const arr = new Float32Array(points.length * 3);
  for (let i = 0; i < points.length; i++) {
    arr[i * 3] = points[i].x;
    arr[i * 3 + 1] = points[i].y;
    arr[i * 3 + 2] = points[i].z;
  }
  return arr;
}

/** A scattered sphere cloud used as the "genesis" starting state. */
export function sampleScatterCloud(count: number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < count; i++) {
    const radius = 2.6 + Math.random() * 1.8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    out.push({
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: radius * Math.cos(phi) * 0.6,
    });
  }
  return out;
}
