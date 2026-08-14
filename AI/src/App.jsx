import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import * as THREE from 'three'
import { VRButton } from 'three/addons/webxr/VRButton.js'
import './App.css'

// Same-origin: the app is served from the VR project's localhost, which
// proxies /api/* to the AI backend.
const API_URL = import.meta.env.VITE_API_URL || ''

function PanoramaViewer({ imageUrl }) {
  const mountRef = useRef(null)

  useEffect(() => {
    if (!imageUrl || !mountRef.current) {
      return
    }

    const container = mountRef.current

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.01,
      200
    )

    camera.position.set(0, 0, 0)

    // Group li ghadi n7rko f VR
    const playerRig = new THREE.Group()
    playerRig.add(camera)
    scene.add(playerRig)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    })

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    )

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    )

    renderer.outputColorSpace = THREE.SRGBColorSpace

    renderer.xr.enabled = true
    renderer.xr.setReferenceSpaceType('local')

    container.appendChild(
      renderer.domElement
    )

    // Controllers dyal Meta Quest
    const controller1 =
      renderer.xr.getController(0)

    const controller2 =
      renderer.xr.getController(1)

    playerRig.add(controller1)
    playerRig.add(controller2)

    // ENTER VR button
    const vrButton =
      VRButton.createButton(renderer)

    vrButton.id = 'vr-button'

    vrButton.style.position = 'absolute'
    vrButton.style.left = '50%'
    vrButton.style.bottom = '32px'
    vrButton.style.transform =
      'translateX(-50%)'
    vrButton.style.width = '220px'
    vrButton.style.height = '58px'
    vrButton.style.fontSize = '20px'
    vrButton.style.fontWeight = '700'
    vrButton.style.zIndex = '9999'

    container.appendChild(vrButton)

    // 360 sphere
    const PANORAMA_RADIUS = 20

    // movement limited bash tswira matetchewhch bzaaf
    const MAX_VR_MOVE = 3
    const VR_MOVE_SPEED = 0.035

    const geometry =
      new THREE.SphereGeometry(
        PANORAMA_RADIUS,
        96,
        64
      )

    geometry.scale(-1, 1, 1)

    const material =
      new THREE.MeshBasicMaterial({
        color: 0xffffff
      })

    const sphere =
      new THREE.Mesh(
        geometry,
        material
      )

    sphere.position.set(0, 0, 0)

    scene.add(sphere)

    // Load panorama
    const loader =
      new THREE.TextureLoader()

    loader.load(
      `${imageUrl}?v=${Date.now()}`,

      (texture) => {
        texture.colorSpace =
          THREE.SRGBColorSpace

        texture.anisotropy =
          renderer.capabilities
            .getMaxAnisotropy()

        texture.minFilter =
          THREE.LinearMipmapLinearFilter

        texture.magFilter =
          THREE.LinearFilter

        texture.generateMipmaps = true

        material.map = texture
        material.needsUpdate = true
      },

      undefined,

      (error) => {
        console.error(
          'Panorama load error:',
          error
        )
      }
    )

    // =========================
    // PC CONTROLS
    // =========================

    let isDragging = false

    let lon = 0
    let lat = 0

    let startX = 0
    let startY = 0

    let startLon = 0
    let startLat = 0

    let previousX = 0
    let previousY = 0

    let velocityX = 0
    let velocityY = 0

    const pointerDown = (event) => {
      if (renderer.xr.isPresenting) {
        return
      }

      isDragging = true

      startX = event.clientX
      startY = event.clientY

      previousX = event.clientX
      previousY = event.clientY

      startLon = lon
      startLat = lat

      if (
        renderer.domElement
          .setPointerCapture
      ) {
        renderer.domElement
          .setPointerCapture(
            event.pointerId
          )
      }
    }

    const pointerMove = (event) => {
      if (
        !isDragging ||
        renderer.xr.isPresenting
      ) {
        return
      }

      const deltaX =
        event.clientX - startX

      const deltaY =
        event.clientY - startY

      lon =
        startLon -
        deltaX * 0.12

      lat =
        startLat +
        deltaY * 0.12

      velocityX =
        event.clientX -
        previousX

      velocityY =
        event.clientY -
        previousY

      previousX =
        event.clientX

      previousY =
        event.clientY
    }

    const pointerUp = () => {
      isDragging = false
    }

    const wheel = (event) => {
      if (renderer.xr.isPresenting) {
        return
      }

      event.preventDefault()

      camera.fov +=
        event.deltaY * 0.03

      camera.fov =
        THREE.MathUtils.clamp(
          camera.fov,
          25,
          95
        )

      camera.updateProjectionMatrix()
    }

    renderer.domElement.addEventListener(
      'pointerdown',
      pointerDown
    )

    renderer.domElement.addEventListener(
      'pointermove',
      pointerMove
    )

    window.addEventListener(
      'pointerup',
      pointerUp
    )

    renderer.domElement.addEventListener(
      'wheel',
      wheel,
      {
        passive: false
      }
    )

    // =========================
    // META QUEST VR CONTROLS
    // =========================

    const resetVRPosition = () => {
      playerRig.position.set(
        0,
        0,
        0
      )
    }

    // Trigger = reset center
    controller1.addEventListener(
      'selectstart',
      resetVRPosition
    )

    controller2.addEventListener(
      'selectstart',
      resetVRPosition
    )

    const forward =
      new THREE.Vector3()

    const right =
      new THREE.Vector3()

    const up =
      new THREE.Vector3(
        0,
        1,
        0
      )

    const move =
      new THREE.Vector3()

    const horizontalPosition =
      new THREE.Vector2()

    const applyDeadZone = (
      value,
      deadZone = 0.15
    ) => {
      if (
        Math.abs(value) <
        deadZone
      ) {
        return 0
      }

      return value
    }

    const updateVRControls = () => {
      if (
        !renderer.xr.isPresenting
      ) {
        return
      }

      const session =
        renderer.xr.getSession()

      if (!session) {
        return
      }

      // Direction katsali mn fin nta katshof
      camera.getWorldDirection(
        forward
      )

      forward.y = 0

      if (
        forward.lengthSq() <
        0.0001
      ) {
        forward.set(
          0,
          0,
          -1
        )
      } else {
        forward.normalize()
      }

      right
        .crossVectors(
          forward,
          up
        )
        .normalize()

      move.set(
        0,
        0,
        0
      )

      for (
        const source of
        session.inputSources
      ) {
        if (
          !source.gamepad ||
          !source.gamepad.axes
        ) {
          continue
        }

        const axes =
          source.gamepad.axes

        const axisX =
          applyDeadZone(
            axes.length >= 4
              ? axes[2]
              : (axes[0] || 0)
          )

        const axisY =
          applyDeadZone(
            axes.length >= 4
              ? axes[3]
              : (axes[1] || 0)
          )

        // joystick left/right
        if (axisX !== 0) {
          move.addScaledVector(
            right,
            axisX *
              VR_MOVE_SPEED
          )
        }

        // joystick forward/back
        if (axisY !== 0) {
          move.addScaledVector(
            forward,
            -axisY *
              VR_MOVE_SPEED
          )
        }
      }

      playerRig.position.add(move)

      // limit movement
      horizontalPosition.set(
        playerRig.position.x,
        playerRig.position.z
      )

      if (
        horizontalPosition.length() >
        MAX_VR_MOVE
      ) {
        horizontalPosition.setLength(
          MAX_VR_MOVE
        )

        playerRig.position.x =
          horizontalPosition.x

        playerRig.position.z =
          horizontalPosition.y
      }

      // ma n7rkoch lfo9/ta7t
      playerRig.position.y = 0
    }

    // =========================
    // ANIMATION
    // =========================

    const animate = () => {
      updateVRControls()

      // PC only
      if (
        !renderer.xr.isPresenting
      ) {
        if (!isDragging) {
          lon -=
            velocityX * 0.02

          lat +=
            velocityY * 0.02

          velocityX *= 0.92
          velocityY *= 0.92
        }

        lat =
          Math.max(
            -85,
            Math.min(
              85,
              lat
            )
          )

        const phi =
          THREE.MathUtils.degToRad(
            90 - lat
          )

        const theta =
          THREE.MathUtils.degToRad(
            lon
          )

        const x =
          PANORAMA_RADIUS *
          Math.sin(phi) *
          Math.cos(theta)

        const y =
          PANORAMA_RADIUS *
          Math.cos(phi)

        const z =
          PANORAMA_RADIUS *
          Math.sin(phi) *
          Math.sin(theta)

        camera.lookAt(
          x,
          y,
          z
        )
      }

      // VR:
      // Quest headset kay7kem f rotation
      renderer.render(
        scene,
        camera
      )
    }

    renderer.setAnimationLoop(
      animate
    )

    // =========================
    // RESIZE
    // =========================

    const resize = () => {
      if (
        !container.clientWidth ||
        !container.clientHeight
      ) {
        return
      }

      camera.aspect =
        container.clientWidth /
        container.clientHeight

      camera.updateProjectionMatrix()

      renderer.setSize(
        container.clientWidth,
        container.clientHeight
      )
    }

    window.addEventListener(
      'resize',
      resize
    )

    // =========================
    // CLEANUP
    // =========================

    return () => {
      renderer.setAnimationLoop(
        null
      )

      window.removeEventListener(
        'resize',
        resize
      )

      window.removeEventListener(
        'pointerup',
        pointerUp
      )

      renderer.domElement
        .removeEventListener(
          'pointerdown',
          pointerDown
        )

      renderer.domElement
        .removeEventListener(
          'pointermove',
          pointerMove
        )

      renderer.domElement
        .removeEventListener(
          'wheel',
          wheel
        )

      controller1
        .removeEventListener(
          'selectstart',
          resetVRPosition
        )

      controller2
        .removeEventListener(
          'selectstart',
          resetVRPosition
        )

      if (material.map) {
        material.map.dispose()
      }

      geometry.dispose()
      material.dispose()

      renderer.dispose()

      if (
        vrButton.parentNode ===
        container
      ) {
        container.removeChild(
          vrButton
        )
      }

      if (
        renderer.domElement
          .parentNode ===
        container
      ) {
        container.removeChild(
          renderer.domElement
        )
      }
    }
  }, [imageUrl])

  return (
    <div
      ref={mountRef}
      className="panorama-viewer"
      style={{
        position: 'relative'
      }}
    />
  )
}

function App() {
  const [
    images,
    setImages
  ] = useState([])

  const [
    selectedIndex,
    setSelectedIndex
  ] = useState(0)

  const [
    uploading,
    setUploading
  ] = useState(false)

  const [
    newImageMessage,
    setNewImageMessage
  ] = useState('')

  const fileInputRef =
    useRef(null)

  const lastNewestImageRef =
    useRef(null)

  const loadImages =
    async (
      autoOpenNew = false
    ) => {
      try {
        const response =
          await axios.get(
            `${API_URL}/api/images`
          )

        const loaded =
          response.data.images || []

        const newestImage =
          loaded.length
            ? loaded[0]
            : null

        if (
          autoOpenNew &&
          newestImage &&
          lastNewestImageRef.current &&
          newestImage.id !==
            lastNewestImageRef.current
        ) {
          setSelectedIndex(0)

          setNewImageMessage(
            'New 360 panorama received and processed ✓'
          )

          setTimeout(() => {
            setNewImageMessage('')
          }, 5000)
        }

        if (newestImage) {
          lastNewestImageRef.current =
            newestImage.id
        }

        setImages(loaded)

        setSelectedIndex(
          (current) => {
            if (!loaded.length) {
              return 0
            }

            if (
              current >=
              loaded.length
            ) {
              return (
                loaded.length - 1
              )
            }

            return current
          }
        )

      } catch (error) {
        console.error(
          'Load images error:',
          error
        )
      }
    }

  useEffect(() => {
    loadImages(false)

    const interval =
      setInterval(
        () => {
          loadImages(true)
        },
        3000
      )

    return () => {
      clearInterval(interval)
    }
  }, [])

  const handleUpload =
    async (event) => {
      const files =
        Array.from(
          event.target.files || []
        )

      if (!files.length) {
        return
      }

      const formData =
        new FormData()

      files.forEach(
        (file) => {
          formData.append(
            'images',
            file
          )
        }
      )

      try {
        setUploading(true)

        await axios.post(
          `${API_URL}/api/upload`,
          formData
        )

        await loadImages(true)

        event.target.value = ''

      } catch (error) {
        console.error(
          'Upload error:',
          error
        )

        alert(
          'AI processing failed. Check backend terminal.'
        )

      } finally {
        setUploading(false)
      }
    }

  const currentImage =
    images.length
      ? images[selectedIndex]
      : null

  const previousImage = () => {
    if (!images.length) {
      return
    }

    setSelectedIndex(
      (current) =>
        current === 0
          ? images.length - 1
          : current - 1
    )
  }

  const nextImage = () => {
    if (!images.length) {
      return
    }

    setSelectedIndex(
      (current) =>
        current ===
        images.length - 1
          ? 0
          : current + 1
    )
  }

  const deleteImage =
    async (
      event,
      image
    ) => {
      event.stopPropagation()

      const confirmed =
        window.confirm(
          'Delete this panorama?'
        )

      if (!confirmed) {
        return
      }

      try {
        await axios.delete(
          `${API_URL}/api/images/${encodeURIComponent(
            image.filename
          )}`
        )

        setSelectedIndex(0)

        await loadImages(false)

      } catch (error) {
        console.error(
          'Delete error:',
          error
        )

        if (
          error.response?.status ===
          423
        ) {
          alert(
            'Image is still busy. Try again in a few seconds.'
          )
        } else {
          alert(
            'Delete failed.'
          )
        }
      }
    }

  const openFullscreen =
    async () => {
      const viewer =
        document.querySelector(
          '.viewer-wrapper'
        )

      if (!viewer) {
        return
      }

      try {
        if (
          !document
            .fullscreenElement
        ) {
          await viewer
            .requestFullscreen()
        } else {
          await document
            .exitFullscreen()
        }

      } catch (error) {
        console.error(
          'Fullscreen error:',
          error
        )
      }
    }

  return (
    <div className="app">

      <header className="topbar">

        <div>
          <h1>
            Multi 360 Platform
          </h1>

          <p>
            Local AI 8K Panorama Studio
          </p>
        </div>

        <button
          type="button"
          className="upload-btn"
          disabled={uploading}
          onClick={() =>
            fileInputRef
              .current
              ?.click()
          }
        >
          {uploading
            ? 'AI Processing...'
            : '+ Upload Images'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleUpload}
        />

      </header>

      {uploading && (
        <div className="processing">
          Real-ESRGAN is processing the panorama...
        </div>
      )}

      {newImageMessage && (
        <div className="processing">
          {newImageMessage}
        </div>
      )}

      <div className="thumbnails">

        {images.map(
          (image, index) => (
            <div
              key={image.id}
              className={
                index ===
                selectedIndex
                  ? 'thumbnail active'
                  : 'thumbnail'
              }
              onClick={() =>
                setSelectedIndex(
                  index
                )
              }
            >

              <img
                src={`${API_URL}${image.path}`}
                alt={
                  image.originalName ||
                  ''
                }
              />

              <div className="thumbnail-info">

                <strong>
                  Panorama {index + 1}
                </strong>

                <span>
                  {image.width}
                  {' × '}
                  {image.height}
                </span>

                <span>
                  {image.isPanorama360
                    ? '✓ 360 Ready'
                    : '⚠ Not 2:1'}
                </span>

                <span>
                  Quality:
                  {' '}
                  {image.quality}
                </span>

                <span className="ai-ready">
                  ✓ AI Enhanced
                </span>

              </div>

              <button
                type="button"
                className="delete-image"
                title="Delete panorama"
                onClick={(event) =>
                  deleteImage(
                    event,
                    image
                  )
                }
              >
                🗑
              </button>

            </div>
          )
        )}

      </div>

      <main className="viewer-area">

        {currentImage ? (

          <div className="viewer-wrapper">

            <PanoramaViewer
              imageUrl={
                `${API_URL}${currentImage.path}`
              }
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="nav-arrow left-arrow"
                  onClick={
                    previousImage
                  }
                >
                  ❮
                </button>

                <button
                  type="button"
                  className="nav-arrow right-arrow"
                  onClick={
                    nextImage
                  }
                >
                  ❯
                </button>
              </>
            )}

            <div className="viewer-top-controls">

              <button
                type="button"
                onClick={
                  openFullscreen
                }
              >
                ⛶ Fullscreen
              </button>

            </div>

            <div className="viewer-help">
              Drag to look around • Mouse wheel to zoom • ENTER VR for headset
            </div>

          </div>

        ) : (

          <div className="empty-viewer">

            <h2>
              Waiting for panorama...
            </h2>

            <p>
              Upload an image or wait for a new 360 panorama.
            </p>

          </div>

        )}

      </main>

      {currentImage && (
        <div className="bottom-info">

          <strong>
            Panorama
            {' '}
            {selectedIndex + 1}
            {' / '}
            {images.length}
          </strong>

          <span>
            {currentImage.width}
            {' × '}
            {currentImage.height}
          </span>

          <span>
            Ratio:
            {' '}
            {currentImage.ratio}
          </span>

          <span>
            {currentImage.isPanorama360
              ? '360 Ready ✓'
              : 'Not 2:1 ⚠'}
          </span>

          <span>
            Quality:
            {' '}
            {currentImage.quality}
          </span>

          <span className="ai-status">
            AI Enhanced ✓
          </span>

        </div>
      )}

    </div>
  )
}

export default App