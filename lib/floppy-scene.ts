import {
  CanvasTexture, Color, CylinderGeometry, DirectionalLight, Fog, Group, HemisphereLight, Mesh,
  MeshBasicMaterial, MeshStandardMaterial, Object3D, PerspectiveCamera, Plane, PlaneGeometry, BoxGeometry, Quaternion,
  Raycaster, SRGBColorSpace, Scene, Texture, Vector2, Vector3, WebGLRenderer, Euler,
} from 'three';

/**
 * The side quests room: four 3.5" floppy discs floating in a neat row. Pick
 * one up and it flips (each its own way) to a short note on the back; insert
 * it and it slides into a disc port fixed on the right edge of the stage, and
 * its page boots up over the room.
 *
 * Everything is boxes, planes and canvas textures: no model files.
 */

export type DiscInfo = { id: string; name: string; number: string; kicker: string; color: string; info: string };
export type Phase = 'deck' | 'moving' | 'inspect' | 'loading' | 'screen';
export type Rect = { left: number; top: number; width: number; height: number };
type Events = { onHover(id: string | null): void; onPhase(phase: Phase, id: string | null): void; onLayout(): void; onError(): void };

const PAPER = '#f8f0e1', INK = '#1a1410', HOT = '#ff4b12';
const DISPLAY = 'Grotesk, Arial, sans-serif', MONO = "'Fira Code Variable', ui-monospace, monospace";
/** The port sits left of the checkpoint rail (fixed 14px from the right, 48px wide). */
const PORT_WIDTH = 40, PORT_RIGHT = 92;
const DISC_W = .9, DISC_H = .94, DISC_D = .032;

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
 * takes its own road there, so no two discs come out of the row alike.
 */
const FLIPS: ((u: number) => Quaternion)[] = [
  u => Y(Math.PI * outBack(span(u, .15, 1))),                                                    // a plain flip that overshoots and settles
  u => X(Math.PI * inOut(span(u, .1, .85))).multiply(Z(Math.PI * inOut(span(u, .1, .85)))),    // over the top edge, righting itself on the way
  u => Z(Math.PI * 2 * inOut(span(u, 0, .9))).multiply(Y(Math.PI * inOut(span(u, .2, 1)))),    // a full spin with the flip inside it
  u => Y(Math.PI * outBack(span(u, .3, 1))).multiply(X(Math.sin(Math.PI * u) * 1.1)),           // tips back, then a late flip
];
const ROUTES = [new Vector3(0, .8, 0), new Vector3(-1.2, .2, .5), new Vector3(.2, -.5, .7), new Vector3(0, 1.3, -.4)];

// -- materials and textures ---------------------------------------------------
const mat = (color: string, extra: Partial<MeshStandardMaterial> = {}) => Object.assign(new MeshStandardMaterial({ color, roughness: .75 }), extra);

function paint(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const canvas = Object.assign(document.createElement('canvas'), { width: w, height: h });
  draw(canvas.getContext('2d')!);
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace; t.anisotropy = 4;
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
  return paint(512, 346, g => {
    g.fillStyle = '#f7f2e6'; g.fillRect(0, 0, 512, 346);
    g.fillStyle = INK; g.fillRect(0, 0, 512, 54);
    g.fillStyle = '#f7f2e6'; g.font = `700 26px ${DISPLAY}`; g.fillText('SIDE QUEST', 26, 37);
    g.font = `500 19px ${MONO}`; g.textAlign = 'right'; g.fillText(`${disc.number} · 1.44 MB`, 486, 35); g.textAlign = 'left';
    g.strokeStyle = '#1a141020'; g.lineWidth = 2;
    for (let y = 150; y < 320; y += 42) { g.beginPath(); g.moveTo(26, y); g.lineTo(486, y); g.stroke(); }
    g.fillStyle = INK; g.font = `700 54px ${DISPLAY}`; wrap(g, disc.name, 26, 130, 460, 56);
    g.fillStyle = HOT; g.font = `500 18px ${MONO}`; g.fillText(disc.kicker.toUpperCase(), 26, 322);
  });
}

function backLabel(disc: DiscInfo) {
  return paint(512, 198, g => {
    g.fillStyle = '#f7f2e6'; g.fillRect(0, 0, 512, 198);
    g.fillStyle = INK; g.font = `700 25px ${DISPLAY}`; g.fillText(disc.name, 20, 36);
    g.fillStyle = HOT; g.font = `500 15px ${MONO}`; g.textAlign = 'right'; g.fillText('INSERT TO LOAD ▸', 492, 34); g.textAlign = 'left';
    g.fillStyle = INK; g.fillRect(20, 48, 472, 2);
    g.font = `400 23px ${DISPLAY}`; wrap(g, disc.info, 20, 82, 472, 30);
  });
}

/** The moulded marks on the front: the insert arrow (top left) and HD (top right). */
function marks() {
  return paint(256, 32, g => {
    g.fillStyle = '#ffffff';
    g.beginPath(); g.moveTo(14, 4); g.lineTo(4, 26); g.lineTo(24, 26); g.closePath(); g.fill();
    g.font = `700 24px ${DISPLAY}`; g.textAlign = 'right'; g.fillText('HD', 250, 25);
  });
}

function shadowTexture() {
  return paint(128, 128, g => {
    const r = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    r.addColorStop(0, 'rgba(26,20,16,.5)'); r.addColorStop(1, 'rgba(26,20,16,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  });
}

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
  renderer.localClippingEnabled = true;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y';
  host.append(canvas);

  const scene = new Scene();
  scene.background = new Color(PAPER);
  scene.fog = new Fog(PAPER, 8, 18);
  const camera = new PerspectiveCamera(34, 1, .05, 60);
  scene.add(new HemisphereLight(0xfff6e6, 0x8a7a66, 1.9));
  const key = new DirectionalLight(0xfff1dc, 2.6); key.position.set(3, 6, 5); scene.add(key);
  const rim = new DirectionalLight(0xff9a6a, 1.1); rim.position.set(-5, 2, -3); scene.add(rim);

  // The ground is the section's own paper, so only the shadows show.
  const ground = new Mesh(new PlaneGeometry(40, 40), new MeshBasicMaterial({ color: PAPER }));
  ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const shadowMap = shadowTexture();

  // Anything right of the port's mouth is cut away, so a disc vanishes into it.
  const portClip = new Plane(new Vector3(-1, 0, 0), 100);
  const clipping = { clippingPlanes: [portClip] };

  // The discs. Local +z is the label side; the shutter is at +y.
  const bodyGeometry = new BoxGeometry(DISC_W, DISC_H, DISC_D);
  const metal = mat('#d5d9de', { metalness: .4, roughness: .35, ...clipping });
  const hole = mat('#141210', { roughness: 1, ...clipping });
  const media = mat('#4a3a2c', { roughness: .6, ...clipping });
  const marking = marks();
  const place = (parent: Object3D, mesh: Mesh, x: number, y: number, z: number) => { mesh.position.set(x, y, z); parent.add(mesh); return mesh; };
  const face = DISC_D / 2 + .0035;

  const list: Disc[] = discs.map((info, index) => {
    const group = new Group();
    const body = mat(info.color, { roughness: .42, emissive: new Color(HOT), emissiveIntensity: 0, ...clipping });
    const shade = mat(new Color(info.color).multiplyScalar(.82).getStyle(), { roughness: .5, ...clipping });
    group.add(new Mesh(bodyGeometry, body));
    // Front: shutter with its window, label, the moulded marks, and the two corner holes.
    place(group, new Mesh(new BoxGeometry(.6, .33, DISC_D + .004), shade), .03, .305, 0);
    place(group, new Mesh(new BoxGeometry(.44, .33, DISC_D + .008), metal), .05, .305, 0);
    place(group, new Mesh(new BoxGeometry(.1, .21, DISC_D + .009), media), .16, .3, 0);
    place(group, new Mesh(new PlaneGeometry(.74, .47), mat('#ffffff', { map: frontLabel(info), roughness: .9, ...clipping })), 0, -.15, face);
    place(group, new Mesh(new PlaneGeometry(.84, .105), new MeshBasicMaterial({ map: marking, transparent: true, opacity: .55, depthWrite: false, ...clipping })), 0, .38, face);
    place(group, new Mesh(new BoxGeometry(.045, .045, DISC_D + .006), hole), -.39, -.42, 0);
    place(group, new Mesh(new BoxGeometry(.045, .045, DISC_D + .006), hole), .39, -.42, 0);
    // Back: the metal hub and a sticker with the short note.
    const hub = place(group, new Mesh(new CylinderGeometry(.125, .125, .004, 40), metal), 0, .02, -face);
    hub.rotation.x = Math.PI / 2;
    place(group, new Mesh(new BoxGeometry(.05, .05, .006), hole), 0, .02, -face);
    place(group, new Mesh(new BoxGeometry(.035, .06, .006), hole), .07, .055, -face);
    place(group, new Mesh(new PlaneGeometry(.8, .31), mat('#ffffff', { map: backLabel(info), roughness: .9, ...clipping })), 0, -.28, -face).rotation.y = Math.PI;
    group.traverse(o => { o.userData.disc = info.id; });
    scene.add(group);
    const shadow = new Mesh(new PlaneGeometry(1.3, 1.3), new MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; scene.add(shadow);
    return { info, index, group, body, shadow, pos: new Vector3(), vel: new Vector3(), rot: new Vector3(), rvel: new Vector3(), scale: 1, svel: 0, glow: 0, tween: null, held: false };
  });

  // -- layout -------------------------------------------------------------------
  const home = { pos: new Vector3(), target: new Vector3(0, .82, 0) };
  let spread = 1.15, width = 1, height = 1;
  const DECK_Y = 1, DECK_Z = .8;
  const port = { mouth: new Vector3(), rect: { left: 0, top: 0, width: PORT_WIDTH, height: 0 } as Rect };

  /** Where a point on screen meets the plane the row floats in. */
  const onDeckPlane = (px: number, py: number) => {
    const ray = new Raycaster(); ray.setFromCamera(new Vector2(px / width * 2 - 1, 1 - py / height * 2), camera);
    const t = (DECK_Z - ray.ray.origin.z) / ray.ray.direction.z;
    return ray.ray.at(t, new Vector3());
  };
  const toScreen = (v: Vector3) => { const p = v.clone().project(camera); return new Vector2((p.x + 1) / 2 * width, (1 - p.y) / 2 * height); };

  const layout = () => {
    width = host.clientWidth; height = host.clientHeight;
    if (!width || !height) return;
    const aspect = width / height;
    renderer.setSize(width, height, false);
    camera.aspect = aspect; camera.updateProjectionMatrix();
    spread = Math.min(1.2, Math.max(1, aspect * .48));
    home.pos.set(0, 1.5, 5.4 * Math.max(1, 1.85 / aspect));
    camera.position.copy(home.pos); camera.lookAt(home.target); camera.updateMatrixWorld();
    // The port: a fixed slot on the right edge, as tall as a disc on screen.
    const centre = toScreen(new Vector3(0, DECK_Y, DECK_Z));
    const discHeight = toScreen(new Vector3(0, DECK_Y - DISC_W / 2, DECK_Z)).y - toScreen(new Vector3(0, DECK_Y + DISC_W / 2, DECK_Z)).y;
    const left = width - PORT_RIGHT - PORT_WIDTH;
    port.rect = { left, top: centre.y - discHeight / 2 - 14, width: PORT_WIDTH, height: discHeight + 28 };
    port.mouth.copy(onDeckPlane(left + 6, centre.y));
    const top = onDeckPlane(left + 6, 0), bottom = onDeckPlane(left + 6, height);
    portClip.setFromCoplanarPoints(home.pos, top, bottom);
    if (portClip.distanceToPoint(new Vector3(0, DECK_Y, DECK_Z)) < 0) portClip.negate();
    events.onLayout();
    wake();
  };
  const deckPose = (d: Disc): Pose => ({ pos: new Vector3((d.index - 1.5) * spread, DECK_Y, DECK_Z), quat: new Quaternion().setFromEuler(new Euler(-.1, 0, 0)) });
  const facing = (pos: Vector3) => { const o = new Object3D(); o.position.copy(pos); o.lookAt(home.pos); return o.quaternion.clone(); };
  const holdPose = (): Pose => {
    const pos = new Vector3().subVectors(home.target, home.pos).normalize().multiplyScalar(2.45).add(home.pos);
    return { pos, quat: facing(pos) };
  };

  // -- state --------------------------------------------------------------------
  let phase: Phase = 'deck';
  let selected: Disc | null = null;
  let hovered: Disc | null = null;
  const pointer = new Vector2(), lean = new Vector2();
  const setPhase = (next: Phase) => { phase = next; events.onPhase(next, selected?.info.id ?? null); wake(); };
  const setHover = (disc: Disc | null) => {
    if (hovered === disc) return;
    hovered = disc; canvas.style.cursor = disc ? 'pointer' : 'default';
    events.onHover(disc?.info.id ?? null); wake();
  };
  const settle = (d: Disc) => {
    d.tween = null; d.pos.copy(d.group.position);
    const e = new Euler().setFromQuaternion(d.group.quaternion); d.rot.set(e.x, e.y, e.z);
    d.vel.set(0, 0, 0); d.rvel.set(0, 0, 0); d.scale = d.group.scale.x; d.svel = 0;
  };
  const now = () => performance.now() / 1000;

  /** Bring a disc out of the row, up to you, and turn it over. */
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

  // Slot-ready pose: label to you, shutter edge pointing into the port.
  const slotPose = () => {
    const pre = port.mouth.clone().add(new Vector3(-DISC_H / 2 - .06, 0, 0));
    return { pre, inside: port.mouth.clone().add(new Vector3(DISC_H / 2 + .2, 0, 0)), quat: facing(pre).multiply(Z(-Math.PI / 2)) };
  };

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
    flightTo(d, true, () => { settle(d); selected = null; setPhase('deck'); });
  };
  let loading: ReturnType<typeof setTimeout> | undefined;
  const insert = () => {
    const d = selected;
    if (!d || phase !== 'inspect') return;
    d.held = false; setPhase('moving');
    const fromPos = d.group.position.clone(), fromQuat = d.group.quaternion.clone(), slot = slotPose();
    const approach = new Vector3().addVectors(fromPos, slot.pre).multiplyScalar(.5).add(new Vector3(0, .6, .3));
    d.tween = {
      start: now(), duration: 1.55,
      step(u) {
        if (u < .6) {
          bezier(fromPos, approach, slot.pre, inOut(u / .6), d.group.position);
          d.group.quaternion.slerpQuaternions(fromQuat, slot.quat, inOut(span(u, .05, .55)));
          d.group.scale.setScalar(1);
        } else {
          const t = span(u, .66, 1);
          d.group.position.lerpVectors(slot.pre, slot.inside, t * t * (3 - 2 * t));
          d.group.quaternion.copy(slot.quat);
        }
      },
      done() {
        d.group.visible = false; d.shadow.visible = false; setPhase('loading');
        loading = setTimeout(() => setPhase('screen'), 950);
      },
    };
  };
  const eject = () => {
    const d = selected;
    if (!d || (phase !== 'screen' && phase !== 'loading')) return;
    clearTimeout(loading);
    setPhase('moving');
    d.group.visible = true; d.shadow.visible = true;
    const slot = slotPose(), rest = deckPose(d);
    const lift = new Vector3().addVectors(slot.pre, rest.pos).multiplyScalar(.5).add(new Vector3(0, .9, .4));
    d.group.position.copy(slot.inside); d.group.quaternion.copy(slot.quat); d.group.scale.setScalar(1);
    d.tween = {
      start: now() + .15, duration: 1.4,
      step(u) {
        if (u < .3) { d.group.position.lerpVectors(slot.inside, slot.pre, inOut(u / .3)); d.group.quaternion.copy(slot.quat); return; }
        const t = inOut(span(u, .3, 1));
        bezier(slot.pre, lift, rest.pos, t, d.group.position);
        d.group.quaternion.slerpQuaternions(slot.quat, rest.quat, t);
      },
      done() { settle(d); selected = null; setPhase('deck'); },
    };
  };
  /** For a link straight to a disc: skip the show, land on its page. */
  const openInstant = (id: string) => {
    const d = list.find(x => x.info.id === id);
    if (!d || phase !== 'deck') return;
    selected = d; d.group.visible = false; d.shadow.visible = false;
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
  let frame = 0, last = now(), visible = true;
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
        d.group.position.copy(hold.pos).add(new Vector3(.02 * Math.sin(t * 1.1 + φ), .03 * Math.sin(t * 1.4 + φ) + .01 * Math.sin(t * 3.1), 0));
        d.group.quaternion.copy(hold.quat).multiply(Y(Math.PI)).multiply(X(-lean.y * .22 + .04 * Math.sin(t * 1.2 + φ))).multiply(Y(lean.x * .3 + .05 * Math.sin(t * .9 + φ)));
      } else if (d.group.visible) {
        // The row keeps its line: one slow wave runs along it, and the discs
        // all lean the same way towards the pointer.
        const wave = t * 1.1 - d.index * .75, over = hovered === d ? 1 : 0;
        const aside = selected && selected !== d ? 1 : 0;
        const target = deckPose(d).pos.add(new Vector3(0, .045 * Math.sin(wave) + .015 * Math.sin(wave * 2.3) + over * .28 - aside * .22, over * .35 - aside * .3));
        const r = new Vector3(-.1 + .03 * Math.sin(wave + 1) - lean.y * .1 + over * .06, lean.x * .16, .02 * Math.sin(wave * .8));
        d.vel.addScaledVector(target.sub(d.pos), K * dt).multiplyScalar(Math.exp(-C * dt)); d.pos.addScaledVector(d.vel, dt);
        d.rvel.addScaledVector(r.sub(d.rot), K * dt).multiplyScalar(Math.exp(-C * dt)); d.rot.addScaledVector(d.rvel, dt);
        d.svel += ((1 + over * .07) - d.scale) * K * dt; d.svel *= Math.exp(-C * dt); d.scale += d.svel * dt;
        d.group.position.copy(d.pos); d.group.rotation.set(d.rot.x, d.rot.y, d.rot.z); d.group.scale.setScalar(d.scale);
      }
      d.glow += ((hovered === d || selected === d && phase === 'inspect' ? .16 : 0) - d.glow) * (1 - Math.exp(-dt * 10));
      d.body.emissiveIntensity = d.glow;
      // A soft shadow on the ground that spreads and fades as the disc lifts.
      const h = d.group.position.y;
      d.shadow.position.set(d.group.position.x, .004, d.group.position.z);
      d.shadow.scale.setScalar(.75 + h * .3);
      (d.shadow.material as MeshBasicMaterial).opacity = Math.max(0, .7 - h * .25);
    }

    const sway = phase === 'deck' || phase === 'inspect' ? 1 : 0;
    camera.position.copy(home.pos).add(new Vector3(lean.x * .25 * sway, lean.y * .12 * sway, 0));
    camera.lookAt(home.target);
    renderer.render(scene, camera);
    // Once a page is up nothing in the room moves, so stop drawing.
    if (visible && phase !== 'screen') frame = requestAnimationFrame(tick);
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
    /** The disc port's place on the stage, in CSS pixels. */
    portRect(): Rect { return port.rect; },
    dispose() {
      cancelAnimationFrame(frame); frame = 0; clearTimeout(loading); resize.disconnect(); seen.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      release(scene); shadowMap.dispose(); renderer.dispose(); canvas.remove();
    },
  };
}

export type FloppyScene = Awaited<ReturnType<typeof createFloppyScene>>;
