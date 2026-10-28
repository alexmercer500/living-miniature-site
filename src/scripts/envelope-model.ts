// The Amber Fort envelope as a lit 3D model (three.js), in place of its photo layers. It draws only
// when the scroll pose changes, into two layers so the real card (DOM) sits between them: behind
// it the lining and the opened flap, in front of it the pocket, the closed flap, the wax seal and
// its tassel. One WebGL context draws both: the back pass is copied to a 2D canvas, then the front
// pass is drawn. Textures and outlines come from scripts/build-envelope-model.mjs.
import {
  BufferAttribute, CylinderGeometry, ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry,
  ShadowMaterial, Shape, SphereGeometry, Texture, Vector3, BackSide, type Material,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createStage, grid, loadTexture, smooth, webgl2, type KeepsakeModel, type Pose } from './keepsake-3d';

export interface ModelSpec {
  geometry: { height: number; flap: { tip: number; crop: number }; seal: { center: number[]; radius: number } };
  textures: Record<string, string>;
}
// The canvases reach past the rig box (the face, 1 unit wide) so the opened flap and the tilt fit.
const PAD_X = .15, PAD_Y = .75;
const DISTANCE = 2.6; // camera to face, in face widths: a gentle perspective
const HINGE_Z = .004; // the flap lies just over the pocket
const OPEN = 165 * Math.PI / 180; // the flap leans back rather than lying flat
const CURL = .55; // radians of bend along the flap mid-swing: the tip leads, like a peeled flap

/** The wax seal's lobed outline, split by a jagged crack into two halves (shapes, seal-centred). */
function sealHalves(R: number) {
  const r = (a: number) => R * (1 + .045 * Math.sin(9 * a + .4) + .02 * Math.sin(5 * a + 1.3));
  const crack = [[0, -1], [.09, -.62], [-.05, -.3], [.07, .05], [-.05, .4], [.04, .72], [0, 1]].map(([x, y]) => [x * R, y * r(Math.PI / 2 * Math.sign(y || 1))]);
  const arc = (from: number, to: number) => Array.from({ length: 49 }, (_, k) => { const a = from + (to - from) * k / 48; return [Math.cos(a) * r(a), Math.sin(a) * r(a)]; });
  const shape = (points: number[][]) => new Shape(points.map(([x, y]) => ({ x, y }) as never));
  return [
    shape([...arc(Math.PI / 2, Math.PI * 1.5), ...crack.slice(1, -1)]),
    shape([...arc(-Math.PI / 2, Math.PI / 2), ...[...crack].reverse().slice(1, -1)]),
  ];
}

/** A silk tassel on a gold bead and cap, hanging from y = 0 (built as one merged mesh of strands). */
function tassel() {
  const group = new Group();
  const gold = new MeshStandardMaterial({ color: 0xd8a24a, metalness: 1, roughness: .32 });
  const silk = new MeshStandardMaterial({ color: 0x7a1426, roughness: .55, metalness: 0 });
  const cord = new Mesh(new CylinderGeometry(.0022, .0022, .016, 8), silk); cord.position.y = -.006;
  const bead = new Mesh(new SphereGeometry(.0085, 20, 14), gold); bead.position.y = -.018;
  const cap = new Mesh(new CylinderGeometry(.0112, .0136, .024, 28), gold); cap.position.y = -.038;
  let seed = 7; const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const strands = Array.from({ length: 120 }, () => {
    const a = random() * Math.PI * 2, r0 = .011 * Math.sqrt(random()), r1 = r0 * 2.4 + .008, L = .12 + random() * .02;
    const g = new CylinderGeometry(.0015, .001, L, 3, 6, true), p = g.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const t = Math.min(1, Math.max(0, (L / 2 - p.getY(k)) / L)), rr = r0 + (r1 - r0) * t ** 1.4;
      // Flattened front to back: the tassel lies against the envelope.
      p.setXYZ(k, p.getX(k) + Math.cos(a) * rr, -t * L, (p.getZ(k) + Math.sin(a) * rr) * .55);
    }
    return g;
  });
  const skirt = new Mesh(mergeGeometries(strands), silk); skirt.position.y = -.05;
  for (const part of [cord, bead, cap, skirt]) { part.castShadow = true; group.add(part); }
  return { group, materials: [gold, silk] };
}

export async function mountEnvelopeModel(rig: HTMLElement, spec: ModelSpec): Promise<KeepsakeModel | null> {
  if (!webgl2()) return null;
  const tex = Object.fromEntries(await Promise.all(Object.entries(spec.textures).map(async ([name, url]) => [name, await loadTexture(url, name.endsWith('-color'))]))) as Record<string, Texture>;

  const { renderer, scene } = createStage();
  for (const t of Object.values(tex)) t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const front = renderer.domElement, back = document.createElement('canvas'), backContext = back.getContext('2d')!;
  front.className = 'obj-canvas obj-canvas-front';
  back.className = 'obj-canvas obj-canvas-back';
  for (const canvas of [front, back]) canvas.setAttribute('aria-hidden', 'true');

  const g = spec.geometry, faceH = g.height;
  const camera = new PerspectiveCamera(30, 1, .1, 20);
  camera.position.set(0, 0, DISTANCE);

  // The envelope: a group the lift tilts, holding the face (1 × faceH, centred, y up).
  const envelope = new Group();
  scene.add(envelope);
  const surface = (color: Texture, detail: Texture, extra: Partial<MeshStandardMaterial> = {}) => new MeshStandardMaterial({
    map: color, bumpMap: detail, bumpScale: 12, roughnessMap: detail, metalnessMap: detail, roughness: 1, metalness: 1, ...extra,
  });
  const layered: Mesh[] = [];
  const part = (mesh: Mesh, pass: 'front' | 'back') => { mesh.userData.pass = pass; layered.push(mesh); envelope.add(mesh); return mesh; };

  // Back panel: its lining faces the guest through the open pocket.
  const lining = part(new Mesh(grid(1, 1, (u, v) => [u - .5, faceH / 2 - v * faceH, 0]), surface(tex['lining-color'], tex['lining-detail'], { bumpScale: 3 })), 'back');
  lining.position.z = -.012;
  lining.receiveShadow = true;
  // Pocket: the front's paper with the V cut by the texture's alpha; it swells a little low down,
  // where the card sits.
  const pocket = part(new Mesh(
    grid(32, 20, (u, v) => [u - .5, faceH / 2 - v * faceH, .008 * Math.sin(Math.PI * u) * Math.max(0, Math.sin(Math.PI * (v - .62) / .38))]),
    surface(tex['body-color'], tex['body-detail'], { alphaTest: .5, alphaToCoverage: true }),
  ), 'front');
  pocket.receiveShadow = true;
  pocket.castShadow = true;

  // Flap: a strip bent along its length each frame (see bendFlap); outside and lining share it.
  const NU = 24, NS = 28, crop = g.flap.crop;
  const flapGeometry = grid(NU, NS, (u, v) => [u - .5, faceH / 2 - v * crop, HINGE_Z]);
  const flapOut = part(new Mesh(flapGeometry, surface(tex['flap-color'], tex['flap-detail'], { alphaTest: .5, alphaToCoverage: true })), 'front');
  const flapIn = part(new Mesh(flapGeometry, surface(tex['flap-inside-color'], tex['flap-inside-detail'], { bumpScale: 3, alphaTest: .5, alphaToCoverage: true, side: BackSide })), 'front');
  for (const m of [flapOut, flapIn]) { m.castShadow = true; m.receiveShadow = true; }
  const bendFlap = (theta: number) => {
    const p = flapGeometry.attributes.position as BufferAttribute, n = flapGeometry.attributes.normal as BufferAttribute;
    const k = CURL * Math.sin(theta) / crop;
    for (let j = 0; j <= NS; j++) {
      const s = j / NS * crop, phi = theta + k * s;
      const y = Math.abs(k) < 1e-6 ? -s * Math.cos(theta) : -(Math.sin(phi) - Math.sin(theta)) / k;
      const z = Math.abs(k) < 1e-6 ? s * Math.sin(theta) : (Math.cos(theta) - Math.cos(phi)) / k;
      for (let i = 0; i <= NU; i++) {
        const idx = j * (NU + 1) + i;
        p.setXYZ(idx, i / NU - .5, faceH / 2 + y, HINGE_Z + z);
        n.setXYZ(idx, 0, Math.sin(phi), Math.cos(phi));
      }
    }
    p.needsUpdate = true; n.needsUpdate = true;
    flapGeometry.computeBoundingSphere();
  };

  // Wax seal (two halves, so it can crack) and tassel, on the flap's tip.
  const R = g.seal.radius, sealAt = new Vector3(g.seal.center[0] - .5, faceH / 2 - g.seal.center[1], HINGE_Z + .007);
  const sealMaterial = surface(tex['seal-color'], tex['seal-detail'], { bumpScale: 10 });
  const halves = sealHalves(R).map(shape => {
    const geometry = new ExtrudeGeometry(shape, { depth: .005, bevelEnabled: true, bevelThickness: .006, bevelSize: .008, bevelSegments: 4, curveSegments: 1 });
    const p = geometry.attributes.position, uv = geometry.attributes.uv;
    for (let k = 0; k < p.count; k++) uv.setXY(k, .5 + p.getX(k) / (2.16 * R), .5 - p.getY(k) / (2.16 * R));
    const mesh = part(new Mesh(geometry, sealMaterial), 'front');
    mesh.castShadow = true;
    return mesh;
  });
  const hanging = tassel();
  envelope.add(hanging.group);
  hanging.group.traverse(o => { if ((o as Mesh).isMesh) { o.userData.pass = 'front'; layered.push(o as Mesh); } });
  const sealAnchor = new Group();
  envelope.add(sealAnchor);

  // A soft drop shadow on an invisible surface just behind: the table while the envelope lies on
  // it, a wall once it stands. Behind the card, so it never shades it.
  const wall = part(new Mesh(new PlaneGeometry(4, 4), new ShadowMaterial({ opacity: .28 })), 'back');
  wall.position.z = -.12;
  wall.receiveShadow = true;

  const setPass = (pass: string) => { for (const m of layered) { const on = m.userData.pass === pass, mat = m.material as Material; mat.colorWrite = on; mat.depthWrite = on; } };
  let pose: Pose | undefined, drawn = '', sealAtScreen = '', ready = false;
  const size = () => {
    const w = rig.clientWidth, h = rig.clientHeight;
    if (!w || !h) return;
    const cw = w * (1 + 2 * PAD_X), ch = h * (1 + 2 * PAD_Y);
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    renderer.setSize(cw, ch, false);
    back.width = front.width; back.height = front.height;
    // The face plane (z = 0) maps exactly onto the rig box.
    camera.fov = 2 * Math.atan((h / w) * (1 + 2 * PAD_Y) / 2 / DISTANCE) * 180 / Math.PI;
    camera.aspect = cw / ch;
    camera.updateProjectionMatrix();
    drawn = '';
  };
  const draw = () => {
    if (!pose || !ready) return;
    const p = pose, lift = p.liftSpring, theta = Math.min(1.08, p.flapSpring) * OPEN;
    const signature = [lift, p.seal, theta, front.width, front.height].map(v => v.toFixed(4)).join();
    if (signature === drawn) return;
    drawn = signature;
    // Lifted from the table: tilted back and turned a little, smaller, then upright.
    envelope.rotation.set(-58 * Math.PI / 180 * (1 - lift), 0, 8 * Math.PI / 180 * (1 - lift));
    envelope.scale.setScalar(.72 + .28 * lift);
    bendFlap(theta);
    const flapPass = theta < Math.PI / 2 ? 'front' : 'back';
    flapOut.userData.pass = flapIn.userData.pass = flapPass;
    // The seal cracks, then its halves fall away with the tassel.
    const crack = smooth(0, .3, p.seal), fall = smooth(.25, 1, p.seal), fade = 1 - smooth(.45, 1, p.seal);
    halves.forEach((half, i) => {
      const side = i ? 1 : -1;
      half.position.set(sealAt.x + side * (.003 * crack + .09 * fall), sealAt.y - .05 * fall - .1 * fall * fall, sealAt.z + .22 * fall);
      half.rotation.set(0, side * .9 * fall, side * (-.08 * crack - .5 * fall));
    });
    hanging.group.position.set(sealAt.x, sealAt.y - R * .97 - .12 * fall * fall, sealAt.z + .006 + .2 * fall);
    hanging.group.rotation.set(.6 * fall, 0, .25 * fall);
    for (const m of [sealMaterial, ...hanging.materials]) { m.transparent = fade < 1; m.opacity = fade; }
    halves.forEach(h => { h.visible = fade > 0; });
    hanging.group.visible = fade > 0;

    renderer.shadowMap.needsUpdate = true;
    setPass('back');
    renderer.render(scene, camera);
    backContext.clearRect(0, 0, back.width, back.height);
    backContext.drawImage(front, 0, 0);
    setPass('front');
    renderer.render(scene, camera);

    // The seal control follows the wax on screen (in rig percentages).
    sealAnchor.position.copy(sealAt);
    const at = sealAnchor.getWorldPosition(new Vector3()).project(camera);
    const sealX = `${((((at.x + 1) / 2) * (1 + 2 * PAD_X) - PAD_X) * 100).toFixed(2)}%`, sealY = `${((((1 - at.y) / 2) * (1 + 2 * PAD_Y) - PAD_Y) * 100).toFixed(2)}%`;
    if (sealX + sealY !== sealAtScreen) { sealAtScreen = sealX + sealY; rig.style.setProperty('--seal-x', sealX); rig.style.setProperty('--seal-y', sealY); }
  };

  size();
  for (const t of Object.values(tex)) renderer.initTexture(t);
  bendFlap(0);
  await renderer.compileAsync(scene, camera);
  // One unseen draw of both passes compiles the shadow blur and uploads everything now, not on
  // the first scroll frame.
  renderer.shadowMap.needsUpdate = true;
  for (const pass of ['back', 'front']) { setPass(pass); renderer.render(scene, camera); }
  rig.prepend(back);
  rig.append(front);
  ready = true;
  const resize = new ResizeObserver(() => { size(); draw(); });
  resize.observe(rig);
  const lost = (event: Event) => { event.preventDefault(); dispose(); };
  front.addEventListener('webglcontextlost', lost);
  function dispose() {
    ready = false;
    resize.disconnect();
    front.removeEventListener('webglcontextlost', lost);
    rig.classList.remove('object-3d');
    front.remove(); back.remove();
    scene.traverse(o => { const m = o as Mesh; if (m.isMesh) { m.geometry.dispose(); (m.material as Material).dispose(); } });
    for (const t of Object.values(tex)) { t.dispose(); (t.image as ImageBitmap).close?.(); }
    scene.environment?.dispose();
    renderer.dispose();
  }
  return {
    update(next) {
      pose = next;
      if (!ready) return; // lost its context: the photo layers have taken over again
      draw();
      rig.classList.add('object-3d');
    },
    dispose,
  };
}
