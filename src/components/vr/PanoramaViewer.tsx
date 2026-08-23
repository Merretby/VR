import { useEffect, useRef } from "react";
import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";

const PANORAMA_RADIUS = 20;

export function PanoramaViewer({
  imageUrl,
  vrButtonId,
  alternateImageUrl,
  toggleLabel,
  toggleBackLabel,
}: {
  imageUrl: string;
  vrButtonId?: string | undefined;
  alternateImageUrl?: string | null;
  /** Label on the in-VR button while viewing the primary image (switches to the alternate). */
  toggleLabel?: string;
  /** Label on the in-VR button while viewing the alternate image (switches back). */
  toggleBackLabel?: string;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.01,
      200,
    );

    camera.position.set(0, 0, 0);

    const playerRig = new THREE.Group();
    playerRig.add(camera);
    scene.add(playerRig);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType("local");

    container.appendChild(renderer.domElement);

    // =====================================================
    // VR BUTTON
    // =====================================================

    const vrButton = VRButton.createButton(renderer);

    vrButton.id = vrButtonId ?? "vr-button";
    vrButton.style.position = "absolute";
    vrButton.style.left = "50%";
    vrButton.style.bottom = "32px";
    vrButton.style.transform = "translateX(-50%)";
    vrButton.style.width = "220px";
    vrButton.style.height = "58px";
    vrButton.style.fontSize = "20px";
    vrButton.style.fontWeight = "700";
    vrButton.style.zIndex = "9999";

    container.appendChild(vrButton);

    // =====================================================
    // PANORAMA
    // =====================================================

    const geometry = new THREE.SphereGeometry(PANORAMA_RADIUS, 96, 64);
    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    const loader = new THREE.TextureLoader();

    const configureTexture = (texture: THREE.Texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
    };

    let primaryTexture: THREE.Texture | null = null;
    let alternateTexture: THREE.Texture | null = null;

    loader.load(
      `${imageUrl}?v=${Date.now()}`,
      (texture) => {
        configureTexture(texture);
        primaryTexture = texture;
        material.map = texture;
        material.needsUpdate = true;
      },
      undefined,
      (error) => {
        console.error("Panorama load error:", error);
      },
    );

    if (alternateImageUrl) {
      loader.load(
        `${alternateImageUrl}?v=${Date.now()}`,
        (texture) => {
          configureTexture(texture);
          alternateTexture = texture;
        },
        undefined,
        (error) => {
          console.error("Alternate panorama load error:", error);
        },
      );
    }

    // =====================================================
    // DESKTOP LOOK AROUND
    // =====================================================

    let isDragging = false;

    let lon = 0;
    let lat = 0;

    let startX = 0;
    let startY = 0;

    let startLon = 0;
    let startLat = 0;

    let previousX = 0;
    let previousY = 0;

    let velocityX = 0;
    let velocityY = 0;

    const pointerDown = (event: PointerEvent) => {
      if (renderer.xr.isPresenting) return;

      isDragging = true;

      startX = event.clientX;
      startY = event.clientY;

      previousX = event.clientX;
      previousY = event.clientY;

      startLon = lon;
      startLat = lat;

      if (renderer.domElement.setPointerCapture) {
        renderer.domElement.setPointerCapture(event.pointerId);
      }
    };

    const pointerMove = (event: PointerEvent) => {
      if (!isDragging || renderer.xr.isPresenting) return;

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      lon = startLon - deltaX * 0.12;
      lat = startLat + deltaY * 0.12;

      velocityX = event.clientX - previousX;
      velocityY = event.clientY - previousY;

      previousX = event.clientX;
      previousY = event.clientY;
    };

    const pointerUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", pointerMove);

    window.addEventListener("pointerup", pointerUp);

    // =====================================================
    // FIXED "FERMER" BUTTON IN VR WORLD
    // =====================================================

    const closeCanvas = document.createElement("canvas");
    closeCanvas.width = 512;
    closeCanvas.height = 180;

    const ctx = closeCanvas.getContext("2d");

    if (ctx) {
      ctx.clearRect(0, 0, closeCanvas.width, closeCanvas.height);

      ctx.fillStyle = "rgba(15, 15, 15, 0.88)";
      ctx.beginPath();
      ctx.roundRect(10, 10, 492, 160, 35);
      ctx.fill();

      ctx.strokeStyle = "white";
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.fillStyle = "white";
      ctx.font = "bold 62px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(
        "FERMER",
        closeCanvas.width / 2,
        closeCanvas.height / 2,
      );
    }

    const closeTexture = new THREE.CanvasTexture(closeCanvas);
    closeTexture.colorSpace = THREE.SRGBColorSpace;

    const closeMaterial = new THREE.MeshBasicMaterial({
      map: closeTexture,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false,
    });

    const closeGeometry = new THREE.PlaneGeometry(2.8, 1);

    const closeButton = new THREE.Mesh(
      closeGeometry,
      closeMaterial,
    );

    /*
      IMPORTANT:
      Button fixe dans le monde.

      Il n'est PAS attaché à la caméra.

      Donc si tu tournes la tête:
      le bouton ne te suit pas.
    */

    closeButton.position.set(10, 4.2, -6.5);

    closeButton.lookAt(0, 1.5, 0);

    closeButton.visible = false;

    closeButton.renderOrder = 999;

    scene.add(closeButton);

    // =====================================================
    // FIXED "BEFORE / AFTER" TOGGLE BUTTON IN VR WORLD
    // =====================================================

    const hasToggle = Boolean(alternateImageUrl && toggleLabel);

    const toggleCanvas = document.createElement("canvas");
    toggleCanvas.width = 512;
    toggleCanvas.height = 180;

    const toggleCtx = toggleCanvas.getContext("2d");

    const toggleTexture = new THREE.CanvasTexture(toggleCanvas);
    toggleTexture.colorSpace = THREE.SRGBColorSpace;

    const toggleMaterial = new THREE.MeshBasicMaterial({
      map: toggleTexture,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false,
    });

    const toggleGeometry = new THREE.PlaneGeometry(2.8, 1);

    const toggleButton = new THREE.Mesh(
      toggleGeometry,
      toggleMaterial,
    );

    const primaryLabel = toggleBackLabel ?? "";

    const alternateLabel = toggleLabel ?? "";

    const drawToggleLabel = (label: string) => {
      if (!toggleCtx) return;

      toggleCtx.clearRect(0, 0, toggleCanvas.width, toggleCanvas.height);

      toggleCtx.fillStyle = "rgba(15, 15, 15, 0.88)";
      toggleCtx.beginPath();
      toggleCtx.roundRect(10, 10, 492, 160, 35);
      toggleCtx.fill();

      toggleCtx.strokeStyle = "white";
      toggleCtx.lineWidth = 5;
      toggleCtx.stroke();

      toggleCtx.fillStyle = "white";
      toggleCtx.font = "bold 62px Arial";
      toggleCtx.textAlign = "center";
      toggleCtx.textBaseline = "middle";

      toggleCtx.fillText(
        label,
        toggleCanvas.width / 2,
        toggleCanvas.height / 2,
      );

      toggleTexture.needsUpdate = true;
    };

    let showingPrimary = true;

    const togglePanorama = () => {
      if (!primaryTexture || !alternateTexture) return;

      showingPrimary = !showingPrimary;

      material.map = showingPrimary ? primaryTexture : alternateTexture;
      material.needsUpdate = true;

      drawToggleLabel(showingPrimary ? alternateLabel : primaryLabel);
    };

    toggleButton.position.set(13, 4.2, -6.5);

    toggleButton.lookAt(0, 1.5, 0);

    toggleButton.visible = false;

    toggleButton.renderOrder = 999;

    if (hasToggle) {
      drawToggleLabel(alternateLabel);
    }

    scene.add(toggleButton);

    // =====================================================
    // VR CONTROLLERS
    // =====================================================

    const controller1 = renderer.xr.getController(0);
    const controller2 = renderer.xr.getController(1);

    playerRig.add(controller1);
    playerRig.add(controller2);

    // Ray visible from controller

    const rayGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);

    const rayMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
    });

    const ray1 = new THREE.Line(rayGeometry, rayMaterial);
    ray1.scale.z = 10;

    const ray2 = new THREE.Line(rayGeometry, rayMaterial);
    ray2.scale.z = 10;

    controller1.add(ray1);
    controller2.add(ray2);

    // =====================================================
    // VR CLOSE BUTTON RAYCAST
    // =====================================================

    const raycaster = new THREE.Raycaster();

    const tempMatrix = new THREE.Matrix4();

    const tryCloseVR = (controller: THREE.Group) => {
      if (!renderer.xr.isPresenting) return;

      tempMatrix.identity().extractRotation(controller.matrixWorld);

      raycaster.ray.origin.setFromMatrixPosition(
        controller.matrixWorld,
      );

      raycaster.ray.direction
        .set(0, 0, -1)
        .applyMatrix4(tempMatrix)
        .normalize();

      if (toggleButton.visible) {
        const toggleIntersections = raycaster.intersectObject(
          toggleButton,
          false,
        );

        if (toggleIntersections.length > 0) {
          togglePanorama();

          return;
        }
      }

      const intersections = raycaster.intersectObject(
        closeButton,
        false,
      );

      if (intersections.length > 0) {
        const session = renderer.xr.getSession();

        if (session) {
          session.end().catch((error) => {
            console.error("VR session close error:", error);
          });
        }
      }
    };

    const controller1Select = () => {
      tryCloseVR(controller1);
    };

    const controller2Select = () => {
      tryCloseVR(controller2);
    };

    controller1.addEventListener(
      "select",
      controller1Select,
    );

    controller2.addEventListener(
      "select",
      controller2Select,
    );

    // =====================================================
    // XR SESSION EVENTS
    // =====================================================

    const showCloseButton = () => {
      closeButton.visible = true;

      if (hasToggle) {
        toggleButton.visible = true;
      }
    };

    const hideCloseButton = () => {
      closeButton.visible = false;

      toggleButton.visible = false;
    };

    renderer.xr.addEventListener(
      "sessionstart",
      showCloseButton,
    );

    renderer.xr.addEventListener(
      "sessionend",
      hideCloseButton,
    );

    // =====================================================
    // ANIMATION
    // =====================================================

    const animate = () => {
      /*
        NO VR MOVEMENT.

        Head tracking is automatically handled by WebXR.

        Controllers cannot move the user.
      */

      if (!renderer.xr.isPresenting) {
        if (!isDragging) {
          lon -= velocityX * 0.02;
          lat += velocityY * 0.02;

          velocityX *= 0.92;
          velocityY *= 0.92;
        }

        lat = Math.max(-85, Math.min(85, lat));

        const phi = THREE.MathUtils.degToRad(
          90 - lat,
        );

        const theta = THREE.MathUtils.degToRad(lon);

        const x =
          PANORAMA_RADIUS *
          Math.sin(phi) *
          Math.cos(theta);

        const y =
          PANORAMA_RADIUS *
          Math.cos(phi);

        const z =
          PANORAMA_RADIUS *
          Math.sin(phi) *
          Math.sin(theta);

        camera.lookAt(x, y, z);
      }

      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);

    // =====================================================
    // RESIZE
    // =====================================================

    const resize = () => {
      if (
        !container.clientWidth ||
        !container.clientHeight
      ) {
        return;
      }

      camera.aspect =
        container.clientWidth /
        container.clientHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        container.clientWidth,
        container.clientHeight,
      );
    };

    window.addEventListener("resize", resize);

    // =====================================================
    // CLEANUP
    // =====================================================

    return () => {
      renderer.setAnimationLoop(null);

      window.removeEventListener(
        "resize",
        resize,
      );

      window.removeEventListener(
        "pointerup",
        pointerUp,
      );

      renderer.domElement.removeEventListener(
        "pointerdown",
        pointerDown,
      );

      renderer.domElement.removeEventListener(
        "pointermove",
        pointerMove,
      );

      controller1.removeEventListener(
        "select",
        controller1Select,
      );

      controller2.removeEventListener(
        "select",
        controller2Select,
      );

      renderer.xr.removeEventListener(
        "sessionstart",
        showCloseButton,
      );

      renderer.xr.removeEventListener(
        "sessionend",
        hideCloseButton,
      );

      if (primaryTexture) {
        primaryTexture.dispose();
      }

      if (alternateTexture) {
        alternateTexture.dispose();
      }

      geometry.dispose();
      material.dispose();

      closeTexture.dispose();
      closeGeometry.dispose();
      closeMaterial.dispose();

      toggleTexture.dispose();
      toggleGeometry.dispose();
      toggleMaterial.dispose();

      rayGeometry.dispose();
      rayMaterial.dispose();

      renderer.dispose();

      if (vrButton.parentNode === container) {
        container.removeChild(vrButton);
      }

      if (
        renderer.domElement.parentNode === container
      ) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [imageUrl, vrButtonId, alternateImageUrl, toggleLabel, toggleBackLabel]);

  return (
    <div
      ref={mountRef}
      className="panorama-viewer"
      style={{ position: "relative" }}
    />
  );
}