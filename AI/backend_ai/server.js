const express = require('express')
const cors = require('cors')
const multer = require('multer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const app = express()

const PORT = process.env.PORT || 4000

const ROOT_DIR = path.join(__dirname, '..')

const STORAGE_DIR = path.join(
  ROOT_DIR,
  'storage'
)

const UPLOADS_DIR = path.join(
  STORAGE_DIR,
  'uploads'
)

const ENHANCED_DIR = path.join(
  STORAGE_DIR,
  'enhanced'
)

const FINAL_8K_DIR = path.join(
  STORAGE_DIR,
  'final_8k'
)

// Create folders automatically
fs.mkdirSync(
  UPLOADS_DIR,
  { recursive: true }
)

fs.mkdirSync(
  ENHANCED_DIR,
  { recursive: true }
)

fs.mkdirSync(
  FINAL_8K_DIR,
  { recursive: true }
)

// =============================
// EXPRESS CONFIG
// =============================

app.use(
  cors({
    origin: '*',
    methods: [
      'GET',
      'POST',
      'DELETE',
      'OPTIONS'
    ]
  })
)

app.use(
  express.json({
    limit: '10mb'
  })
)

app.use(
  '/files',
  express.static(
    STORAGE_DIR
  )
)

// =============================
// MULTER
// =============================

const storage = multer.diskStorage({

  destination: (
    req,
    file,
    cb
  ) => {
    cb(
      null,
      UPLOADS_DIR
    )
  },

  filename: (
    req,
    file,
    cb
  ) => {

    const ext =
      path.extname(
        file.originalname
      ) || '.jpg'

    const random =
      Math.random()
        .toString(36)
        .slice(2, 8)

    const filename =
      `${Date.now()}-${random}${ext}`

    cb(
      null,
      filename
    )
  }
})

const upload = multer({

  storage,

  limits: {
    fileSize:
      100 *
      1024 *
      1024
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {

    if (
      file.mimetype &&
      file.mimetype.startsWith(
        'image/'
      )
    ) {
      cb(
        null,
        true
      )

      return
    }

    cb(
      new Error(
        'Only image files are allowed'
      )
    )
  }
})

// =============================
// HELPERS
// =============================

function analyzeImage(
  width,
  height
) {

  const ratio =
    height > 0
      ? width / height
      : 0

  const ratioRounded =
    Number(
      ratio.toFixed(3)
    )

  const isPanorama360 =
    ratio >= 1.9 &&
    ratio <= 2.1

  let quality = 'low'

  if (
    width >= 7000 &&
    height >= 3500
  ) {
    quality = '8K'

  } else if (
    width >= 4000 &&
    height >= 2000
  ) {
    quality = 'high'

  } else if (
    width >= 2000 &&
    height >= 1000
  ) {
    quality = 'medium'
  }

  return {
    width,
    height,
    ratio: ratioRounded,
    isPanorama360,
    quality
  }
}

// =============================
// SHARP IMAGE PROCESSING
// =============================

async function processImage(
  file
) {

  const inputPath =
    file.path

  const baseName =
    path.parse(
      file.filename
    ).name

  console.log(
    `Processing with Sharp: ${file.originalname}`
  )

  const metadata =
    await sharp(
      inputPath
    ).metadata()

  const originalWidth =
    metadata.width || 0

  const originalHeight =
    metadata.height || 0

  if (
    !originalWidth ||
    !originalHeight
  ) {
    throw new Error(
      'Invalid image dimensions'
    )
  }

  const originalRatio =
    originalWidth /
    originalHeight

  const is360 =
    originalRatio >= 1.9 &&
    originalRatio <= 2.1

  let targetWidth
  let targetHeight

  // True 360 panorama
  if (is360) {

    targetWidth = 7680
    targetHeight = 3840

  } else {

    // Preserve original ratio
    targetWidth = 7680

    targetHeight =
      Math.round(
        targetWidth /
        originalRatio
      )

    // Safety limit
    if (
      targetHeight >
      7680
    ) {
      targetHeight = 7680

      targetWidth =
        Math.round(
          targetHeight *
          originalRatio
        )
    }
  }

  const finalFilename =
    `${baseName}-8k.jpg`

  const finalPath =
    path.join(
      ENHANCED_DIR,
      finalFilename
    )

  await sharp(
    inputPath,
    {
      sequentialRead: true
    }
  )
    .rotate()
    .resize({
      width:
        targetWidth,

      height:
        targetHeight,

      fit:
        'fill',

      kernel:
        sharp.kernel.lanczos3,

      withoutEnlargement:
        false
    })
    .sharpen({
      sigma: 1.1,
      m1: 1,
      m2: 2
    })
    .jpeg({
      quality: 92,
      chromaSubsampling:
        '4:4:4',
      mozjpeg: true
    })
    .toFile(
      finalPath
    )

  const finalMeta =
    await sharp(
      finalPath
    ).metadata()

  const finalWidth =
    finalMeta.width || 0

  const finalHeight =
    finalMeta.height || 0

  console.log(
    `Sharp completed: ${finalWidth}x${finalHeight}`
  )

  return {

    id:
      finalFilename,

    originalName:
      file.originalname,

    originalFile:
      file.filename,

    filename:
      finalFilename,

    path:
      `/files/enhanced/${finalFilename}`,

    processed:
      true,

    processor:
      'sharp',

    enhancement:
      'Lanczos3 + Sharpen',

    ...analyzeImage(
      finalWidth,
      finalHeight
    )
  }
}

// =============================
// HEALTH
// =============================

app.get(
  '/api/health',
  (req, res) => {

    res.json({
      ok: true,
      ready: true,
      processor: 'sharp',
      aiModel: false,
      gpuRequired: false
    })
  }
)

// =============================
// UPLOAD
// =============================

app.post(
  '/api/upload',

  upload.array(
    'images'
  ),

  async (
    req,
    res
  ) => {

    try {

      const files =
        req.files || []

      if (
        !files.length
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              'No images uploaded'
          })
      }

      const results = []

      // Sequential processing
      // safer for RAM / CPU
      for (
        let i = 0;
        i < files.length;
        i++
      ) {

        console.log(
          `Processing ${i + 1}/${files.length}`
        )

        try {

          const result =
            await processImage(
              files[i]
            )

          results.push(
            result
          )

        } catch (
          error
        ) {

          console.error(
            'Sharp processing error:',
            error
          )

          try {

            const meta =
              await sharp(
                files[i].path
              ).metadata()

            results.push({

              id:
                files[i]
                  .filename,

              originalName:
                files[i]
                  .originalname,

              filename:
                files[i]
                  .filename,

              path:
                `/files/uploads/${files[i].filename}`,

              processed:
                false,

              processor:
                'original',

              error:
                error.message,

              ...analyzeImage(
                meta.width ||
                  0,

                meta.height ||
                  0
              )
            })

          } catch (
            metadataError
          ) {

            results.push({

              id:
                files[i]
                  .filename,

              originalName:
                files[i]
                  .originalname,

              processed:
                false,

              error:
                error.message
            })
          }
        }
      }

      return res.json({

        success:
          true,

        count:
          results.length,

        images:
          results
      })

    } catch (
      error
    ) {

      console.error(
        'Upload error:',
        error
      )

      return res
        .status(500)
        .json({

          success:
            false,

          message:
            error.message
        })
    }
  }
)

// =============================
// LIST IMAGES
// =============================

app.get(
  '/api/images',

  async (
    req,
    res
  ) => {

    try {

      const filenames =
        fs
          .readdirSync(
            ENHANCED_DIR
          )
          .filter(
            filename =>
              /\.(jpg|jpeg|png|webp)$/i
                .test(
                  filename
                )
          )

      const images = []

      for (
        const filename
        of filenames
      ) {

        const filePath =
          path.join(
            ENHANCED_DIR,
            filename
          )

        try {

          const meta =
            await sharp(
              filePath
            ).metadata()

          const stats =
            fs.statSync(
              filePath
            )

          images.push({

            id:
              filename,

            originalName:
              filename,

            filename,

            path:
              `/files/enhanced/${filename}`,

            processed:
              true,

            processor:
              'sharp',

            time:
              stats.mtimeMs,

            ...analyzeImage(
              meta.width ||
                0,

              meta.height ||
                0
            )
          })

        } catch (
          error
        ) {

          console.error(
            `Invalid image skipped: ${filename}`,
            error.message
          )
        }
      }

      images.sort(
        (a, b) =>
          b.time -
          a.time
      )

      return res.json({
        success: true,
        images
      })

    } catch (
      error
    ) {

      console.error(
        'Load images error:',
        error
      )

      return res
        .status(500)
        .json({

          success:
            false,

          message:
            'Failed to load images'
        })
    }
  }
)

// =============================
// DELETE IMAGE
// =============================

async function deleteWithRetry(
  filePath,
  retries = 10
) {

  for (
    let attempt = 1;
    attempt <= retries;
    attempt++
  ) {

    try {

      await fs.promises.unlink(
        filePath
      )

      return true

    } catch (
      error
    ) {

      if (
        error.code ===
          'ENOENT'
      ) {
        return true
      }

      if (
        error.code !==
          'EBUSY' &&
        error.code !==
          'EPERM'
      ) {
        throw error
      }

      console.log(
        `Delete retry ${attempt}/${retries}`
      )

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            400
          )
      )
    }
  }

  return false
}

app.delete(
  '/api/images/:filename',

  async (
    req,
    res
  ) => {

    try {

      const filename =
        path.basename(
          req.params
            .filename
        )

      const filePath =
        path.join(
          ENHANCED_DIR,
          filename
        )

      if (
        !fs.existsSync(
          filePath
        )
      ) {
        return res
          .status(404)
          .json({

            success:
              false,

            message:
              'Image not found'
          })
      }

      const deleted =
        await deleteWithRetry(
          filePath
        )

      if (
        !deleted
      ) {
        return res
          .status(423)
          .json({

            success:
              false,

            message:
              'Image is busy. Try again.'
          })
      }

      return res.json({
        success: true,
        filename
      })

    } catch (
      error
    ) {

      console.error(
        'Delete error:',
        error
      )

      return res
        .status(500)
        .json({

          success:
            false,

          message:
            error.message
        })
    }
  }
)

// =============================
// 404
// =============================

app.use(
  (
    req,
    res
  ) => {

    res.status(
      404
    ).json({

      success:
        false,

      message:
        'Route not found'
    })
  }
)

// =============================
// ERROR HANDLER
// =============================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    console.error(
      'Server error:',
      error
    )

    if (
      error instanceof
      multer.MulterError
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            error.message
        })
    }

    return res
      .status(500)
      .json({

        success:
          false,

        message:
          error.message ||
          'Internal server error'
      })
  }
)

// =============================
// START SERVER
// =============================

app.listen(
  PORT,
  '0.0.0.0',
  () => {

    console.log(
      '================================='
    )

    console.log(
      'Multi 360 Backend'
    )

    console.log(
      `Server: http://localhost:${PORT}`
    )

    console.log(
      'Processor: Sharp'
    )

    console.log(
      'AI model: NONE'
    )

    console.log(
      'GPU required: NO'
    )

    console.log(
      'Target panorama: 7680x3840'
    )

    console.log(
      '================================='
    )
  }
)