// Shared ground for the theme keepsakes' 3D models (envelope-model.ts, scroll-model.ts): the
// renderer and its warm lighting, texture loading and small geometry helpers. Loaded only with a
// model, never up front.
import {
  BufferAttribute, BufferGeometry, DirectionalLight, HemisphereLight, NeutralToneMapping, PMREMGenerator, Scene,
  SRGBColorSpace, Texture, VSMShadowMap, WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { envelopeState } from '../lib/envelope-state';

export type Pose = ReturnType<typeof envelopeState>;
export interface KeepsakeModel { update(pose: Pose): void; dispose(): void }

export const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** WebGL 2 is there (the probe's context is given straight back). */
export function webgl2() {
  const gl = document.createElement('canvas').getContext('webgl2');
  gl?.getExtension('WEBGL_lose_context')?.loseContext();
  return Boolean(gl);
}

export async function loadTexture(url: string, color: boolean) {
  const blob = await (await fetch(url)).blob();
  // Decoded off the main thread; uploaded as is (so UVs run top-down: flipY is off).
  const bitmap = await createImageBitmap(blob, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
  const texture = new Texture(bitmap);
  texture.flipY = false;
  if (color) texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** A (nu × nv) grid: `at(u, v)` places each vertex; UVs run left→right, top→bottom. */
export function grid(nu: number, nv: number, at: (u: number, v: number) => [number, number, number], uvAt = (u: number, v: number) => [u, v]) {
  const position = new Float32Array((nu + 1) * (nv + 1) * 3), uv = new Float32Array((nu + 1) * (nv + 1) * 2), index: number[] = [];
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
    const k = j * (nu + 1) + i, p = at(i / nu, j / nv), t = uvAt(i / nu, j / nv);
    position.set(p, k * 3); uv.set(t, k * 2);
    if (i < nu && j < nv) index.push(k, k + nu + 1, k + 1, k + 1, k + nu + 1, k + nu + 2);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(position, 3));
  g.setAttribute('uv', new BufferAttribute(uv, 2));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

/** A transparent renderer and a scene lit like the terrace at dusk: a warm key from the upper
 *  left that casts soft (VSM) shadows, a dim warm fill, and a room environment for the gold. */
export function createStage() {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = .82;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = VSMShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = 1;
  pmrem.dispose();
  scene.add(new HemisphereLight(0xffe9d2, 0x3a1a12, .5));
  // Low enough that paper grain, embossing and edges read.
  const key = new DirectionalLight(0xffdcb0, 2.9);
  key.position.set(-1.3, 1.5, 2);
  key.castShadow = true;
  Object.assign(key.shadow.camera, { left: -1, right: 1, top: 1, bottom: -1, near: .5, far: 6 });
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 3.5;
  key.shadow.blurSamples = 12;
  key.shadow.bias = -.0004;
  scene.add(key);
  return { renderer, scene, key };
}
