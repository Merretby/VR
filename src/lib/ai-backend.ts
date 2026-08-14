// AI panorama backend ported from AI/backend_ai/server.js into the VR
// project, so upload/process/list/delete/serve all run on the same
// localhost with no separate process. Storage lives under public/ai-storage.

import path from "path";
import fs from "fs";
import { promises as fsp } from "fs";
import { Readable } from "stream";

const STORAGE_ROOT = path.join(process.cwd(), "public", "ai-storage");
const UPLOADS_DIR = path.join(STORAGE_ROOT, "uploads");
const ENHANCED_DIR = path.join(STORAGE_ROOT, "enhanced");
// Panorama folder where savePanorama writes captures directly; /vr lists these
// straight from disk instead of round-tripping through the platform pipeline.
const DOWNLOADS_DIR = path.join(process.cwd(), "public", "downlod");

export type AiImage = {
  id: string;
  originalName?: string;
  filename?: string;
  path?: string;
  processed?: boolean;
  processor?: string;
  enhancement?: string;
  width?: number;
  height?: number;
  ratio?: number;
  isPanorama360?: boolean;
  quality?: string;
  time?: number;
  error?: string;
};

function ensureDirs() {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.mkdirSync(ENHANCED_DIR, { recursive: true });
}

function analyzeImage(width: number, height: number) {
  const ratio = height > 0 ? width / height : 0;
  const ratioRounded = Number(ratio.toFixed(3));
  const isPanorama360 = ratio >= 1.9 && ratio <= 2.1;
  let quality = "low";
  if (width >= 7000 && height >= 3500) {
    quality = "8K";
  } else if (width >= 4000 && height >= 2000) {
    quality = "high";
  } else if (width >= 2000 && height >= 1000) {
    quality = "medium";
  }
  return { width, height, ratio: ratioRounded, isPanorama360, quality };
}

type IncomingFile = {
  path: string;
  filename: string;
  originalname: string;
};

async function processImage(file: IncomingFile): Promise<AiImage> {
  const sharp = (await import("sharp")).default;
  const inputPath = file.path;
  const baseName = path.parse(file.filename).name;

  const metadata = await sharp(inputPath).metadata();
  const originalWidth = metadata.width || 0;
  const originalHeight = metadata.height || 0;
  if (!originalWidth || !originalHeight) {
    throw new Error("Invalid image dimensions");
  }

  const originalRatio = originalWidth / originalHeight;
  const is360 = originalRatio >= 1.9 && originalRatio <= 2.1;

  let targetWidth: number;
  let targetHeight: number;
  if (is360) {
    targetWidth = 7680;
    targetHeight = 3840;
  } else {
    targetWidth = 7680;
    targetHeight = Math.round(targetWidth / originalRatio);
    if (targetHeight > 7680) {
      targetHeight = 7680;
      targetWidth = Math.round(targetHeight * originalRatio);
    }
  }

  const finalFilename = `${baseName}-8k.jpg`;
  const finalPath = path.join(ENHANCED_DIR, finalFilename);

  await sharp(inputPath, { sequentialRead: true })
    .rotate()
    .resize({
      width: targetWidth,
      height: targetHeight,
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false,
    })
    .sharpen({ sigma: 1.1, m1: 1, m2: 2 })
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toFile(finalPath);

  const finalMeta = await sharp(finalPath).metadata();
  const finalWidth = finalMeta.width || 0;
  const finalHeight = finalMeta.height || 0;

  return {
    id: finalFilename,
    originalName: file.originalname,
    filename: finalFilename,
    path: `/files/enhanced/${finalFilename}`,
    processed: true,
    processor: "sharp",
    enhancement: "Lanczos3 + Sharpen",
    ...analyzeImage(finalWidth, finalHeight),
  };
}

export async function handleUpload(request: Request): Promise<Response> {
  ensureDirs();

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return Response.json(
      { success: false, message: "Expected multipart/form-data" },
      { status: 400 },
    );
  }

  let files: File[];
  try {
    const formData = await request.formData();
    files = formData.getAll("images").filter((f): f is File => f instanceof File);
  } catch (error) {
    return Response.json(
      { success: false, message: `Invalid upload: ${(error as Error).message}` },
      { status: 400 },
    );
  }

  if (!files.length) {
    return Response.json({ success: false, message: "No images uploaded" }, { status: 400 });
  }

  const results: AiImage[] = [];

  for (const file of files) {
    const ext = path.extname(file.name) || ".jpg";
    const random = Math.random().toString(36).slice(2, 8);
    const uploadName = `${Date.now()}-${random}${ext}`;
    const uploadPath = path.join(UPLOADS_DIR, uploadName);
    await fsp.writeFile(uploadPath, Buffer.from(await file.arrayBuffer()));

    try {
      results.push(
        await processImage({ path: uploadPath, filename: uploadName, originalname: file.name }),
      );
    } catch (error) {
      console.error("Sharp processing error:", error);
      try {
        const sharp = (await import("sharp")).default;
        const meta = await sharp(uploadPath).metadata();
        results.push({
          id: uploadName,
          originalName: file.name,
          filename: uploadName,
          path: `/files/uploads/${uploadName}`,
          processed: false,
          processor: "original",
          error: (error as Error).message,
          ...analyzeImage(meta.width || 0, meta.height || 0),
        });
      } catch {
        results.push({
          id: uploadName,
          originalName: file.name,
          processed: false,
          error: (error as Error).message,
        });
      }
    }
  }

  return Response.json({ success: true, count: results.length, images: results });
}

export async function handleListImages(): Promise<Response> {
  ensureDirs();
  const sharp = (await import("sharp")).default;

  async function listDir(dir: string, urlPrefix: string): Promise<AiImage[]> {
    const images: AiImage[] = [];
    if (!fs.existsSync(dir)) return images;
    const filenames = fs
      .readdirSync(dir)
      .filter((filename) => /\.(jpg|jpeg|png|webp)$/i.test(filename));

    for (const filename of filenames) {
      const filePath = path.join(dir, filename);
      try {
        const meta = await sharp(filePath).metadata();
        const stats = fs.statSync(filePath);
        images.push({
          id: filename,
          originalName: filename,
          filename,
          path: `${urlPrefix}/${filename}`,
          processed: true,
          processor: "sharp",
          time: stats.mtimeMs,
          ...analyzeImage(meta.width || 0, meta.height || 0),
        });
      } catch (error) {
        console.error(`Invalid image skipped: ${filename}`, (error as Error).message);
      }
    }
    return images;
  }

  const images = [
    ...(await listDir(DOWNLOADS_DIR, "/files/downlod")),
    ...(await listDir(ENHANCED_DIR, "/files/enhanced")),
  ];
  images.sort((a, b) => (b.time ?? 0) - (a.time ?? 0));

  return Response.json({ success: true, images });
}

async function deleteWithRetry(filePath: string, retries = 10): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await fsp.unlink(filePath);
      return true;
    } catch (error) {
      const e = error as NodeJS.ErrnoException;
      if (e.code === "ENOENT") return true;
      if (e.code !== "EBUSY" && e.code !== "EPERM") throw error;
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
  return false;
}

export async function handleDeleteImage(filename: string): Promise<Response> {
  ensureDirs();
  const safeName = path.basename(filename);
  const filePath = path.join(ENHANCED_DIR, safeName);

  if (!fs.existsSync(filePath)) {
    return Response.json({ success: false, message: "Image not found" }, { status: 404 });
  }

  const deleted = await deleteWithRetry(filePath);
  if (!deleted) {
    return Response.json({ success: false, message: "Image is busy. Try again." }, { status: 423 });
  }

  return Response.json({ success: true, filename: safeName });
}

export async function handleServeFile(splat: string): Promise<Response> {
  // Direct panoramas live under public/downlod; everything else serves from
  // the platform's ai-storage.
  const isDownlod = splat.startsWith("downlod/");
  const root = isDownlod ? DOWNLOADS_DIR : STORAGE_ROOT;
  const relative = isDownlod ? splat.slice("downlod/".length) : splat;
  const filePath = path.join(root, relative);
  if (!filePath.startsWith(root)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const stat = await fsp.stat(filePath);
    if (!stat.isFile()) return new Response("Not found", { status: 404 });

    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      (ext === ".png" && "image/png") ||
      (ext === ".webp" && "image/webp") ||
      (ext === ".jpeg" && "image/jpeg") ||
      (ext === ".jpg" && "image/jpeg") ||
      "application/octet-stream";

    const stream = fs.createReadStream(filePath);
    const body = Readable.toWeb(stream) as unknown as ReadableStream;
    return new Response(body, {
      headers: {
        "content-type": contentType,
        "content-length": String(stat.size),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
