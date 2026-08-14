export interface Point {
  x: number;
  y: number;
}

export async function resizeImage(imageSrc: string, maxDim: number = 2048): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let scale = 1;
      if (img.width > maxDim || img.height > maxDim) {
        scale = Math.min(maxDim / img.width, maxDim / img.height);
      }
      
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) return reject(new Error("No canvas context"));
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.96));
    };
    img.onerror = (err) => reject(err);
    img.src = imageSrc;
  });
}

function solveLinearSystem(A: number[][]): number[] {
  const n = 8;
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    let maxVal = Math.abs(A[col]?.[col] ?? 0);
    for (let row = col + 1; row < n; row++) {
      const val = Math.abs(A[row]?.[col] ?? 0);
      if (val > maxVal) {
        maxVal = val;
        maxRow = row;
      }
    }
    const temp = A[col];
    A[col] = A[maxRow] ?? [];
    A[maxRow] = temp ?? [];

    const pivot = A[col]?.[col] ?? 1;
    for (let row = col + 1; row < n; row++) {
      const curRow = A[row];
      if (!curRow) continue;
      const factor = (curRow[col] ?? 0) / pivot;
      for (let j = col; j <= n; j++) {
        curRow[j] = (curRow[j] ?? 0) - factor * (A[col]?.[j] ?? 0);
      }
    }
  }
  const x: number[] = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    const curRow = A[i];
    let val = curRow?.[n] ?? 0;
    for (let j = i + 1; j < n; j++) {
      val -= (curRow?.[j] ?? 0) * (x[j] ?? 0);
    }
    x[i] = val / (curRow?.[i] ?? 1);
  }
  return x;
}

function getPerspectiveTransform(
  src: [Point, Point, Point, Point],
  dst: [Point, Point, Point, Point]
): number[] {
  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const s = src[i];
    const d = dst[i];
    if (!s || !d) continue;
    const sx = s.x, sy = s.y;
    const dx = d.x, dy = d.y;
    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy, dx]);
    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy, dy]);
  }
  const h = solveLinearSystem(A);
  return [...h, 1];
}

function warpPerspective(
  srcData: ImageData,
  srcW: number,
  srcH: number,
  H: number[],
  dstW: number,
  dstH: number
): ImageData {
  const dst = new ImageData(dstW, dstH);
  const sd = srcData.data;
  const dd = dst.data;

  const h0 = H[0] ?? 0, h1 = H[1] ?? 0, h2 = H[2] ?? 0;
  const h3 = H[3] ?? 0, h4 = H[4] ?? 0, h5 = H[5] ?? 0;
  const h6 = H[6] ?? 0, h7 = H[7] ?? 0, h8 = H[8] ?? 1;

  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const denom = h6 * x + h7 * y + h8;
      if (Math.abs(denom) < 1e-10) continue;
      const sx = (h0 * x + h1 * y + h2) / denom;
      const sy = (h3 * x + h4 * y + h5) / denom;

      const dstIdx = (y * dstW + x) * 4;

      if (sx >= 0 && sx < srcW - 1 && sy >= 0 && sy < srcH - 1) {
        const x0 = Math.floor(sx);
        const y0 = Math.floor(sy);
        const x1 = x0 + 1;
        const y1 = y0 + 1;

        const dx = sx - x0;
        const dy = sy - y0;

        const idx00 = (y0 * srcW + x0) * 4;
        const idx10 = (y0 * srcW + x1) * 4;
        const idx01 = (y1 * srcW + x0) * 4;
        const idx11 = (y1 * srcW + x1) * 4;

        for (let c = 0; c < 4; c++) {
          const top = (sd[idx00 + c] ?? 0) * (1 - dx) + (sd[idx10 + c] ?? 0) * dx;
          const bot = (sd[idx01 + c] ?? 0) * (1 - dx) + (sd[idx11 + c] ?? 0) * dx;
          dd[dstIdx + c] = Math.round(top * (1 - dy) + bot * dy);
        }
      } else {
        const ix = Math.round(sx);
        const iy = Math.round(sy);
        if (ix >= 0 && ix < srcW && iy >= 0 && iy < srcH) {
          const srcIdx = (iy * srcW + ix) * 4;
          dd[dstIdx] = sd[srcIdx] ?? 0;
          dd[dstIdx + 1] = sd[srcIdx + 1] ?? 0;
          dd[dstIdx + 2] = sd[srcIdx + 2] ?? 0;
          dd[dstIdx + 3] = sd[srcIdx + 3] ?? 255;
        }
      }
    }
  }
  return dst;
}

export async function cropImage(
  imageSrc: string,
  corners: [Point, Point, Point, Point]
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const [tl, tr, br, bl] = corners;

        const widthTop = Math.hypot(tr.x - tl.x, tr.y - tl.y);
        const widthBot = Math.hypot(br.x - bl.x, br.y - bl.y);
        const dstW = Math.round(Math.max(widthTop, widthBot));

        const heightLeft = Math.hypot(bl.x - tl.x, bl.y - tl.y);
        const heightRight = Math.hypot(br.x - tr.x, br.y - tr.y);
        const dstH = Math.round(Math.max(heightLeft, heightRight));

        if (dstW <= 0 || dstH <= 0) {
          return reject(new Error("Invalid crop area: width or height is zero"));
        }

        const srcCanvas = document.createElement("canvas");
        srcCanvas.width = img.naturalWidth;
        srcCanvas.height = img.naturalHeight;
        const srcCtx = srcCanvas.getContext("2d", { willReadFrequently: true });
        if (!srcCtx) return reject(new Error("Could not create source canvas context"));
        srcCtx.drawImage(img, 0, 0);
        const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);

        const srcPts: [Point, Point, Point, Point] = [tl, tr, br, bl];
        const dstPts: [Point, Point, Point, Point] = [
          { x: 0, y: 0 },
          { x: dstW, y: 0 },
          { x: dstW, y: dstH },
          { x: 0, y: dstH },
        ];

        const H = getPerspectiveTransform(dstPts, srcPts);

        const dstData = warpPerspective(
          srcData,
          srcCanvas.width,
          srcCanvas.height,
          H,
          dstW,
          dstH
        );

        const outCanvas = document.createElement("canvas");
        outCanvas.width = dstW;
        outCanvas.height = dstH;
        const outCtx = outCanvas.getContext("2d");
        if (!outCtx) return reject(new Error("Could not create output canvas context"));
        outCtx.putImageData(dstData, 0, 0);

        resolve(outCanvas.toDataURL("image/jpeg", 0.96));
      } catch (err) {
        console.error("Perspective crop error:", err);
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for cropping"));
    img.src = imageSrc;
  });
}
