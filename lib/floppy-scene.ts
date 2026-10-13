import {
  BoxGeometry, CanvasTexture, Color, DirectionalLight, Fog, Group, HemisphereLight, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, Object3D, PerspectiveCamera, PlaneGeometry, Quaternion, Raycaster, SRGBColorSpace,
  Scene, Texture, Vector2, Vector3, WebGLRenderer, Euler,
} from 'three';

/**
 * The side quests room: four floppy discs floating over a desk, and an old
 * beige PC behind them. Pick a disc up, it flips (each one its own way) to
 * show a short note on the back; insert it and the PC boots it onto the
 * monitor, where the page takes over as HTML laid exactly over the glass.
 *
 * Everything is boxes, planes and canvas textures: no model files to fetch.
 */

export type DiscInfo = { id: string; name: string; number: string; kicker: string; color: string; info: string };
export type Phase = 'deck' | 'moving' | 'inspect' | 'screen';
export type ScreenRect = { left: number; top: number; width: number; height: number };
type Events = { onHover(id: string | null): void; onPhase(phase: Phase, id: string | null): void; onError(): void };

const PAPER = '#f8f0e1', INK = '#1a1410', HOT = '#ff4b12', ACID = '#ccff00', CRT = '#111512';
const DISPLAY = 'Grotesk, Arial, sans-serif', MONO = "'Fira Code Variable', ui-monospace, monospace";

// -- easing ---------------------------------------------------------------
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const inOut = (x: number) => x < .5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
const outBack = (x: number) => { const c = 1.9; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2; };
const span = (u: number, a: number, b: number) => clamp01((u - a) / (b - a));
const bezier = (a: Vector3, c: Vector3, b: Vector3, t: number, out = new Vector3()) =>
  out.set(0, 0, 0).addScaledVector(a, (1 - t) ** 2).addScaledVector(c, 2 * (1 - t) * t).addScaledVector(b, t * t);
const axisQ = (x: number, y: number, z: number, angle: number) => new Quaternion().setFromAxisAngle(new Vector3(x, y, z), angle);
const X = (a: number) => axisQ(1, 0, 0, a), Y = (a: number) => axisQ(0, 1, 0, a), Z = (a: number) => axisQ(0, 0, 1, a);

/**
 * Every flip ends on the same pose (turned half way round Y, back to you) but
 * takes its own road there, so no two discs come out of the deck alike.
 */
const FLIPS: ((u: number) => Quaternion)[] = [
  u => Y(Math.PI * outBack(span(u, .15, 1))),                                         // a plain flip that overshoots and settles
  u => X(Math.PI * inOut(span(u, .1, .85))).multiply(Z(Math.PI * inOut(span(u, .1, .85)))), // over the top edge, righting itself on the way
  u => Z(Math.PI * 2 * inOut(span(u, 0, .9))).multiply(Y(Math.PI * inOut(span(u, .2, 1)))),   // a full spin with the flip inside it
  u => Y(Math.PI * outBack(span(u, .3, 1))).multiply(X(Math.sin(Math.PI * u) * 1.1)),    // tips back, then a late flip
];
const ROUTES = [new Vector3(0, .9, 0), new Vector3(-1.4, .2, .6), new Vector3(.2, -.55, .8), new Vector3(0, 1.5, -.5)];

// -- materials and textures ---------------------------------------------------
const mat = (color: string, extra: Partial<MeshStandardMaterial> = {}) => Object.assign(new MeshStandardMaterial({ color, roughness: .75 }), extra);
const box = (w: number, h: number, d: number, m: MeshStandardMaterial | MeshBasicMaterial) => new Mesh(new BoxGeometry(w, h, d), m);

function paint(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, texture?: CanvasTexture) {
  const canvas = (texture?.image as HTMLCanvasElement | undefined) ?? Object.assign(document.createElement('canvas'), { width: w, height: h });
  draw(canvas.getContext('2d')!);
  const t = texture ?? new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace; t.anisotropy = 4; t.needsUpdate = true;
  return t;
}

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, lineHeight: number) {
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (g.measureText(next).width > width && line) { g.fillText(line, x, y); y += lineHeight; line = word; }
    else line = next;
  }
  if (line) g.fillText(line, x, y);
  return y + lineHeight;
}

function frontLabel(disc: DiscInfo) {
  return paint(512, 360, g => {
    g.fillStyle = '#f7f2e6'; g.fillRect(0, 0, 512, 360);
    g.fillStyle = disc.color; g.fillRect(0, 0, 512, 18);
    g.strokeStyle = '#1a141022'; g.lineWidth = 2;
    for (let y = 150; y < 330; y += 44) { g.beginPath(); g.moveTo(28, y); g.lineTo(484, y); g.stroke(); }
    g.fillStyle = INK; g.font = `500 21px ${MONO}`; g.fillText(`SIDE QUEST ${disc.number}`, 28, 60);
    g.textAlign = 'right'; g.fillText('1.44 MB', 484, 60); g.textAlign = 'left';
    g.font = `700 58px ${DISPLAY}`; wrap(g, disc.name, 28, 136, 450, 60);
    g.fillStyle = HOT; g.font = `500 19px ${MONO}`; g.fillText(disc.kicker.toUpperCase(), 28, 330);
  });
}

function backLabel(disc: DiscInfo) {
  return paint(512, 380, g => {
    g.fillStyle = '#f7f2e6'; g.fillRect(0, 0, 512, 380);
    g.fillStyle = INK; g.font = `500 20px ${MONO}`; g.fillText(`DISC ${disc.number} / READ ME`, 28, 46);
    g.fillRect(28, 62, 456, 3);
    g.font = `700 36px ${DISPLAY}`; const y = wrap(g, disc.name, 28, 112, 456, 40);
    g.font = `400 27px ${DISPLAY}`; wrap(g, disc.info, 28, y + 8, 456, 36);
    g.fillStyle = HOT; g.font = `500 19px ${MONO}`; g.fillText('INSERT TO LOAD ▸', 28, 352);
  });
}

function shadowTexture() {
  return paint(128, 128, g => {
    const r = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    r.addColorStop(0, 'rgba(26,20,16,.55)'); r.addColorStop(1, 'rgba(26,20,16,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  });
}

function keyboardTexture() {
  return paint(512, 176, g => {
    g.fillStyle = '#cbbd9f'; g.fillRect(0, 0, 512, 176);
    g.fillStyle = '#e8dfca'; g.strokeStyle = '#8f8266';
    const rows = [[14, 1], [14, 1], [13, 1.1], [12, 1.2]];
    rows.forEach(([n, w], r) => { for (let i = 0; i < n; i++) { const x = 12 + i * 26 * w + r * 6, y = 12 + r * 32; g.fillRect(x, y, 22 * w, 26); g.strokeRect(x, y, 22 * w, 26); } });
    g.fillRect(110, 142, 200, 24); g.strokeRect(110, 142, 200, 24);
    for (let r = 0; r < 4; r++) for (let i = 0; i < 4; i++) { g.fillRect(400 + i * 26, 12 + r * 32, 22, 26); g.strokeRect(400 + i * 26, 12 + r * 32, 22, 26); }
  });
}

function badgeTexture() {
  return paint(256, 48, g => {
    g.fillStyle = '#c4b799'; g.fillRect(0, 0, 256, 48);
    g.fillStyle = INK; g.font = `700 22px ${DISPLAY}`; g.fillText('MA-486', 10, 32);
    g.font = `500 14px ${MONO}`; g.fillText('DX2 · TURBO', 110, 31);
  });
}

/** The CRT's own picture: a DOS prompt, then the boot log while a disc loads. */
function drawScreen(texture: CanvasTexture | undefined, lines: string[], cursor: boolean) {
  return paint(640, 480, g => {
    g.fillStyle = CRT; g.fillRect(0, 0, 640, 480);
    g.fillStyle = ACID; g.font = `500 24px ${MONO}`;
    lines.forEach((line, i) => g.fillText(line + (cursor && i === lines.length - 1 ? '_' : ''), 34, 56 + i * 34));
    g.fillStyle = 'rgba(0,0,0,.22)'; for (let y = 0; y < 480; y += 4) g.fillRect(0, y, 640, 2);
    const v = g.createRadialGradient(320, 240, 160, 320, 240, 420);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)');
    g.fillStyle = v; g.fillRect(0, 0, 640, 480);
  }, texture);
}
const IDLE = ['MA-DOS 6.22', '', 'Four side quest discs found.', 'Pick one up and insert it.', '', 'C:\\>'];

function release(root: Object3D) {
  root.traverse(object => {
    if (!(object instanceof Mesh)) return;
    object.geometry.dispose();
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      for (const value of Object.values(material)) if (value instanceof Texture) value.dispose();
      material.dispose();
    }
  });
}

// -- the scene -----------------------------------------------------------------
type Pose = { pos: Vector3; quat: Quaternion };
type Tween = { start: number; duration: number; step(u: number): void; done?(): void };
type Disc = {
  info: DiscInfo; index: number; group: Group; body: MeshStandardMaterial; shadow: Mesh;
  pos: Vector3; vel: Vector3; rot: Vector3; rvel: Vector3; scale: number; svel: number; glow: number;
  tween: Tween | null; held: boolean;
};

export async function createFloppyScene(host: HTMLElement, discs: DiscInfo[], events: Events) {
  await Promise.all([document.fonts.load(`700 40px ${DISPLAY}`), document.fonts.load(`500 20px ${MONO}`)]).catch(() => {});

  const renderer = new WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y';
  host.append(canvas);

  const scene = new Scene();
  scene.background = new Color(PAPER);
  scene.fog = new Fog(PAPER, 9, 20);
  const camera = new PerspectiveCamera(34, 1, .05, 60);
  scene.add(new HemisphereLight(0xfff6e6, 0x8a7a66, 1.9));
  const key = new DirectionalLight(0xfff1dc, 2.6); key.position.set(3, 6, 5); scene.add(key);
  const rim = new DirectionalLight(0xff9a6a, 1.1); rim.position.set(-5, 2, -3); scene.add(rim);

  const desk = new Mesh(new PlaneGeometry(40, 40), mat('#eee3cd', { roughness: 1 }));
  desk.rotation.x = -Math.PI / 2; scene.add(desk);
  const shadowMap = shadowTexture();
  const blob = (w: number, d: number, opacity = 1) => {
    const m = new Mesh(new PlaneGeometry(w, d), new MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false, opacity }));
    m.rotation.x = -Math.PI / 2; m.position.y = .003; return m;
  };

  // The PC: a flat desktop case with the monitor sitting on it.
  const beige = mat('#d9cdb1', { roughness: .85 }), beigeDark = mat('#c6b99b', { roughness: .85 }), slotInk = mat('#1b1611', { roughness: 1 });
  const pc = new Group(); pc.position.set(0, 0, -2.2); scene.add(pc);
  const pcShadow = blob(4.4, 3.2, .8); pcShadow.position.set(0, .003, -2.2); scene.add(pcShadow);
  const add = (parent: Object3D, mesh: Mesh, x: number, y: number, z: number) => { mesh.position.set(x, y, z); parent.add(mesh); return mesh; };
  add(pc, box(2.8, .62, 2, beige), 0, .31, 0);
  add(pc, box(2.7, .5, .02, beigeDark), 0, .31, 1.01);
  add(pc, box(1.1, .24, .03, beige), .7, .37, 1.025);
  add(pc, box(.98, .05, .05, slotInk), .7, .38, 1.03);
  add(pc, box(.09, .05, .03, mat('#b5a789')), 1.08, .3, 1.04);
  const driveLed = add(pc, box(.06, .025, .02, mat('#3a2a1c', { emissive: new Color(HOT), emissiveIntensity: 0 })), .32, .3, 1.04).material as MeshStandardMaterial;
  add(pc, box(.13, .13, .03, beige), -1.12, .36, 1.025);
  add(pc, box(.04, .02, .02, mat('#1c3a12', { emissive: new Color('#43d84a'), emissiveIntensity: 1.2 })), -1.12, .2, 1.03);
  add(pc, box(.04, .02, .02, mat('#3a2a1c', { emissive: new Color('#ffb020'), emissiveIntensity: 1 })), -.98, .2, 1.03);
  const badge = new Mesh(new PlaneGeometry(.64, .12), new MeshStandardMaterial({ map: badgeTexture(), roughness: .9 }));
  add(pc, badge, -.5, .4, 1.022);
  for (let i = 0; i < 6; i++) add(pc, box(.5, .012, .01, slotInk), -.5, .3 - i * .03, 1.022);

  const monitor = new Group(); monitor.position.set(0, .62, .05); pc.add(monitor);
  add(monitor, box(.9, .06, .8, beigeDark), 0, .03, 0);
  add(monitor, box(.42, .12, .42, beigeDark), 0, .12, 0);
  add(monitor, box(2.05, 1.62, 1.3, beige), 0, .99, 0);
  add(monitor, box(1.45, 1.15, .8, beige), 0, .95, -.95);
  add(monitor, box(1.84, 1.42, .04, beigeDark), 0, 1.03, .66);
  add(monitor, box(.08, .05, .03, beigeDark), .7, .25, .66);
  const screenTexture = drawScreen(undefined, IDLE, true);
  const screen = add(monitor, new Mesh(new PlaneGeometry(1.52, 1.14), new MeshBasicMaterial({ map: screenTexture, toneMapped: false })), 0, 1.04, .685);
  const keyboard = new Mesh(new BoxGeometry(2.3, .07, .8), [beigeDark, beigeDark, new MeshStandardMaterial({ map: keyboardTexture(), roughness: .9 }), beigeDark, beigeDark, beigeDark]);
  add(scene, keyboard, -.2, .035, -.6).rotation.y = .04;
  const kbShadow = blob(2.6, 1.1, .5); kbShadow.position.set(-.2, .003, -.6); scene.add(kbShadow);

  // The discs. Local +z is the label side, the shutter is at +y.
  const shutter = mat('#d4d8dd', { metalness: .35, roughness: .4 });
  const list: Disc[] = discs.map((info, index) => {
    const group = new Group();
    const body = mat(info.color, { roughness: .45, emissive: new Color(HOT), emissiveIntensity: 0 });
    group.add(box(.9, .9, .034, body));
    add(group, box(.4, .3, .04, shutter), .06, .3, 0);
    add(group, box(.1, .18, .042, slotInk), .12, .31, 0);
    add(group, box(.06, .06, .036, slotInk), -.37, .37, 0);
    add(group, new Mesh(new PlaneGeometry(.74, .52), new MeshStandardMaterial({ map: frontLabel(info), roughness: .9 })), 0, -.15, .0175);
    add(group, new Mesh(new PlaneGeometry(.8, .6), new MeshStandardMaterial({ map: backLabel(info), roughness: .9 })), 0, -.13, -.0175).rotation.y = Math.PI;
    group.traverse(o => { o.userData.disc = info.id; });
    scene.add(group);
    const shadow = blob(1.3, 1.3); scene.add(shadow);
    return { info, index, group, body, shadow, pos: new Vector3(), vel: new Vector3(), rot: new Vector3(), rvel: new Vector3(), scale: 1, svel: 0, glow: 0, tween: null, held: false };
  });

  // -- layout -------------------------------------------------------------------
  const home = { pos: new Vector3(), target: new Vector3(0, 1.2, -1.2) };
  const cam = { pos: new Vector3(), target: new Vector3(), tween: null as Tween | null };
  let spread = 1.2, aspect = 1;
  const slot = new Vector3(.7, .38, -1.17);
  const screenCenter = new Vector3(), screenSize = new Vector2(1.52, 1.14);
  screen.updateWorldMatrix(true, false); screen.getWorldPosition(screenCenter);

  const layout = () => {
    const { clientWidth: w, clientHeight: h } = host;
    if (!w || !h) return;
    aspect = w / h;
    renderer.setSize(w, h, false);
    camera.aspect = aspect; camera.updateProjectionMatrix();
    spread = Math.min(1.25, Math.max(.98, aspect * .5));
    home.pos.set(0, 1.75, 6.1 * Math.max(1, 1.75 / aspect));
    if (!cam.tween && phase !== 'screen') { cam.pos.copy(home.pos); cam.target.copy(home.target); }
    if (phase === 'screen') { cam.pos.copy(screenView()); cam.target.copy(screenCenter); }
    wake();
  };
  const deckRest = (d: Disc) => new Vector3((d.index - 1.5) * spread, .95, 1.4);
  const deckEuler = (d: Disc) => new Vector3(-.12, -(d.index - 1.5) * .14, [.09, -.05, .07, -.1][d.index % 4]);
  const holdPose = (): Pose => {
    const pos = new Vector3().subVectors(home.target, home.pos).normalize().multiplyScalar(2.8).add(home.pos);
    const face = new Object3D(); face.position.copy(pos); face.lookAt(home.pos);
    return { pos, quat: face.quaternion.clone() };
  };
  const screenView = () => {
    const fit = Math.tan((camera.fov * Math.PI) / 360);
    const d = Math.max(screenSize.y / (2 * fit * .76), screenSize.x / (2 * fit * aspect * .84));
    return screenCenter.clone().add(new Vector3(0, 0, d));
  };

  // -- state --------------------------------------------------------------------
  let phase: Phase = 'deck';
  let selected: Disc | null = null;
  let hovered: Disc | null = null;
  const pointer = new Vector2(), lean = new Vector2();
  let boot: { start: number; disc: DiscInfo } | null = null;
  const setPhase = (next: Phase) => { phase = next; events.onPhase(next, selected?.info.id ?? null); wake(); };
  const setHover = (disc: Disc | null) => {
    if (hovered === disc) return;
    hovered = disc; canvas.style.cursor = disc ? 'pointer' : 'default';
    events.onHover(disc?.info.id ?? null); wake();
  };
  const settle = (d: Disc) => {
    d.tween = null; d.pos.copy(d.group.position);
    const e = new Euler().setFromQuaternion(d.group.quaternion); d.rot.set(e.x, e.y, e.z);
    d.vel.set(0, 0, 0); d.rvel.set(0, 0, 0);
  };
  const now = () => performance.now() / 1000;
  const deckPose = (d: Disc): Pose => {
    const r = deckEuler(d);
    return { pos: deckRest(d), quat: new Quaternion().setFromEuler(new Euler(r.x, r.y, r.z)) };
  };

  /** Bring a disc out of the deck, up to you, and turn it over. */
  const flightTo = (d: Disc, reverse: boolean, done: () => void) => {
    const from = deckPose(d), to = holdPose();
    const route = new Vector3().addVectors(from.pos, to.pos).multiplyScalar(.5).add(ROUTES[d.index % 4].clone().multiply(new Vector3(Math.sign(d.index - 1.5) || 1, 1, 1)));
    const flip = FLIPS[d.index % 4];
    d.tween = {
      start: now(), duration: reverse ? 1 : 1.35,
      step(raw) {
        const u = reverse ? 1 - raw : raw;
        bezier(from.pos, route, to.pos, inOut(span(u, 0, .8)), d.group.position);
        d.group.quaternion.slerpQuaternions(from.quat, to.quat, inOut(span(u, 0, .7))).multiply(flip(u));
        d.group.scale.setScalar(1 + .06 * Math.sin(Math.PI * u));
      },
      done,
    };
  };

  const insertQuat = X(-Math.PI / 2);
  const preSlot = () => slot.clone().add(new Vector3(0, 0, .52));
  const select = (id: string) => {
    const d = list.find(x => x.info.id === id);
    if (!d || phase !== 'deck') return;
    selected = d; setHover(null); setPhase('moving');
    flightTo(d, false, () => { d.held = true; d.tween = null; setPhase('inspect'); });
  };
  const putBack = () => {
    const d = selected;
    if (!d || phase !== 'inspect') return;
    d.held = false; setPhase('moving');
    flightTo(d, true, () => { settle(d); d.group.scale.setScalar(1); selected = null; setPhase('deck'); });
  };
  const insert = () => {
    const d = selected;
    if (!d || phase !== 'inspect') return;
    d.held = false; setPhase('moving');
    const fromPos = d.group.position.clone(), fromQuat = d.group.quaternion.clone(), pre = preSlot();
    const approach = slot.clone().add(new Vector3(-.2, .7, 1.6));
    const inside = slot.clone().add(new Vector3(0, 0, -.5));
    d.tween = {
      start: now(), duration: 1.7,
      step(u) {
        if (u < .62) {
          const t = inOut(u / .62);
          bezier(fromPos, approach, pre, t, d.group.position);
          d.group.quaternion.slerpQuaternions(fromQuat, insertQuat, inOut(span(u, .05, .55)));
        } else {
          const t = span(u, .7, 1);
          d.group.position.lerpVectors(pre, inside, t * t * (3 - 2 * t));
          d.group.quaternion.copy(insertQuat);
        }
        d.group.scale.setScalar(1);
      },
      done() { d.tween = null; d.group.visible = false; d.shadow.visible = false; boot = { start: now(), disc: d.info }; toScreen(1.5); },
    };
  };
  const toScreen = (duration: number) => {
    const fromPos = cam.pos.clone(), fromTarget = cam.target.clone(), toPos = screenView();
    cam.tween = {
      start: now() + .45, duration,
      step(u) { const t = inOut(u); cam.pos.lerpVectors(fromPos, toPos, t); cam.target.lerpVectors(fromTarget, screenCenter, t); },
      done() { cam.tween = null; setPhase('screen'); },
    };
  };
  const eject = () => {
    const d = selected;
    if (!d || phase !== 'screen') return;
    setPhase('moving'); boot = null;
    drawScreen(screenTexture, IDLE, true);
    const fromPos = cam.pos.clone(), fromTarget = cam.target.clone();
    cam.tween = {
      start: now(), duration: 1.1,
      step(u) { const t = inOut(u); cam.pos.lerpVectors(fromPos, home.pos, t); cam.target.lerpVectors(fromTarget, home.target, t); },
      done() {
        cam.tween = null;
        d.group.visible = true; d.shadow.visible = true;
        const inside = slot.clone().add(new Vector3(0, 0, -.5)), pre = preSlot(), rest = deckPose(d);
        const lift = new Vector3().addVectors(pre, rest.pos).multiplyScalar(.5).add(new Vector3(0, 1.1, .4));
        d.tween = {
          start: now(), duration: 1.4,
          step(u) {
            if (u < .25) { d.group.position.lerpVectors(inside, pre, inOut(u / .25)); d.group.quaternion.copy(insertQuat); return; }
            const t = inOut(span(u, .25, 1));
            bezier(pre, lift, rest.pos, t, d.group.position);
            d.group.quaternion.slerpQuaternions(insertQuat, rest.quat, t).multiply(Z(Math.PI * 2 * t * (d.index % 2 ? 1 : -1)));
          },
          done() { settle(d); selected = null; setPhase('deck'); },
        };
      },
    };
  };
  /** For a link straight to a disc: skip the show, land on the monitor. */
  const openInstant = (id: string) => {
    const d = list.find(x => x.info.id === id);
    if (!d || phase !== 'deck') return;
    selected = d; d.group.visible = false; d.shadow.visible = false;
    boot = { start: now() - 10, disc: d.info };
    cam.pos.copy(screenView()); cam.target.copy(screenCenter);
    setPhase('screen');
  };

  // -- input --------------------------------------------------------------------
  const ray = new Raycaster();
  const pick = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(list.filter(d => d.group.visible).map(d => d.group), true)[0];
    return list.find(d => d.info.id === hit?.object.userData.disc) ?? null;
  };
  let down: { x: number; y: number } | null = null;
  const onMove = (e: PointerEvent) => { const d = pick(e); if (phase === 'deck') setHover(d); wake(); };
  const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
  const onUp = (e: PointerEvent) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) { down = null; return; }
    down = null;
    const d = pick(e);
    if (phase === 'deck' && d) select(d.info.id);
    else if (phase === 'inspect' && d !== selected) putBack();
  };
  const onLeave = () => { pointer.set(0, 0); if (phase === 'deck') setHover(null); };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointerleave', onLeave);

  // -- loop ---------------------------------------------------------------------
  let frame = 0, last = now(), visible = true, lastBootLines = -1, lastCursor = true;
  const K = 42, C = 8.5; // springs a little under critical damping, so a disc has some weight to it
  const tick = () => {
    frame = 0;
    const t = now(), dt = Math.min(1 / 30, t - last); last = t;
    lean.lerp(pointer, 1 - Math.exp(-dt * 4));

    for (const d of list) {
      if (d.tween) {
        const u = clamp01((t - d.tween.start) / d.tween.duration);
        d.tween.step(u);
        if (u >= 1) { const done = d.tween.done; d.tween = null; done?.(); }
      } else if (d.held) {
        const hold = holdPose(), φ = d.index * 1.7;
        d.group.position.copy(hold.pos).add(new Vector3(.02 * Math.sin(t * 1.1 + φ), .035 * Math.sin(t * 1.4 + φ) + .012 * Math.sin(t * 3.1), 0));
        d.group.quaternion.copy(hold.quat).multiply(Y(Math.PI)).multiply(X(-lean.y * .22 + .04 * Math.sin(t * 1.2 + φ))).multiply(Y(lean.x * .3 + .05 * Math.sin(t * .9 + φ)));
      } else if (d.group.visible) {
        const φ = d.index * 2.3, over = hovered === d ? 1 : 0;
        // While one disc is out, the rest shuffle aside and sink a little.
        const aside = selected && selected !== d ? 1 : 0, side = Math.sign(d.index - 1.5);
        const target = deckRest(d).add(new Vector3(aside * side * .95, -aside * .3, -aside * .2)).add(new Vector3(
          .025 * Math.sin(t * .6 + φ * 3),
          .055 * Math.sin(t * .8 + φ) + .025 * Math.sin(t * 1.9 + φ * 2) + over * .3,
          over * .4,
        ));
        const r = deckEuler(d).multiplyScalar(1 - over);
        r.x += .035 * Math.sin(t * 1.1 + φ * 2) - lean.y * .08 * (1 - over) + over * -.04;
        r.y += lean.x * .14;
        r.z += .045 * Math.sin(t * .7 + φ) + .02 * Math.sin(t * 1.6 + φ * 1.3);
        d.vel.addScaledVector(target.sub(d.pos), K * dt).multiplyScalar(Math.exp(-C * dt)); d.pos.addScaledVector(d.vel, dt);
        d.rvel.addScaledVector(r.sub(d.rot), K * dt).multiplyScalar(Math.exp(-C * dt)); d.rot.addScaledVector(d.rvel, dt);
        d.svel += ((1 + over * .07) - d.scale) * K * dt; d.svel *= Math.exp(-C * dt); d.scale += d.svel * dt;
        d.group.position.copy(d.pos); d.group.rotation.set(d.rot.x, d.rot.y, d.rot.z); d.group.scale.setScalar(d.scale);
      }
      d.glow += ((hovered === d || selected === d && phase === 'inspect' ? .16 : 0) - d.glow) * (1 - Math.exp(-dt * 10));
      d.body.emissiveIntensity = d.glow;
      // A soft shadow on the desk that spreads and fades as the disc lifts.
      const h = d.group.position.y;
      d.shadow.position.set(d.group.position.x, .004, d.group.position.z);
      d.shadow.scale.setScalar(.7 + h * .35);
      (d.shadow.material as MeshBasicMaterial).opacity = Math.max(0, .75 - h * .28);
    }

    if (cam.tween) {
      const u = clamp01((t - cam.tween.start) / cam.tween.duration);
      cam.tween.step(u);
      if (u >= 1) { const done = cam.tween.done; cam.tween = null; done?.(); }
    }
    const sway = phase === 'deck' || phase === 'inspect' ? 1 : 0;
    camera.position.copy(cam.pos).add(new Vector3(lean.x * .3 * sway, lean.y * .14 * sway, 0));
    camera.lookAt(cam.target);

    // The drive light and the boot log.
    if (boot) {
      const e = Math.max(0, t - boot.start), name = boot.disc.name.toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 8);
      driveLed.emissiveIntensity = e < 1.6 ? (Math.sin(e * 40) > 0 ? 2 : .3) : 0;
      const log = ['MA-DOS 6.22', '', 'C:\\>A:', `A:\\>${name}.EXE`, `Loading side quest ${boot.disc.number}...`, `[${'#'.repeat(Math.min(16, Math.floor(e * 11)))}${'.'.repeat(Math.max(0, 16 - Math.floor(e * 11)))}]`];
      const shown = Math.min(log.length, 2 + Math.floor(e * 4));
      const key = shown * 100 + Math.min(16, Math.floor(e * 11));
      if (key !== lastBootLines) { lastBootLines = key; drawScreen(screenTexture, log.slice(0, shown), false); }
    } else {
      driveLed.emissiveIntensity = 0;
      const cursor = Math.floor(t * 2) % 2 === 0;
      if (cursor !== lastCursor || lastBootLines !== -1) { lastCursor = cursor; lastBootLines = -1; drawScreen(screenTexture, IDLE, cursor); }
    }

    renderer.render(scene, camera);
    // Once the page is up on the monitor nothing moves, so stop drawing.
    if (visible && !(phase === 'screen' && !cam.tween)) frame = requestAnimationFrame(tick);
  };
  const wake = () => { if (!frame && visible) { last = now(); frame = requestAnimationFrame(tick); } };

  const resize = new ResizeObserver(layout); resize.observe(host);
  const seen = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && !document.hidden; if (visible) wake(); });
  seen.observe(host);
  const onVisibility = () => { visible = !document.hidden; if (visible) wake(); };
  document.addEventListener('visibilitychange', onVisibility);
  const onLost = (e: Event) => { e.preventDefault(); events.onError(); };
  canvas.addEventListener('webglcontextlost', onLost);
  layout();
  list.forEach(d => { const p = deckPose(d); d.group.position.copy(p.pos); d.group.quaternion.copy(p.quat); settle(d); });
  wake();

  return {
    hover(id: string | null) { if (phase === 'deck') setHover(list.find(d => d.info.id === id) ?? null); },
    select, putBack, insert, eject, openInstant,
    get phase() { return phase; },
    /** Where the monitor's glass sits in the canvas, in CSS pixels. */
    screenRect(): ScreenRect {
      camera.updateMatrixWorld();
      const half = screenSize.clone().multiplyScalar(.5);
      const corners = [[-1, -1], [1, 1]].map(([sx, sy]) => screenCenter.clone().add(new Vector3(sx * half.x, sy * half.y, 0)).project(camera));
      const w = host.clientWidth, h = host.clientHeight;
      const left = (corners[0].x + 1) / 2 * w, right = (corners[1].x + 1) / 2 * w;
      const top = (1 - corners[1].y) / 2 * h, bottom = (1 - corners[0].y) / 2 * h;
      return { left, top, width: right - left, height: bottom - top };
    },
    dispose() {
      cancelAnimationFrame(frame); frame = 0; resize.disconnect(); seen.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      release(scene); shadowMap.dispose(); renderer.dispose(); canvas.remove();
    },
  };
}

export type FloppyScene = Awaited<ReturnType<typeof createFloppyScene>>;
