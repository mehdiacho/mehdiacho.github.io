import {
  CanvasTexture, Color, CylinderGeometry, DirectionalLight, Fog, Group, HemisphereLight, Mesh,
  MeshBasicMaterial, MeshStandardMaterial, Object3D, PerspectiveCamera, Plane, PlaneGeometry, BoxGeometry, Quaternion,
  Raycaster, SRGBColorSpace, Scene, Texture, Vector2, Vector3, WebGLRenderer, Euler,
} from 'three';

/**
 * The side quests room: four 3.5" floppy discs floating in a neat row. Pick
 * one up and it flips (each its own way) to a short note on the back; insert
 * it and it is carried from where you hold it, away from you, into the drive
 * at the right of the room: shutter first, until only its tail is left
 * sticking out of the slot. Then its page boots up over the room.
 *
 * Everything is boxes, planes and canvas textures: no model files.
 */

export type DiscInfo = { id: string; name: string; number: string; kicker: string; color: string; info: string };
export type Phase = 'deck' | 'moving' | 'inspect' | 'loading' | 'screen';
export type Rect = { left: number; top: number; width: number; height: number };
type Events = { onHover(id: string | null): void; onPhase(phase: Phase, id: string | null): void; onLayout(): void; onError(): void };

const PAPER = '#f8f0e1', INK = '#1a1410', HOT = '#ff4b12';
const DISPLAY = 'Grotesk, Arial, sans-serif', MONO = "'Fira Code Variable', ui-monospace, monospace";
/**
 * The drive is a beige box leaning back, slot up and towards you, so a disc
 * goes in away from you and downwards and the part left out can be seen.
 */
const DRIVE_W = 1.2, DRIVE_H = .86, DRIVE_D = .62, DRIVE_Y = .74, DRIVE_Z = .45, DRIVE_TILT = .62, SLOT_Y = .14, TAIL = .34;
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

/** The drive's front panel. The slot, light and button are real geometry on top of it. */
function driveFace() {
  return paint(512, 367, g => {
    g.fillStyle = '#ddd2ba'; g.fillRect(0, 0, 512, 367);
    g.strokeStyle = '#1a141038'; g.lineWidth = 3; g.strokeRect(12, 12, 488, 343);
    g.fillStyle = '#1a141026';
    for (let y = 268; y < 340; y += 15) g.fillRect(270, y, 206, 6);
    g.fillStyle = INK; g.font = `700 46px ${DISPLAY}`; g.fillText('A:', 36, 334);
    g.font = `500 16px ${MONO}`; g.fillText('3.5 IN / 1.44 MB', 36, 280);
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

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.localClippingEnabled = true;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y';
  host.append(canvas);

  const scene = new Scene();
  scene.fog = new Fog(PAPER, 8, 18);
  const camera = new PerspectiveCamera(34, 1, .05, 60);
  scene.add(new HemisphereLight(0xfff6e6, 0x8a7a66, 1.9));
  const key = new DirectionalLight(0xfff1dc, 2.6); key.position.set(3, 6, 5); scene.add(key);
  const rim = new DirectionalLight(0xff9a6a, 1.1); rim.position.set(-5, 2, -3); scene.add(rim);

  // The canvas is transparent so the sheet's own paper (fibre, halftone)
  // shows through. The ground only writes depth, so only the shadows show.
  const ground = new Mesh(new PlaneGeometry(40, 40), new MeshBasicMaterial({ colorWrite: false }));
  ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const shadowMap = shadowTexture();

  // Whatever part of a disc is past the drive's front face is cut away, so a
  // disc pushed into the slot really goes in. The plane is set in layout().
  // The second plane keeps the cut to the drive's own width, so the row is never touched.
  const portClip = new Plane(new Vector3(0, 0, 1), 100), sideClip = new Plane(new Vector3(-1, 0, 0), 100);
  const clipping = { clippingPlanes: [portClip, sideClip], clipIntersection: true };

  // The drive. Its front face is at local z = 0 and the slot runs along -z.
  const drive = new Group();
  drive.rotation.x = -DRIVE_TILT;
  const beige = mat('#d6cab0', { roughness: .8 }), trim = mat('#b3a68a', { roughness: .8 });
  const driveBody = new Mesh(new BoxGeometry(DRIVE_W, DRIVE_H, DRIVE_D), beige);
  driveBody.position.z = -DRIVE_D / 2; drive.add(driveBody);
  const panel = new Mesh(new PlaneGeometry(DRIVE_W, DRIVE_H), mat('#ffffff', { map: driveFace(), roughness: .85 }));
  panel.position.z = .002; drive.add(panel);
  const slotW = DISC_W + .1, slotH = .085;
  const slotHole = new Mesh(new PlaneGeometry(slotW, slotH), new MeshBasicMaterial({ color: '#0d0b09' }));
  slotHole.position.set(0, SLOT_Y, .004); drive.add(slotHole);
  // A raised lip round the slot, so it has an edge that catches the light.
  for (const [w, h, x, y] of [
    [slotW + .09, .03, 0, SLOT_Y + slotH / 2 + .015], [slotW + .09, .03, 0, SLOT_Y - slotH / 2 - .015],
    [.03, slotH, -slotW / 2 - .03, SLOT_Y], [.03, slotH, slotW / 2 + .03, SLOT_Y],
  ]) {
    const lip = new Mesh(new BoxGeometry(w, h, .05), trim); lip.position.set(x, y, .012); drive.add(lip);
  }
  const led = mat('#3a2c20', { emissive: new Color(HOT), emissiveIntensity: 0, roughness: .4 });
  const ledMesh = new Mesh(new BoxGeometry(.1, .04, .03), led); ledMesh.position.set(-slotW / 2 + .07, SLOT_Y - .17, .012); drive.add(ledMesh);
  const button = new Mesh(new BoxGeometry(.16, .075, .06), trim); button.position.set(slotW / 2 - .1, SLOT_Y - .18, .02); drive.add(button);
  scene.add(drive);
  const driveShadow = new Mesh(new PlaneGeometry(2.6, 2.6), new MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false, opacity: .7 }));
  driveShadow.rotation.x = -Math.PI / 2; scene.add(driveShadow);
  /** A point given in the drive's own space, in the room. */
  const fromDrive = (x: number, y: number, z: number) => drive.localToWorld(new Vector3(x, y, z));

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
  let spread = 1.15, rowCentre = 0, width = 1, height = 1;
  const DECK_Y = 1, DECK_Z = .8;
  const port = { rect: { left: 0, top: 0, width: 0, height: 0 } as Rect };

  /** Where a point on screen meets the upright plane at depth z. */
  const onPlaneZ = (px: number, py: number, z: number) => {
    const ray = new Raycaster(); ray.setFromCamera(new Vector2(px / width * 2 - 1, 1 - py / height * 2), camera);
    const t = (z - ray.ray.origin.z) / ray.ray.direction.z;
    return ray.ray.at(t, new Vector3());
  };
  const toScreen = (v: Vector3) => { const p = v.clone().project(camera); return new Vector2((p.x + 1) / 2 * width, (1 - p.y) / 2 * height); };

  const layout = () => {
    width = host.clientWidth; height = host.clientHeight;
    if (!width || !height) return;
    const aspect = width / height;
    renderer.setSize(width, height, false);
    camera.aspect = aspect; camera.updateProjectionMatrix();
    home.pos.set(0, 1.5, 5.4 * Math.max(1, 2.1 / aspect));
    camera.position.copy(home.pos); camera.lookAt(home.target); camera.updateMatrixWorld();
    // The drive stands at the right edge of the stage.
    const near = DRIVE_H / 2 * Math.sin(DRIVE_TILT);
    drive.position.set(onPlaneZ(width - 22, toScreen(new Vector3(0, DRIVE_Y, DRIVE_Z + near)).y, DRIVE_Z + near).x - DRIVE_W / 2, DRIVE_Y, DRIVE_Z);
    drive.updateMatrixWorld(true);
    driveShadow.position.set(drive.position.x, .004, DRIVE_Z - .1);
    portClip.setFromNormalAndCoplanarPoint(new Vector3(0, 0, 1).applyQuaternion(drive.quaternion), drive.position);
    sideClip.constant = drive.position.x - DRIVE_W / 2;
    // Its outline on screen: the page that boots up stops short of it.
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const x of [-DRIVE_W / 2, DRIVE_W / 2]) for (const y of [-DRIVE_H / 2, DRIVE_H / 2]) for (const z of [0, -DRIVE_D]) {
      const p = toScreen(fromDrive(x, y, z));
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
    port.rect = { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
    // The row takes what is left: centred if it fits, moved over or closed up if not.
    const rowY = toScreen(new Vector3(0, DECK_Y, DECK_Z)).y;
    const right = onPlaneZ(minX - 30, rowY, DECK_Z).x, left = onPlaneZ(24, rowY, DECK_Z).x;
    spread = Math.min(1.2, Math.max(.95, (right - left - DISC_W) / 3));
    const half = 1.5 * spread + DISC_W / 2;
    rowCentre = Math.max(left + half, Math.min(0, right - half));
    events.onLayout();
    wake();
  };
  const deckPose = (d: Disc): Pose => ({ pos: new Vector3(rowCentre + (d.index - 1.5) * spread, DECK_Y, DECK_Z), quat: new Quaternion().setFromEuler(new Euler(-.1, 0, 0)) });
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

  // Lined up with the slot: label to you, shutter edge pointing away from you
  // into the drive. `inside` leaves the tail of the disc sticking out of the
  // slot; `click` is a touch further in, where the drive catches it.
  const slotPose = () => {
    const depth = TAIL - DISC_H / 2;
    return {
      pre: fromDrive(0, SLOT_Y, DISC_H / 2 + .6), mouth: fromDrive(0, SLOT_Y, DISC_H / 2 + .03),
      inside: fromDrive(0, SLOT_Y, depth), click: fromDrive(0, SLOT_Y, depth - .08),
      quat: drive.quaternion.clone().multiply(X(-Math.PI / 2)).multiply(Y(Math.PI)),
    };
  };
  /** A disc sitting in the drive. */
  const seat = (d: Disc) => {
    const slot = slotPose();
    d.group.position.copy(slot.inside); d.group.quaternion.copy(slot.quat); d.group.scale.setScalar(1);
    d.group.visible = true; d.shadow.visible = true;
  };
  const seated = (d: Disc) => d === selected && (phase === 'loading' || phase === 'screen');

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
    // Out of your hand: it turns shutter-first, travels away from you to the
    // mouth of the slot, waits a breath, and is pushed home.
    const approach = new Vector3().lerpVectors(fromPos, slot.pre, .4).add(new Vector3(0, .25, .5));
    d.tween = {
      start: now(), duration: 2.2,
      step(u) {
        d.group.scale.setScalar(1);
        if (u < .52) {
          bezier(fromPos, approach, slot.pre, inOut(u / .52), d.group.position);
          d.group.quaternion.slerpQuaternions(fromQuat, slot.quat, inOut(span(u, .02, .44)));
          return;
        }
        d.group.quaternion.copy(slot.quat);
        if (u < .66) d.group.position.lerpVectors(slot.pre, slot.mouth, inOut(span(u, .52, .66)));
        else if (u < .9) d.group.position.lerpVectors(slot.mouth, slot.click, inOut(span(u, .7, .9)));
        else d.group.position.lerpVectors(slot.click, slot.inside, outBack(span(u, .9, 1)));
      },
      done() {
        seat(d); setPhase('loading');
        loading = setTimeout(() => setPhase('screen'), 950);
      },
    };
  };
  const eject = () => {
    const d = selected;
    if (!d || (phase !== 'screen' && phase !== 'loading')) return;
    clearTimeout(loading);
    setPhase('moving');
    seat(d);
    const slot = slotPose(), rest = deckPose(d);
    const lift = new Vector3().addVectors(slot.pre, rest.pos).multiplyScalar(.5).add(new Vector3(0, .9, .6));
    d.tween = {
      start: now() + .15, duration: 1.6,
      step(u) {
        // Pressed in a touch, then the drive pushes the disc back out to you.
        if (u < .1) { d.group.position.lerpVectors(slot.inside, slot.click, inOut(u / .1)); d.group.quaternion.copy(slot.quat); return; }
        if (u < .3) { d.group.position.lerpVectors(slot.click, slot.pre, outBack(span(u, .1, .3))); d.group.quaternion.copy(slot.quat); return; }
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
    selected = d; seat(d);
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
      } else if (seated(d)) {
        // In the drive: it stays where the slot holds it.
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

    // The drive light flickers while it reads and stays on once the page is up.
    led.emissiveIntensity = phase === 'loading' ? (Math.sin(t * 38) > 0 ? 1.8 : .2) : phase === 'screen' ? 1.4 : 0;
    button.position.z = phase === 'loading' || phase === 'screen' ? .004 : .02;

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
    /** The drive's outline on the stage, in CSS pixels. */
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
