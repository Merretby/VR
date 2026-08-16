// =====================================================
// AI BACKEND
// REAL-ESRGAN ONLY
// NO SHARP
// =====================================================

import path from "path";
import fs from "fs";
import { promises as fsp } from "fs";
import { Readable } from "stream";
import { spawn } from "child_process";
import crypto from "crypto";

// =====================================================
// REAL-ESRGAN PATHS
// =====================================================

const REALESRGAN_EXE =
  "C:\\Users\\nitro\\Desktop\\VR\\RealESRGAN\\app\\realesrgan-ncnn-vulkan.exe";

const REALESRGAN_MODELS_DIR =
  "C:\\Users\\nitro\\Desktop\\VR\\RealESRGAN\\app\\models";

  const ENABLE_REALESRGAN = false;

// =====================================================
// STORAGE PATHS
// =====================================================

const STORAGE_ROOT = path.join(
  process.cwd(),
  "public",
  "ai-storage",
);

const UPLOADS_DIR = path.join(
  STORAGE_ROOT,
  "uploads",
);

const ENHANCED_DIR = path.join(
  STORAGE_ROOT,
  "enhanced",
);

const DOWNLOADS_DIR = path.join(
  process.cwd(),
  "public",
  "downlod",
);

// =====================================================
// TYPES
// =====================================================

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

type IncomingFile = {
  path: string;
  filename: string;
  originalname: string;
};

type ImageDimensions = {
  width: number;
  height: number;
};

// =====================================================
// CREATE DIRECTORIES
// =====================================================

function ensureDirs() {
  fs.mkdirSync(
    UPLOADS_DIR,
    {
      recursive: true,
    },
  );

  fs.mkdirSync(
    ENHANCED_DIR,
    {
      recursive: true,
    },
  );

  fs.mkdirSync(
    DOWNLOADS_DIR,
    {
      recursive: true,
    },
  );
}

// =====================================================
// IMAGE ANALYSIS
// =====================================================

function analyzeImage(
  width: number,
  height: number,
) {
  const ratio =
    height > 0
      ? width / height
      : 0;

  const ratioRounded =
    Number(
      ratio.toFixed(3),
    );

  const isPanorama360 =
    ratio >= 1.9 &&
    ratio <= 2.1;

  let quality =
    "low";

  if (
    width >= 7000 &&
    height >= 3500
  ) {
    quality = "8K";
  } else if (
    width >= 4000 &&
    height >= 2000
  ) {
    quality = "high";
  } else if (
    width >= 2000 &&
    height >= 1000
  ) {
    quality = "medium";
  }

  return {
    width,
    height,

    ratio:
      ratioRounded,

    isPanorama360,

    quality,
  };
}

// =====================================================
// DELETE FILE SAFELY
// =====================================================

async function safeDelete(
  filePath: string,
) {
  try {
    await fsp.unlink(
      filePath,
    );
  } catch (error) {
    const e =
      error as NodeJS.ErrnoException;

    if (
      e.code !==
      "ENOENT"
    ) {
      console.warn(
        "Could not delete:",
        filePath,
        e.message,
      );
    }
  }
}

// =====================================================
// DETECT IMAGE FORMAT
// =====================================================

function detectImageExtension(
  buffer: Buffer,
): ".png" | ".jpg" | ".webp" {
  // PNG
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return ".png";
  }

  // JPEG
  if (
    buffer.length >= 2 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8
  ) {
    return ".jpg";
  }

  // WEBP
  if (
    buffer.length >= 12 &&
    buffer
      .subarray(
        0,
        4,
      )
      .toString(
        "ascii",
      ) ===
      "RIFF" &&
    buffer
      .subarray(
        8,
        12,
      )
      .toString(
        "ascii",
      ) ===
      "WEBP"
  ) {
    return ".webp";
  }

  throw new Error(
    "Unsupported image format. Use PNG, JPG or WEBP.",
  );
}

// =====================================================
// PNG DIMENSIONS
// =====================================================

function readPngDimensions(
  buffer: Buffer,
): ImageDimensions | null {
  if (
    buffer.length < 24
  ) {
    return null;
  }

  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;

  if (!isPng) {
    return null;
  }

  const width =
    buffer.readUInt32BE(
      16,
    );

  const height =
    buffer.readUInt32BE(
      20,
    );

  return {
    width,
    height,
  };
}

// =====================================================
// JPEG DIMENSIONS
// =====================================================

function readJpegDimensions(
  buffer: Buffer,
): ImageDimensions | null {
  if (
    buffer.length < 4 ||
    buffer[0] !== 0xff ||
    buffer[1] !== 0xd8
  ) {
    return null;
  }

  const sofMarkers =
    new Set([
      0xc0,
      0xc1,
      0xc2,
      0xc3,

      0xc5,
      0xc6,
      0xc7,

      0xc9,
      0xca,
      0xcb,

      0xcd,
      0xce,
      0xcf,
    ]);

  let offset =
    2;

  while (
    offset + 9 <
    buffer.length
  ) {
    if (
      buffer[offset] !==
      0xff
    ) {
      offset++;

      continue;
    }

    while (
      offset <
        buffer.length &&
      buffer[offset] ===
        0xff
    ) {
      offset++;
    }

    if (
      offset >=
      buffer.length
    ) {
      break;
    }

    const marker =
      buffer[offset];

    offset++;

    if (
      marker ===
      0xda
    ) {
      break;
    }

    if (
      marker === 0xd8 ||
      marker === 0xd9 ||
      (
        marker >= 0xd0 &&
        marker <= 0xd7
      )
    ) {
      continue;
    }

    if (
      offset + 2 >
      buffer.length
    ) {
      break;
    }

    const segmentLength =
      buffer.readUInt16BE(
        offset,
      );

    if (
      segmentLength < 2
    ) {
      break;
    }

    if (
      sofMarkers.has(
        marker,
      )
    ) {
      if (
        offset + 7 >=
        buffer.length
      ) {
        break;
      }

      const height =
        buffer.readUInt16BE(
          offset + 3,
        );

      const width =
        buffer.readUInt16BE(
          offset + 5,
        );

      return {
        width,
        height,
      };
    }

    offset +=
      segmentLength;
  }

  return null;
}

// =====================================================
// WEBP DIMENSIONS
// =====================================================

function readWebpDimensions(
  buffer: Buffer,
): ImageDimensions | null {
  if (
    buffer.length < 30
  ) {
    return null;
  }

  const riff =
    buffer
      .subarray(
        0,
        4,
      )
      .toString(
        "ascii",
      );

  const webp =
    buffer
      .subarray(
        8,
        12,
      )
      .toString(
        "ascii",
      );

  if (
    riff !== "RIFF" ||
    webp !== "WEBP"
  ) {
    return null;
  }

  const type =
    buffer
      .subarray(
        12,
        16,
      )
      .toString(
        "ascii",
      );

  // WEBP Extended
  if (
    type === "VP8X"
  ) {
    const width =
      1 +
      buffer.readUIntLE(
        24,
        3,
      );

    const height =
      1 +
      buffer.readUIntLE(
        27,
        3,
      );

    return {
      width,
      height,
    };
  }

  // WEBP Lossless
  if (
    type === "VP8L" &&
    buffer.length >= 25 &&
    buffer[20] === 0x2f
  ) {
    const b0 =
      buffer[21];

    const b1 =
      buffer[22];

    const b2 =
      buffer[23];

    const b3 =
      buffer[24];

    const width =
      1 +
      b0 +
      (
        (b1 & 0x3f) <<
        8
      );

    const height =
      1 +
      (
        (b1 & 0xc0) >>
        6
      ) +
      (b2 << 2) +
      (
        (b3 & 0x0f) <<
        10
      );

    return {
      width,
      height,
    };
  }

  // WEBP Lossy
  if (
    type === "VP8 "
  ) {
    for (
      let i = 20;
      i <
      Math.min(
        buffer.length - 7,
        100,
      );
      i++
    ) {
      if (
        buffer[i] === 0x9d &&
        buffer[i + 1] === 0x01 &&
        buffer[i + 2] === 0x2a
      ) {
        const width =
          buffer.readUInt16LE(
            i + 3,
          ) &
          0x3fff;

        const height =
          buffer.readUInt16LE(
            i + 5,
          ) &
          0x3fff;

        return {
          width,
          height,
        };
      }
    }
  }

  return null;
}

// =====================================================
// DIMENSIONS FROM BUFFER
// =====================================================

function getImageDimensionsFromBuffer(
  buffer: Buffer,
): ImageDimensions {
  const png =
    readPngDimensions(
      buffer,
    );

  if (png) {
    return png;
  }

  const jpeg =
    readJpegDimensions(
      buffer,
    );

  if (jpeg) {
    return jpeg;
  }

  const webp =
    readWebpDimensions(
      buffer,
    );

  if (webp) {
    return webp;
  }

  throw new Error(
    "Could not read image dimensions",
  );
}

// =====================================================
// DIMENSIONS FROM FILE
// =====================================================

async function getImageDimensionsFromFile(
  filePath: string,
): Promise<ImageDimensions> {
  const fileBuffer =
    await fsp.readFile(
      filePath,
    );

  return getImageDimensionsFromBuffer(
    fileBuffer,
  );
}

// =====================================================
// QUALITY CHECK
// =====================================================

function checkPanoramaQuality(
  buffer: Buffer,
  width: number,
  height: number,
  isPanorama360: boolean,
) {
  const megapixels =
    (
      width *
      height
    ) /
    1_000_000;

  const fileSizeMB =
    buffer.length /
    1024 /
    1024;

  const mbPerMegapixel =
    megapixels > 0
      ? fileSizeMB /
        megapixels
      : 0;

  // High resolution threshold
  const highResolution =
    width >= 7000 &&
    height >= 3500 &&
    isPanorama360;

  /*
    IMPORTANT:
    This is a lightweight quality heuristic.

    It does NOT visually understand blur.

    A very large image with extremely
    little data per megapixel is likely
    compressed / low-detail.

    0.35 is deliberately conservative
    to avoid unnecessarily processing
    good panoramas.
  */

  const qualityLooksLow =
    mbPerMegapixel <
    0.35;

  return {
    megapixels,
    fileSizeMB,
    mbPerMegapixel,

    highResolution,

    qualityLooksLow,
  };
}

// =====================================================
// CHOOSE AI SCALE
// =====================================================

function chooseUpscaleScale(
  width: number,
  height: number,
) {
  const largest =
    Math.max(
      width,
      height,
    );

  /*
    Examples:

    2048x1024
       ↓ x4
    8192x4096


    4096x2048
       ↓ x2
    8192x4096


    High-resolution but poor-quality:
    Real-ESRGAN uses x2.
  */

  if (
    largest >= 3500
  ) {
    return 2;
  }

  return 4;
}

// =====================================================
// RUN REAL-ESRGAN
// =====================================================

function runRealESRGAN(
  inputPath: string,
  outputPath: string,
  tileSize: number,
  scale: number,
): Promise<void> {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      // Check EXE
      if (
        !fs.existsSync(
          REALESRGAN_EXE,
        )
      ) {
        reject(
          new Error(
            `Real-ESRGAN executable not found: ${REALESRGAN_EXE}`,
          ),
        );

        return;
      }

      // Check models folder
      if (
        !fs.existsSync(
          REALESRGAN_MODELS_DIR,
        )
      ) {
        reject(
          new Error(
            `Real-ESRGAN models directory not found: ${REALESRGAN_MODELS_DIR}`,
          ),
        );

        return;
      }

      const modelParam =
        path.join(
          REALESRGAN_MODELS_DIR,
          "realesrgan-x4plus.param",
        );

      const modelBin =
        path.join(
          REALESRGAN_MODELS_DIR,
          "realesrgan-x4plus.bin",
        );

      if (
        !fs.existsSync(
          modelParam,
        ) ||
        !fs.existsSync(
          modelBin,
        )
      ) {
        reject(
          new Error(
            "realesrgan-x4plus model files are missing",
          ),
        );

        return;
      }

      console.log(
        "=================================",
      );

      console.log(
        "REAL-ESRGAN START",
      );

      console.log(
        `Input: ${inputPath}`,
      );

      console.log(
        `Output: ${outputPath}`,
      );

      console.log(
        `Models: ${REALESRGAN_MODELS_DIR}`,
      );

      console.log(
        `Model: realesrgan-x4plus`,
      );

      console.log(
        `Scale: x${scale}`,
      );

      console.log(
        `Tile: ${tileSize}`,
      );

      console.log(
        "GPU: 0",
      );

      console.log(
        "=================================",
      );

      const args = [
        "-i",
        inputPath,

        "-o",
        outputPath,

        "-m",
        REALESRGAN_MODELS_DIR,

        "-n",
        "realesrgan-x4plus",

        "-s",
        String(
          scale,
        ),

        "-t",
        String(
          tileSize,
        ),

        "-g",
        "0",

        "-f",
        "png",
      ];

      const aiProcess =
        spawn(
          REALESRGAN_EXE,
          args,
          {
            windowsHide:
              false,
          },
        );

      let stderrOutput =
        "";

      aiProcess.stdout.on(
        "data",
        (
          data,
        ) => {
          console.log(
            data.toString(),
          );
        },
      );

      aiProcess.stderr.on(
        "data",
        (
          data,
        ) => {
          const text =
            data.toString();

          stderrOutput +=
            text;

          console.log(
            text,
          );
        },
      );

      aiProcess.on(
        "error",
        (
          error,
        ) => {
          reject(
            error,
          );
        },
      );

      aiProcess.on(
        "close",
        (
          code,
        ) => {
          if (
            code === 0 &&
            fs.existsSync(
              outputPath,
            )
          ) {
            console.log(
              "REAL-ESRGAN COMPLETED SUCCESSFULLY",
            );

            resolve();

            return;
          }

          reject(
            new Error(
              `Real-ESRGAN failed with code ${code}. ${stderrOutput}`,
            ),
          );
        },
      );
    },
  );
}

// =====================================================
// REAL-ESRGAN TILE FALLBACK
// =====================================================

async function runRealESRGANWithFallback(
  inputPath: string,
  outputPath: string,
  scale: number,
) {
  const tiles = [
    128,
    64,
    32,
  ];

  let lastError:
    Error | null =
    null;

  for (
    const tile
    of tiles
  ) {
    await safeDelete(
      outputPath,
    );

    try {
      console.log(
        `Trying Real-ESRGAN tile ${tile}...`,
      );

      await runRealESRGAN(
        inputPath,
        outputPath,
        tile,
        scale,
      );

      return;
    } catch (error) {
      lastError =
        error as Error;

      console.warn(
        `Real-ESRGAN tile ${tile} failed:`,
        lastError.message,
      );
    }
  }

  throw (
    lastError ??
    new Error(
      "Real-ESRGAN failed",
    )
  );
}

// =====================================================
// MAIN PANORAMA PIPELINE
// =====================================================

export async function enhancePanoramaBuffer(
  inputBuffer: Buffer,
): Promise<Buffer> {
  ensureDirs();

    if (!ENABLE_REALESRGAN) {
    console.log("=================================");
    console.log("REAL-ESRGAN DISABLED");
    console.log("USING ORIGINAL PANORAMA");
    console.log("=================================");

    return inputBuffer;
  }
  // ---------------------------------
  // Read original information
  // ---------------------------------

  const original =
    getImageDimensionsFromBuffer(
      inputBuffer,
    );

  const originalAnalysis =
    analyzeImage(
      original.width,
      original.height,
    );

  const qualityCheck =
    checkPanoramaQuality(
      inputBuffer,
      original.width,
      original.height,
      originalAnalysis.isPanorama360,
    );

  console.log(
    "=================================",
  );

  console.log(
    "PANORAMA QUALITY CHECK",
  );

  console.log(
    `Resolution: ${original.width}x${original.height}`,
  );

  console.log(
    `Ratio: ${originalAnalysis.ratio}`,
  );

  console.log(
    `360 panorama: ${originalAnalysis.isPanorama360}`,
  );

  console.log(
    `Megapixels: ${qualityCheck.megapixels.toFixed(2)} MP`,
  );

  console.log(
    `File size: ${qualityCheck.fileSizeMB.toFixed(2)} MB`,
  );

  console.log(
    `MB/MP: ${qualityCheck.mbPerMegapixel.toFixed(3)}`,
  );

  console.log(
    `High resolution: ${qualityCheck.highResolution}`,
  );

  console.log(
    `Quality looks low: ${qualityCheck.qualityLooksLow}`,
  );

  console.log(
    "=================================",
  );

  // ===================================================
  // HIGH RESOLUTION + GOOD QUALITY
  // SKIP REAL-ESRGAN
  // ===================================================

  if (
    qualityCheck.highResolution &&
    !qualityCheck.qualityLooksLow
  ) {
    console.log(
      "=================================",
    );

    console.log(
      "PANORAMA ALREADY HIGH QUALITY",
    );

    console.log(
      `Resolution: ${original.width}x${original.height}`,
    );

    console.log(
      "SKIPPING REAL-ESRGAN",
    );

    console.log(
      "USING ORIGINAL PANORAMA",
    );

    console.log(
      "=================================",
    );

    return inputBuffer;
  }

  // ===================================================
  // LOW RESOLUTION OR SUSPECTED QUALITY
  // RUN REAL-ESRGAN
  // ===================================================

  console.log(
    "QUALITY ENHANCEMENT REQUIRED",
  );

  const scale =
    chooseUpscaleScale(
      original.width,
      original.height,
    );

  const jobId =
    crypto.randomUUID();

  const extension =
    detectImageExtension(
      inputBuffer,
    );

  const inputPath =
    path.join(
      UPLOADS_DIR,
      `${jobId}-input${extension}`,
    );

  const outputPath =
    path.join(
      ENHANCED_DIR,
      `${jobId}-realesrgan.png`,
    );

  try {
    console.log(
      "=================================",
    );

    console.log(
      "REAL-ESRGAN PANORAMA PIPELINE",
    );

    console.log(
      "NO SHARP",
    );

    console.log(
      `Original resolution: ${original.width}x${original.height}`,
    );

    console.log(
      `Original ratio: ${originalAnalysis.ratio}`,
    );

    console.log(
      `360 panorama: ${originalAnalysis.isPanorama360}`,
    );

    console.log(
      `Selected AI scale: x${scale}`,
    );

    console.log(
      `Input size: ${(inputBuffer.length / 1024 / 1024).toFixed(2)} MB`,
    );

    console.log(
      "=================================",
    );

    // Save original temporary file
    await fsp.writeFile(
      inputPath,
      inputBuffer,
    );

    // Run AI
    await runRealESRGANWithFallback(
      inputPath,
      outputPath,
      scale,
    );

    // Confirm output exists
    if (
      !fs.existsSync(
        outputPath,
      )
    ) {
      throw new Error(
        "Real-ESRGAN output was not created",
      );
    }

    // Read enhanced output
    const finalBuffer =
      await fsp.readFile(
        outputPath,
      );

    const finalDimensions =
      getImageDimensionsFromBuffer(
        finalBuffer,
      );

    const finalAnalysis =
      analyzeImage(
        finalDimensions.width,
        finalDimensions.height,
      );

    console.log(
      "=================================",
    );

    console.log(
      "REAL-ESRGAN RESULT",
    );

    console.log(
      `Before: ${original.width}x${original.height}`,
    );

    console.log(
      `After: ${finalDimensions.width}x${finalDimensions.height}`,
    );

    console.log(
      `Ratio: ${finalAnalysis.ratio}`,
    );

    console.log(
      `360 ready: ${finalAnalysis.isPanorama360}`,
    );

    console.log(
      `Quality: ${finalAnalysis.quality}`,
    );

    console.log(
      `Output size: ${(finalBuffer.length / 1024 / 1024).toFixed(2)} MB`,
    );

    console.log(
      "=================================",
    );

    return finalBuffer;
  } catch (error) {
    console.error(
      "REAL-ESRGAN PANORAMA ERROR:",
      error,
    );

    // IMPORTANT:
    // Do NOT return original image.
    // We stop the pipeline.
    throw error;
  } finally {
    await safeDelete(
      inputPath,
    );

    await safeDelete(
      outputPath,
    );
  }
}

// =====================================================
// PROCESS UPLOADED IMAGE
// =====================================================

async function processImage(
  file: IncomingFile,
): Promise<AiImage> {
  ensureDirs();

  const inputBuffer =
    await fsp.readFile(
      file.path,
    );

  const dimensions =
    getImageDimensionsFromBuffer(
      inputBuffer,
    );

  const analysis =
    analyzeImage(
      dimensions.width,
      dimensions.height,
    );

  const quality =
    checkPanoramaQuality(
      inputBuffer,
      dimensions.width,
      dimensions.height,
      analysis.isPanorama360,
    );

  // Already good
  if (
    quality.highResolution &&
    !quality.qualityLooksLow
  ) {
    return {
      id:
        file.filename,

      originalName:
        file.originalname,

      filename:
        file.filename,

      path:
        `/files/uploads/${file.filename}`,

      processed:
        false,

      processor:
        "original",

      enhancement:
        "Not required",

      ...analysis,
    };
  }

  const finalBuffer =
    await enhancePanoramaBuffer(
      inputBuffer,
    );

  const finalDimensions =
    getImageDimensionsFromBuffer(
      finalBuffer,
    );

  const finalAnalysis =
    analyzeImage(
      finalDimensions.width,
      finalDimensions.height,
    );

  const baseName =
    path.parse(
      file.filename,
    ).name;

  const finalFilename =
    `${baseName}-realesrgan.png`;

  const finalPath =
    path.join(
      ENHANCED_DIR,
      finalFilename,
    );

  await fsp.writeFile(
    finalPath,
    finalBuffer,
  );

  return {
    id:
      finalFilename,

    originalName:
      file.originalname,

    filename:
      finalFilename,

    path:
      `/files/enhanced/${finalFilename}`,

    processed:
      true,

    processor:
      "real-esrgan",

    enhancement:
      "Real-ESRGAN",

    ...finalAnalysis,
  };
}

// =====================================================
// HANDLE UPLOAD
// =====================================================

export async function handleUpload(
  request: Request,
): Promise<Response> {
  ensureDirs();

  const contentType =
    request.headers.get(
      "content-type",
    ) ??
    "";

  if (
    !contentType
      .toLowerCase()
      .includes(
        "multipart/form-data",
      )
  ) {
    return Response.json(
      {
        success:
          false,

        message:
          "Expected multipart/form-data",
      },
      {
        status:
          400,
      },
    );
  }

  let files:
    File[];

  try {
    const formData =
      await request.formData();

    files =
      formData
        .getAll(
          "images",
        )
        .filter(
          (
            file,
          ): file is File =>
            file instanceof
            File,
        );
  } catch (error) {
    return Response.json(
      {
        success:
          false,

        message:
          `Invalid upload: ${(error as Error).message}`,
      },
      {
        status:
          400,
      },
    );
  }

  if (
    !files.length
  ) {
    return Response.json(
      {
        success:
          false,

        message:
          "No images uploaded",
      },
      {
        status:
          400,
      },
    );
  }

  const results:
    AiImage[] =
    [];

  for (
    const file
    of files
  ) {
    const fileBuffer =
      Buffer.from(
        await file.arrayBuffer(),
      );

    let extension:
      ".png" |
      ".jpg" |
      ".webp";

    try {
      extension =
        detectImageExtension(
          fileBuffer,
        );
    } catch {
      results.push({
        id:
          file.name,

        originalName:
          file.name,

        processed:
          false,

        error:
          "Unsupported image format",
      });

      continue;
    }

    const random =
      Math.random()
        .toString(
          36,
        )
        .slice(
          2,
          8,
        );

    const uploadName =
      `${Date.now()}-${random}${extension}`;

    const uploadPath =
      path.join(
        UPLOADS_DIR,
        uploadName,
      );

    await fsp.writeFile(
      uploadPath,
      fileBuffer,
    );

    try {
      const result =
        await processImage({
          path:
            uploadPath,

          filename:
            uploadName,

          originalname:
            file.name,
        });

      results.push(
        result,
      );
    } catch (error) {
      console.error(
        "Real-ESRGAN processing error:",
        error,
      );

      results.push({
        id:
          uploadName,

        originalName:
          file.name,

        filename:
          uploadName,

        path:
          `/files/uploads/${uploadName}`,

        processed:
          false,

        processor:
          "original",

        error:
          (
            error as Error
          ).message,
      });
    }
  }

  return Response.json({
    success:
      true,

    count:
      results.length,

    images:
      results,
  });
}

// =====================================================
// LIST IMAGES
// =====================================================

export async function handleListImages():
  Promise<Response> {
  ensureDirs();

  async function listDir(
    dir: string,
    urlPrefix: string,
  ): Promise<AiImage[]> {
    const images:
      AiImage[] =
    [];

    if (
      !fs.existsSync(
        dir,
      )
    ) {
      return images;
    }

    const filenames =
      fs
        .readdirSync(
          dir,
        )
        .filter(
          (
            filename,
          ) =>
            /\.(jpg|jpeg|png|webp)$/i.test(
              filename,
            ),
        );

    for (
      const filename
      of filenames
    ) {
      const filePath =
        path.join(
          dir,
          filename,
        );

      try {
        const buffer =
          await fsp.readFile(
            filePath,
          );

        const dimensions =
          getImageDimensionsFromBuffer(
            buffer,
          );

        const stats =
          fs.statSync(
            filePath,
          );

        const isRealESRGAN =
          filename.includes(
            "realesrgan",
          );

        images.push({
          id:
            filename,

          originalName:
            filename,

          filename,

          path:
            `${urlPrefix}/${filename}`,

          processed:
            isRealESRGAN,

          processor:
            isRealESRGAN
              ? "real-esrgan"
              : "original",

          enhancement:
            isRealESRGAN
              ? "Real-ESRGAN"
              : undefined,

          time:
            stats.mtimeMs,

          ...analyzeImage(
            dimensions.width,
            dimensions.height,
          ),
        });
      } catch (error) {
        console.error(
          `Invalid image skipped: ${filename}`,
          (
            error as Error
          ).message,
        );
      }
    }

    return images;
  }

  const images = [
    ...(
      await listDir(
        DOWNLOADS_DIR,
        "/files/downlod",
      )
    ),

    ...(
      await listDir(
        ENHANCED_DIR,
        "/files/enhanced",
      )
    ),
  ];

  images.sort(
    (
      a,
      b,
    ) =>
      (
        b.time ??
        0
      ) -
      (
        a.time ??
        0
      ),
  );

  return Response.json({
    success:
      true,

    images,
  });
}

// =====================================================
// DELETE WITH RETRY
// =====================================================

async function deleteWithRetry(
  filePath: string,
  retries = 10,
): Promise<boolean> {
  for (
    let attempt = 1;
    attempt <= retries;
    attempt++
  ) {
    try {
      await fsp.unlink(
        filePath,
      );

      return true;
    } catch (error) {
      const e =
        error as NodeJS.ErrnoException;

      if (
        e.code ===
        "ENOENT"
      ) {
        return true;
      }

      if (
        e.code !== "EBUSY" &&
        e.code !== "EPERM"
      ) {
        throw error;
      }

      console.log(
        `Delete retry ${attempt}/${retries}`,
      );

      await new Promise(
        (
          resolve,
        ) =>
          setTimeout(
            resolve,
            400,
          ),
      );
    }
  }

  return false;
}

// =====================================================
// DELETE IMAGE
// =====================================================

export async function handleDeleteImage(
  filename: string,
): Promise<Response> {
  ensureDirs();

  const safeName =
    path.basename(
      filename,
    );

  const filePath =
    path.join(
      ENHANCED_DIR,
      safeName,
    );

  if (
    !fs.existsSync(
      filePath,
    )
  ) {
    return Response.json(
      {
        success:
          false,

        message:
          "Image not found",
      },
      {
        status:
          404,
      },
    );
  }

  const deleted =
    await deleteWithRetry(
      filePath,
    );

  if (
    !deleted
  ) {
    return Response.json(
      {
        success:
          false,

        message:
          "Image is busy. Try again.",
      },
      {
        status:
          423,
      },
    );
  }

  return Response.json({
    success:
      true,

    filename:
      safeName,
  });
}

// =====================================================
// SERVE FILE
// =====================================================

export async function handleServeFile(
  splat: string,
): Promise<Response> {
  const isDownlod =
    splat.startsWith(
      "downlod/",
    );

  const root =
    isDownlod
      ? DOWNLOADS_DIR
      : STORAGE_ROOT;

  const relative =
    isDownlod
      ? splat.slice(
          "downlod/"
            .length,
        )
      : splat;

  const resolvedRoot =
    path.resolve(
      root,
    );

  const filePath =
    path.resolve(
      root,
      relative,
    );

  if (
    !filePath.startsWith(
      resolvedRoot,
    )
  ) {
    return new Response(
      "Not found",
      {
        status:
          404,
      },
    );
  }

  try {
    const stat =
      await fsp.stat(
        filePath,
      );

    if (
      !stat.isFile()
    ) {
      return new Response(
        "Not found",
        {
          status:
            404,
        },
      );
    }

    const ext =
      path
        .extname(
          filePath,
        )
        .toLowerCase();

    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : (
              ext === ".jpg" ||
              ext === ".jpeg"
            )
            ? "image/jpeg"
            : "application/octet-stream";

    const stream =
      fs.createReadStream(
        filePath,
      );

    const body =
      Readable.toWeb(
        stream,
      ) as unknown as ReadableStream;

    return new Response(
      body,
      {
        headers: {
          "content-type":
            contentType,

          "content-length":
            String(
              stat.size,
            ),

          "cache-control":
            "public, max-age=3600",
        },
      },
    );
  } catch {
    return new Response(
      "Not found",
      {
        status:
          404,
      },
    );
  }
}

// =====================================================
// HEALTH
// =====================================================

export function getAiHealth() {
  const executableReady =
    fs.existsSync(
      REALESRGAN_EXE,
    );

  const modelsReady =
    fs.existsSync(
      REALESRGAN_MODELS_DIR,
    );

  const x4Param =
    path.join(
      REALESRGAN_MODELS_DIR,
      "realesrgan-x4plus.param",
    );

  const x4Bin =
    path.join(
      REALESRGAN_MODELS_DIR,
      "realesrgan-x4plus.bin",
    );

  const modelReady =
    fs.existsSync(
      x4Param,
    ) &&
    fs.existsSync(
      x4Bin,
    );

  const ready =
    executableReady &&
    modelsReady &&
    modelReady;

  return {
    ok:
      true,

    ready,

    processor:
      "real-esrgan",

    sharp:
      false,

    aiModel:
      true,

    model:
      "realesrgan-x4plus",

    gpu:
      0,

    executable:
      REALESRGAN_EXE,

    modelsDirectory:
      REALESRGAN_MODELS_DIR,

    executableReady,

    modelsReady,

    modelReady,

    pipeline:
      "Quality check -> optional Real-ESRGAN -> Supabase",
  };
}