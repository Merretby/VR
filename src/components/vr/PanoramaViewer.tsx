import { useEffect, useRef } from "react";
import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";

const PANORAMA_RADIUS = 20;
const MAX_VR_MOVE = 3;
const VR_MOVE_SPEED = 0.035;

/**
 * Ported from the AI folder's PanoramaViewer: a raw three.js 360 sphere
 * viewer with drag-to-look, scroll-to-zoom and a WebXR "ENTER VR" button
 * for headsets (Meta Quest etc.).
 */
export function PanoramaViewer({
  imageUrl,
  vrButtonId,
}: {
  imageUrl: string;
  vrButtonId?: string | undefined;
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

    const controller1 = renderer.xr.getController(0);
    const controller2 = renderer.xr.getController(1);
    playerRig.add(controller1);
    playerRig.add(controller2);

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

    const geometry = new THREE.SphereGeometry(PANORAMA_RADIUS, 96, 64);
    geometry.scale(-1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(0, 0, 0);
    scene.add(sphere);

    const loader = new THREE.TextureLoader();
    loader.load(
      `${imageUrl}?v=${Date.now()}`,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        material.map = texture;
        material.needsUpdate = true;
      },
      undefined,
      (error) => console.error("Panorama load error:", error),
    );

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

    const wheel = (event: WheelEvent) => {
      if (renderer.xr.isPresenting) return;
      event.preventDefault();
      camera.fov += event.deltaY * 0.03;
      camera.fov = THREE.MathUtils.clamp(camera.fov, 25, 95);
      camera.updateProjectionMatrix();
    };

    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("wheel", wheel, { passive: false });

    const resetVRPosition = () => {
      playerRig.position.set(0, 0, 0);
    };
    controller1.addEventListener("selectstart", resetVRPosition);
    controller2.addEventListener("selectstart", resetVRPosition);

    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    const move = new THREE.Vector3();
    const horizontalPosition = new THREE.Vector2();

    const applyDeadZone = (value: number, deadZone = 0.15) =>
      Math.abs(value) < deadZone ? 0 : value;

    const updateVRControls = () => {
      if (!renderer.xr.isPresenting) return;
      const session = renderer.xr.getSession();
      if (!session) return;

      camera.getWorldDirection(forward);
      forward.y = 0;
      if (forward.lengthSq() < 0.0001) {
        forward.set(0, 0, -1);
      } else {
        forward.normalize();
      }
      right.crossVectors(forward, up).normalize();
      move.set(0, 0, 0);

      for (const source of session.inputSources) {
        if (!source.gamepad || !source.gamepad.axes) continue;
        const axes = source.gamepad.axes;
        const axisX = applyDeadZone(axes.length >= 4 ? (axes[2] ?? 0) : (axes[0] ?? 0));
        const axisY = applyDeadZone(axes.length >= 4 ? (axes[3] ?? 0) : (axes[1] ?? 0));
        if (axisX !== 0) move.addScaledVector(right, axisX * VR_MOVE_SPEED);
        if (axisY !== 0) move.addScaledVector(forward, -axisY * VR_MOVE_SPEED);
      }

      playerRig.position.add(move);

      horizontalPosition.set(playerRig.position.x, playerRig.position.z);
      if (horizontalPosition.length() > MAX_VR_MOVE) {
        horizontalPosition.setLength(MAX_VR_MOVE);
        playerRig.position.x = horizontalPosition.x;
        playerRig.position.z = horizontalPosition.y;
      }
      playerRig.position.y = 0;
    };

    const animate = () => {
      updateVRControls();

      if (!renderer.xr.isPresenting) {
        if (!isDragging) {
          lon -= velocityX * 0.02;
          lat += velocityY * 0.02;
          velocityX *= 0.92;
          velocityY *= 0.92;
        }

        lat = Math.max(-85, Math.min(85, lat));

        const phi = THREE.MathUtils.degToRad(90 - lat);
        const theta = THREE.MathUtils.degToRad(lon);
        const x = PANORAMA_RADIUS * Math.sin(phi) * Math.cos(theta);
        const y = PANORAMA_RADIUS * Math.cos(phi);
        const z = PANORAMA_RADIUS * Math.sin(phi) * Math.sin(theta);

        camera.lookAt(x, y, z);
      }

      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);

    const resize = () => {
      if (!container.clientWidth || !container.clientHeight) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", resize);

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("wheel", wheel);
      controller1.removeEventListener("selectstart", resetVRPosition);
      controller2.removeEventListener("selectstart", resetVRPosition);
      if (material.map) material.map.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (vrButton.parentNode === container) container.removeChild(vrButton);
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, [imageUrl, vrButtonId]);

  return <div ref={mountRef} className="panorama-viewer" style={{ position: "relative" }} />;
}
