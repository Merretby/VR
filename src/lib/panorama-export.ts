import * as THREE from "three";

/**
 * Captures an equirectangular 360° panoramic image of the current Three.js scene
 * from a given camera position.
 */
export function capture360Panorama(
  gl: THREE.WebGLRenderer,
  scene: THREE.Scene,
  position: THREE.Vector3,
  resolution = 2048
): string {
  const cubeRes = Math.pow(2, Math.floor(Math.log2(resolution / 2)));
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(cubeRes, {
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
  });

  const cubeCamera = new THREE.CubeCamera(0.05, 200, cubeRenderTarget);
  cubeCamera.position.copy(position);

  // Render 6 cube faces
  cubeCamera.update(gl, scene);

  // Shader to convert cubemap to 2D equirectangular panorama projection
  const equirectMaterial = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: cubeRenderTarget.texture },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform samplerCube map;
      varying vec2 vUv;
      #define PI 3.141592653589793
      void main() {
        float longitude = (vUv.x - 0.5) * 2.0 * PI;
        float latitude = (vUv.y - 0.5) * PI;
        vec3 dir = vec3(
          cos(latitude) * sin(longitude),
          sin(latitude),
          -cos(latitude) * cos(longitude)
        );
        gl_FragColor = textureCube(map, dir);
      }
    `,
    side: THREE.DoubleSide,
  });

  const width = resolution;
  const height = resolution / 2;
  const equirectTarget = new THREE.WebGLRenderTarget(width, height);
  const orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quadMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), equirectMaterial);
  const quadScene = new THREE.Scene();
  quadScene.add(quadMesh);

  const prevTarget = gl.getRenderTarget();
  gl.setRenderTarget(equirectTarget);
  gl.render(quadScene, orthoCam);
  gl.setRenderTarget(prevTarget);

  const buffer = new Uint8Array(width * height * 4);
  gl.readRenderTargetPixels(equirectTarget, 0, 0, width, height, buffer);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create 2D canvas context for panorama export");

  const imgData = ctx.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y; // Flip WebGL bottom-up pixels
    for (let x = 0; x < width; x++) {
      const srcIdx = (srcY * width + x) * 4;
      const dstIdx = (y * width + x) * 4;
      imgData.data[dstIdx] = buffer[srcIdx] ?? 0;
      imgData.data[dstIdx + 1] = buffer[srcIdx + 1] ?? 0;
      imgData.data[dstIdx + 2] = buffer[srcIdx + 2] ?? 0;
      imgData.data[dstIdx + 3] = buffer[srcIdx + 3] ?? 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Clean up WebGL resources
  cubeRenderTarget.dispose();
  equirectTarget.dispose();
  quadMesh.geometry.dispose();
  equirectMaterial.dispose();

  return canvas.toDataURL("image/png");
}

/**
 * Triggers a browser file download for a data URL.
 */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
