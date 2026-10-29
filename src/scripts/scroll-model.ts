// The Lake City scroll as a lit 3D model (three.js), in place of its photo layers: the rolled paper
// (its print unwrapped from the photo by scripts/build-scroll-model.mjs) between two gilt finials,
// tied with a satin bow on a gold medallion. On the envelope's scroll stages the bow slips loose
// and falls away, the roll swings level, then rolls down the page, turning and thinning as the real
// card (the unrolled sheet, DOM) is revealed above it. One canvas lies over the card: the roll is
// always in front of the paper, and casts its shadow on it.
import {
  CanvasTexture, CatmullRomCurve3, CylinderGeometry, DoubleSide, BufferAttribute, BufferGeometry, Group, LatheGeometry,
  Mesh, MeshPhysicalMaterial, MeshStandardMaterial, MirroredRepeatWrapping, PerspectiveCamera, PlaneGeometry,
  RepeatWrapping, ShadowMaterial, SphereGeometry, SRGBColorSpace, Texture, Vector2, Vector3, type Material,
} from 'three';
import { createStage, grid, loadTexture, quiet, smooth, uploadTextures, webgl2, type KeepsakeModel, type Pose } from './keepsake-3d';

export interface ScrollSpec {
  geometry: { radius: number; paper: number; tilt: number; axis: number[]; knot: { along: number; up: number } };
  textures: Record<string, string>;
}

// The canvas reaches past the rig: to each side (rig widths) and above it (rig heights); below,
// it reaches as far as the roll travels down the sheet.
const PAD_X = .12, ABOVE = .55;
const DISTANCE = 2.6; // camera to the sheet, in rig widths
const THIN = .3; // the roll loses this much of its radius as the paper comes off it

/** A canvas-drawn texture (UVs top-down, like the loaded ones). */
function painted(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, color = false) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  draw(canvas.getContext('2d')!);
  const texture = new CanvasTexture(canvas);
  texture.flipY = false;
  if (color) texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** A ribbon strip along `curve`: three vertices across (edge, middle, edge), its width along
 *  `across`; `notch` cuts a swallowtail into the far end. UVs: u along (in widths), v across. */
function strip(curve: CatmullRomCurve3, width: number, across: (t: number, tangent: Vector3) => Vector3, notch = 0, n = 48) {
  const position: number[] = [], uv: number[] = [], index: number[] = [], length = curve.getLength();
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = curve.getPointAt(t), tangent = curve.getTangentAt(t), a = across(t, tangent).normalize().multiplyScalar(width / 2);
    for (let k = 0; k < 3; k++) {
      const q = p.clone().addScaledVector(a, k - 1);
      if (i === n && k === 1) q.addScaledVector(tangent, -notch);
      position.push(q.x, q.y, q.z); uv.push(t * length / width, k / 2);
    }
    if (i < n) { const b = i * 3; index.push(b, b + 3, b + 1, b + 1, b + 3, b + 4, b + 1, b + 4, b + 2, b + 2, b + 4, b + 5); }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(position), 3));
  g.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

export async function mountScrollModel(rig: HTMLElement, spec: ScrollSpec): Promise<KeepsakeModel | null> {
  const card = rig.querySelector<HTMLElement>('[data-envelope-card]');
  if (!card || !webgl2()) return null;
  const tex = Object.fromEntries(await Promise.all(Object.entries(spec.textures).map(async ([name, url]) => [name, await loadTexture(url, name.endsWith('-color'))]))) as Record<string, Texture>;
  const { renderer, scene } = await createStage();
  const canvas = renderer.domElement;
  canvas.className = 'obj-canvas obj-canvas-scroll';
  canvas.setAttribute('aria-hidden', 'true');
  const camera = new PerspectiveCamera(30, 1, .1, 20);
  const g = spec.geometry, r = g.radius, L = g.paper;
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  // outer: placed, lifted and swung level; spinner: turns about the roll's axis as it unrolls.
  const outer = new Group(), spinner = new Group();
  outer.add(spinner);
  scene.add(outer);

  // Paper: the unwrapped print runs over the visible half and mirrors round the back.
  for (const t of [tex['scroll-color'], tex['scroll-detail']]) { t.wrapT = MirroredRepeatWrapping; t.anisotropy = anisotropy; }
  const paper = new Mesh(
    grid(4, 72, (u, v) => { const a = -Math.PI / 2 + v * Math.PI * 2; return [(u - .5) * L, -r * Math.sin(a), r * Math.cos(a)]; }, (u, v) => [u, v * 2]),
    new MeshStandardMaterial({ map: tex['scroll-color'], bumpMap: tex['scroll-detail'], bumpScale: 8, roughnessMap: tex['scroll-detail'], metalnessMap: tex['scroll-detail'], roughness: 1, metalness: 1 }),
  );
  paper.castShadow = true;
  spinner.add(paper);

  // Finials: a collar, a beaded ring and a lotus dome with a knob, turned on a lathe (profile in
  // roll radii: radius, distance out from the paper's end). Beads and petals are a painted bump.
  const PROFILE = [[0, -.2], [.98, -.2], [1.04, -.12], [1.06, 0], [1.06, .16], [1, .2], [1.1, .23], [1.15, .27], [1.1, .31], [.98, .33], [1.03, .4], [1.01, .52], [.93, .64], [.79, .76], [.61, .85], [.43, .91], [.3, .94], [.27, .98], [.33, 1.02], [.27, 1.06], [.18, 1.08]];
  const band = (k: number) => k / (PROFILE.length - 1) * 256;
  const capBump = painted(512, 256, c => {
    c.fillStyle = '#808080'; c.fillRect(0, 0, 512, 256);
    // Beads round the ring.
    for (let k = 0; k < 40; k++) { const gr = c.createRadialGradient(k * 12.8 + 6.4, (band(6) + band(8)) / 2, 0, k * 12.8 + 6.4, (band(6) + band(8)) / 2, 6); gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#606060'); c.fillStyle = gr; c.beginPath(); c.arc(k * 12.8 + 6.4, (band(6) + band(8)) / 2, 6, 0, Math.PI * 2); c.fill(); }
    // Lotus petals up the dome, pointing to the knob.
    const y0 = band(10), y1 = band(16);
    for (let k = 0; k < 8; k++) {
      const x = (k + .5) * 64;
      const gr = c.createLinearGradient(x - 26, 0, x + 26, 0); gr.addColorStop(0, '#5a5a5a'); gr.addColorStop(.5, '#e8e8e8'); gr.addColorStop(1, '#5a5a5a');
      c.fillStyle = gr; c.beginPath(); c.moveTo(x - 28, y0); c.quadraticCurveTo(x - 30, (y0 + y1) / 2, x, y1); c.quadraticCurveTo(x + 30, (y0 + y1) / 2, x + 28, y0); c.closePath(); c.fill();
      c.strokeStyle = '#3c3c3c'; c.lineWidth = 2; c.stroke();
    }
    // Fine rings on the collar.
    c.fillStyle = '#b0b0b0'; for (const k of [2, 4]) c.fillRect(0, band(k) - 2, 512, 4);
  });
  capBump.wrapS = RepeatWrapping;
  const gold = new MeshStandardMaterial({ color: 0xdcaa5c, metalness: 1, roughness: .3, bumpMap: capBump, bumpScale: 6 });
  const lathe = new LatheGeometry(PROFILE.map(([x, y]) => new Vector2(x * r, y * r)), 48);
  const knob = new SphereGeometry(r * .27, 24, 16).translate(0, r * 1.3, 0);
  for (const side of [-1, 1]) {
    for (const geometry of [lathe, knob]) {
      const mesh = new Mesh(geometry, gold);
      mesh.rotation.z = -side * Math.PI / 2; // the lathe's y axis points out along the roll
      mesh.position.x = side * L / 2;
      mesh.castShadow = true;
      spinner.add(mesh);
    }
  }

  // The bow, on the roll's front a little right of centre: a band round the roll, two loops and
  // two notched tails of satin with gold piping, gathered by a gold medallion.
  const satin = painted(256, 64, c => {
    c.fillStyle = '#d4847f'; c.fillRect(0, 0, 256, 64);
    for (let x = 0; x < 256; x += 2) { c.fillStyle = `rgba(255,235,230,${.04 + .05 * Math.abs(Math.sin(x * .7))})`; c.fillRect(x, 0, 1, 64); }
    c.fillStyle = '#e2b76a'; c.fillRect(0, 0, 256, 4); c.fillRect(0, 60, 256, 4);
  }, true);
  const satinDetail = painted(256, 64, c => {
    c.fillStyle = 'rgb(128,120,0)'; c.fillRect(0, 0, 256, 64); // roughness .47, not metal
    c.fillStyle = 'rgb(180,70,255)'; c.fillRect(0, 0, 256, 4); c.fillRect(0, 60, 256, 4); // raised gold piping
  });
  for (const t of [satin, satinDetail]) { t.wrapS = RepeatWrapping; t.anisotropy = anisotropy; }
  const silk = new MeshPhysicalMaterial({
    map: satin, bumpMap: satinDetail, bumpScale: 3, roughnessMap: satinDetail, metalnessMap: satinDetail, roughness: 1, metalness: 1,
    sheen: 1, sheenColor: 0xffc9bf, sheenRoughness: .35, side: DoubleSide,
  });
  const ribbon = new Group(), bow = new Group();
  ribbon.add(bow);
  outer.add(ribbon);
  const up = g.knot.up, K = new Vector3(g.knot.along, up * r, Math.sqrt(1 - up * up) * r + .006);
  bow.position.copy(K);
  const Z = new Vector3(0, 0, 1);
  const facing = (twist = 0) => (t: number, tangent: Vector3) => {
    const base = new Vector3().crossVectors(tangent, Z).normalize(), side = new Vector3().crossVectors(tangent, base);
    const a = twist * Math.sin(Math.PI * t);
    return base.multiplyScalar(Math.cos(a)).addScaledVector(side, Math.sin(a));
  };
  const loop = (s: number, size: number) => strip(new CatmullRomCurve3([[0, 0, .004], [.03 * s, .03, .03], [.085 * s, .07, .035], [.13 * s, .055, .02], [.115 * s, .012, .015], [.06 * s, -.002, .022], [.01 * s, -.004, .012]].map(([x, y, z]) => new Vector3(x * size, y * size, z * size))), .078, (t, tangent) => facing(.9)(t, tangent).addScaledVector(Z, .35));
  const tail = (points: number[][]) => strip(new CatmullRomCurve3(points.map(([x, y, z]) => new Vector3(x, y, z))), .07, facing(.7), .04);
  const ribbonParts = [
    loop(1, 1.35), loop(-1, 1.15),
    tail([[0, 0, .01], [.025, -.035, .035], [.075, -.11, .05], [.065, -.2, .055], [.11, -.29, .045], [.125, -.34, .05]]),
    tail([[0, 0, .01], [-.02, -.035, .035], [-.06, -.1, .045], [-.055, -.18, .05], [-.09, -.26, .04]]),
  ].map(geometry => new Mesh(geometry, silk));
  for (const m of ribbonParts) { m.castShadow = true; bow.add(m); }
  const wrap = new Mesh(strip(new CatmullRomCurve3(Array.from({ length: 24 }, (_, k) => { const a = k / 24 * Math.PI * 2; return new Vector3(K.x, Math.cos(a) * (r + .004), Math.sin(a) * (r + .004)); }), true), .085, () => new Vector3(1, 0, 0), 0, 72), silk);
  wrap.castShadow = true;
  ribbon.add(wrap);
  const rosette = painted(128, 128, c => {
    c.fillStyle = '#808080'; c.fillRect(0, 0, 128, 128);
    for (let k = 0; k < 10; k++) { c.save(); c.translate(64, 64); c.rotate(k / 10 * Math.PI * 2); const gr = c.createLinearGradient(0, 0, 0, -48); gr.addColorStop(0, '#d0d0d0'); gr.addColorStop(1, '#707070'); c.fillStyle = gr; c.beginPath(); c.ellipse(0, -28, 9, 22, 0, 0, Math.PI * 2); c.fill(); c.restore(); }
    c.fillStyle = '#f0f0f0'; c.beginPath(); c.arc(64, 64, 11, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#d8d8d8'; c.lineWidth = 5; c.beginPath(); c.arc(64, 64, 58, 0, Math.PI * 2); c.stroke();
  });
  const medallion = new Mesh(new CylinderGeometry(.036, .038, .014, 40).rotateX(Math.PI / 2), new MeshStandardMaterial({ color: 0xdcaa5c, metalness: 1, roughness: .3, bumpMap: rosette, bumpScale: 5 }));
  medallion.position.z = .02;
  medallion.castShadow = true;
  bow.add(medallion);
  const knotAnchor = new Group();
  ribbon.add(knotAnchor);
  knotAnchor.position.copy(K);
  const ribbonMaterials = [silk, medallion.material as Material];

  // The roll's shadow falls on the sheet (the page's paper, at z = 0) behind it.
  const sheet = new Mesh(new PlaneGeometry(6, 6), new ShadowMaterial({ opacity: .3 }));
  sheet.receiveShadow = true;
  scene.add(sheet);

  let pose: Pose | undefined, drawn = '', knotOnScreen = '', ready = false;
  let rigW = 1, rigH = 1, sheetH = 0, topPx = 0, cw = 1, ch = 1;
  const size = () => {
    rigW = rig.clientWidth; rigH = rig.clientHeight; sheetH = card.offsetHeight;
    if (!rigW || !rigH) return;
    // Rig pixels, from the rig's top edge: the canvas spans the bow above and the roll's whole run.
    topPx = -ABOVE * rigH;
    const bottomPx = rigH / 2 + Math.max(sheetH / 2 + .18 * rigW, .45 * rigW);
    cw = rigW * (1 + 2 * PAD_X); ch = bottomPx - topPx;
    canvas.style.top = `${topPx}px`;
    canvas.style.height = `${ch}px`;
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    renderer.setSize(cw, ch, false);
    // World units are rig widths, y up, the origin at the rig's centre; the sheet plane (z = 0)
    // maps exactly onto the page.
    const yTop = (rigH / 2 - topPx) / rigW, yBottom = (rigH / 2 - bottomPx) / rigW, cy = (yTop + yBottom) / 2;
    camera.position.set(0, cy, DISTANCE);
    camera.lookAt(0, cy, 0);
    camera.fov = 2 * Math.atan((yTop - yBottom) / 2 / DISTANCE) * 180 / Math.PI;
    camera.aspect = cw / ch;
    camera.updateProjectionMatrix();
    sheet.position.y = cy;
    drawn = '';
  };
  const draw = () => {
    if (!pose || !ready) return;
    const p = pose, lift = p.liftSpring, swing = Math.min(1.08, p.flapSpring), unroll = p.card;
    const signature = [lift, p.seal, swing, unroll, cw, ch, sheetH].map(v => v.toFixed(4)).join();
    if (signature === drawn) return;
    drawn = signature;
    // Lying on the table, then lifted; first along the photo's diagonal, then swung level.
    outer.rotation.set(-32 * Math.PI / 180 * (1 - lift), .22 * (1 - swing), (-g.tilt * (1 - swing) + 8 * (1 - lift)) * Math.PI / 180);
    outer.scale.setScalar(.72 + .28 * lift);
    // It rides the sheet's lower edge (the page centres the sheet as it grows), turning as the
    // paper comes off it and thinning.
    const travel = unroll * sheetH / rigW, radius = 1 - THIN * unroll;
    outer.position.set(0, -travel / 2, r * radius);
    spinner.scale.set(1, radius, radius);
    spinner.rotation.x = -travel / (r * (1 - THIN / 2));
    // The bow loosens, then slips off and falls away.
    const loosen = smooth(0, .3, p.seal), fall = smooth(.2, 1, p.seal), fade = 1 - smooth(.55, 1, p.seal);
    bow.scale.setScalar(1 - .3 * loosen);
    wrap.scale.set(1, 1 + .12 * loosen, 1 + .12 * loosen);
    ribbon.position.set(.04 * fall, -.5 * fall * fall, .14 * fall);
    ribbon.rotation.set(.5 * fall, 0, -.45 * fall);
    ribbon.visible = fade > 0;
    for (const m of ribbonMaterials) { m.transparent = fade < 1; m.opacity = fade; }

    renderer.shadowMap.needsUpdate = true;
    renderer.render(scene, camera);

    // The knot's control follows the medallion, in the photo roll's own (turned) box.
    const at = knotAnchor.getWorldPosition(new Vector3()).project(camera);
    const x = (at.x + 1) / 2 * cw - PAD_X * rigW, y = (1 - at.y) / 2 * ch + topPx;
    const angle = -g.tilt * swing * Math.PI / 180, dx = x - rigW / 2, dy = y - (rigH / 2 + unroll * sheetH / 2);
    const lx = g.axis[0] * rigW + dx * Math.cos(angle) + dy * Math.sin(angle), ly = g.axis[1] * rigH - dx * Math.sin(angle) + dy * Math.cos(angle);
    const knotX = `${(lx / rigW * 100).toFixed(2)}%`, knotY = `${(ly / rigH * 100).toFixed(2)}%`;
    if (knotX + knotY !== knotOnScreen) { knotOnScreen = knotX + knotY; rig.style.setProperty('--knot-x', knotX); rig.style.setProperty('--knot-y', knotY); }
  };

  size();
  await uploadTextures(renderer, [...Object.values(tex), capBump, satin, satinDetail, rosette]);
  await quiet();
  await renderer.compileAsync(scene, camera);
  // One unseen draw compiles the shadow blur and uploads everything now, not on the first scroll.
  await quiet();
  renderer.shadowMap.needsUpdate = true;
  renderer.render(scene, camera);
  size(); // the rig may have changed size while the slots waited
  rig.append(canvas);
  ready = true;
  const resize = new ResizeObserver(() => { size(); draw(); });
  resize.observe(rig);
  resize.observe(card);
  const lost = (event: Event) => { event.preventDefault(); dispose(); };
  canvas.addEventListener('webglcontextlost', lost);
  function dispose() {
    ready = false;
    resize.disconnect();
    canvas.removeEventListener('webglcontextlost', lost);
    rig.classList.remove('object-3d');
    canvas.remove();
    scene.traverse(o => { const m = o as Mesh; if (m.isMesh) { m.geometry.dispose(); (m.material as Material).dispose(); } });
    for (const t of [...Object.values(tex), capBump, satin, satinDetail, rosette]) { t.dispose(); (t.image as ImageBitmap).close?.(); }
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
